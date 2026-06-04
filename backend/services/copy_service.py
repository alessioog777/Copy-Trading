from backend.models.account import Account
from backend.core.database import AsyncSessionLocal
from backend.models.position import Position
from sqlalchemy import select
from datetime import datetime, timezone


class CopyService:
    def __init__(self, account: Account):
        self.account = account
        self._impl = self._get_impl()

    def _get_impl(self):
        broker = self.account.broker.lower()
        if broker == "paper": return PaperBroker(self.account)
        elif broker == "mt4": return MT4Broker(self.account)
        elif broker == "mt5": return MT5Broker(self.account)
        elif broker == "tradelocker": return TradeLockerBroker(self.account)
        else: raise ValueError(f"Unbekannter Broker: {broker}")

    async def get_positions(self): return await self._impl.get_positions()
    async def place_order(self, symbol, side, qty, avg_price=0.0, open_pnl=0.0, sl=None, tp=None): return await self._impl.place_order(symbol, side, qty, avg_price, open_pnl, sl, tp)
    async def close_position(self, pid): return await self._impl.close_position(pid)
    async def update_sl_tp(self, pid, sl, tp): return await self._impl.update_sl_tp(pid, sl, tp)
    async def update_pnl(self, pid, avg_price, open_pnl): return await self._impl.update_pnl(pid, avg_price, open_pnl)
    async def flatten_all(self): return await self._impl.flatten_all()

    async def sync_positions(self, leader_positions: list[dict]):
        my_positions = await self.get_positions()
        my_by_symbol = {p["symbol"]: p for p in my_positions}
        leader_by_symbol = {p["symbol"]: p for p in leader_positions}

        for symbol, lpos in leader_by_symbol.items():
            if symbol not in my_by_symbol:
                await self.place_order(
                    lpos["symbol"], lpos["side"],
                    lpos["qty"] * self.account.ratio,
                    avg_price=lpos.get("avg_price", 0.0),
                    open_pnl=lpos.get("open_pnl", 0.0),
                    sl=lpos.get("sl"),
                    tp=lpos.get("tp"),
                )

        for symbol, mpos in my_by_symbol.items():
            if symbol not in leader_by_symbol:
                await self.close_position(mpos["id"])

        for symbol, lpos in leader_by_symbol.items():
            if symbol in my_by_symbol:
                mpos = my_by_symbol[symbol]
                # SL/TP updaten
                if lpos.get("sl") != mpos.get("sl") or lpos.get("tp") != mpos.get("tp"):
                    await self.update_sl_tp(mpos["id"], lpos.get("sl"), lpos.get("tp"))
                # PnL und Preis updaten
                await self.update_pnl(mpos["id"], lpos.get("avg_price", 0.0), lpos.get("open_pnl", 0.0))


class PaperBroker:
    def __init__(self, account: Account):
        self.account = account

    async def get_positions(self) -> list[dict]:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Position).where(Position.account_id == self.account.id, Position.is_open == True))
            return [{"id": str(p.id), "symbol": p.symbol, "side": p.side, "qty": p.qty, "avg_price": p.avg_price, "open_pnl": p.open_pnl, "sl": p.sl, "tp": p.tp} for p in result.scalars().all()]

    async def place_order(self, symbol, side, qty, avg_price=0.0, open_pnl=0.0, sl=None, tp=None):
        async with AsyncSessionLocal() as db:
            pos = Position(account_id=self.account.id, symbol=symbol, side=side, qty=qty, avg_price=avg_price, open_pnl=open_pnl, day_pnl=open_pnl, is_open=True, sl=sl, tp=tp)
            db.add(pos)
            await db.commit()
            await db.refresh(pos)
            return {"id": str(pos.id), "symbol": symbol, "side": side, "qty": qty, "avg_price": avg_price, "open_pnl": open_pnl, "sl": sl, "tp": tp}

    async def close_position(self, position_id):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Position).where(Position.id == int(position_id)))
            pos = result.scalar_one_or_none()
            if pos:
                pos.is_open = False
                pos.closed_at = datetime.now(timezone.utc)
                await db.commit()
        return True

    async def update_sl_tp(self, position_id, sl, tp):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Position).where(Position.id == int(position_id)))
            pos = result.scalar_one_or_none()
            if pos:
                pos.sl = sl
                pos.tp = tp
                await db.commit()
        return True

    async def update_pnl(self, position_id, avg_price, open_pnl):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Position).where(Position.id == int(position_id)))
            pos = result.scalar_one_or_none()
            if pos:
                pos.avg_price = avg_price
                pos.open_pnl = open_pnl
                pos.day_pnl = open_pnl
                await db.commit()
        return True

    async def flatten_all(self):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Position).where(Position.account_id == self.account.id, Position.is_open == True))
            for pos in result.scalars().all():
                pos.is_open = False
                pos.closed_at = datetime.now(timezone.utc)
            await db.commit()
        return True


class TradeLockerBroker:
    def __init__(self, account): self.account = account; self._tl = None

    async def _get_client(self):
        if self._tl is None:
            from tradelocker import TLAPI
            self._tl = TLAPI(environment="live", username=self.account.api_key, password=self.account.api_secret, server=self.account.account_id)
        return self._tl

    async def get_positions(self):
        tl = await self._get_client()
        return [{"id": str(p.id), "symbol": p.tradableInstrumentId, "side": "long" if p.side == "buy" else "short", "qty": float(p.qty), "avg_price": float(p.avgPrice), "open_pnl": float(p.unrealizedPl) if hasattr(p, "unrealizedPl") else 0.0, "sl": float(p.stopLoss) if hasattr(p, "stopLoss") and p.stopLoss else None, "tp": float(p.takeProfit) if hasattr(p, "takeProfit") and p.takeProfit else None} for p in tl.get_all_positions().itertuples()]

    async def place_order(self, symbol, side, qty, avg_price=0.0, open_pnl=0.0, sl=None, tp=None):
        tl = await self._get_client()
        order_id = tl.create_order(symbol=symbol, quantity=qty, side="buy" if side == "long" else "sell", type_="market", stop_loss=sl, take_profit=tp)
        return {"id": str(order_id), "symbol": symbol, "side": side, "qty": qty}

    async def close_position(self, position_id):
        tl = await self._get_client()
        tl.close_position(position_id=int(position_id))
        return True

    async def update_sl_tp(self, position_id, sl, tp):
        tl = await self._get_client()
        tl.modify_position(position_id=int(position_id), stop_loss=sl, take_profit=tp)
        return True

    async def update_pnl(self, position_id, avg_price, open_pnl):
        return True  # TradeLocker aktualisiert PnL selbst

    async def flatten_all(self):
        tl = await self._get_client()
        for pos in tl.get_all_positions().itertuples():
            tl.close_position(position_id=pos.id)
        return True


class MT4Broker:
    def __init__(self, account): self.account = account
    async def get_positions(self): raise NotImplementedError()
    async def place_order(self, s, si, q, avg_price=0.0, open_pnl=0.0, sl=None, tp=None): raise NotImplementedError()
    async def close_position(self, pid): raise NotImplementedError()
    async def update_sl_tp(self, pid, sl, tp): raise NotImplementedError()
    async def update_pnl(self, pid, avg_price, open_pnl): raise NotImplementedError()
    async def flatten_all(self): raise NotImplementedError()


class MT5Broker:
    def __init__(self, account): self.account = account
    async def get_positions(self): raise NotImplementedError()
    async def place_order(self, s, si, q, avg_price=0.0, open_pnl=0.0, sl=None, tp=None): raise NotImplementedError()
    async def close_position(self, pid): raise NotImplementedError()
    async def update_sl_tp(self, pid, sl, tp): raise NotImplementedError()
    async def update_pnl(self, pid, avg_price, open_pnl): raise NotImplementedError()
    async def flatten_all(self): raise NotImplementedError()
