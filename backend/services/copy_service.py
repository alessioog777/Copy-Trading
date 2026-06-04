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
    async def place_order(self, symbol, side, qty): return await self._impl.place_order(symbol, side, qty)
    async def close_position(self, pid): return await self._impl.close_position(pid)
    async def flatten_all(self): return await self._impl.flatten_all()

    async def sync_positions(self, leader_positions):
        my_positions = await self.get_positions()
        my_symbols = {p["symbol"] for p in my_positions}
        leader_symbols = {p["symbol"] for p in leader_positions}
        for pos in leader_positions:
            if pos["symbol"] not in my_symbols:
                await self.place_order(pos["symbol"], pos["side"], pos["qty"] * self.account.ratio)
        for pos in my_positions:
            if pos["symbol"] not in leader_symbols:
                await self.close_position(pos["id"])


class PaperBroker:
    """Liest und schreibt Positionen direkt in die DB."""

    def __init__(self, account: Account):
        self.account = account

    async def get_positions(self) -> list[dict]:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Position).where(
                    Position.account_id == self.account.id,
                    Position.is_open == True,
                )
            )
            positions = result.scalars().all()
            return [{"id": str(p.id), "symbol": p.symbol, "side": p.side, "qty": p.qty, "avg_price": p.avg_price, "open_pnl": p.open_pnl} for p in positions]

    async def place_order(self, symbol: str, side: str, qty: float) -> dict:
        async with AsyncSessionLocal() as db:
            pos = Position(
                account_id=self.account.id,
                symbol=symbol,
                side=side,
                qty=qty,
                avg_price=0.0,
                open_pnl=0.0,
                day_pnl=0.0,
                is_open=True,
            )
            db.add(pos)
            await db.commit()
            await db.refresh(pos)
            print(f"[Paper] {self.account.label}: OPEN {qty}x {symbol} {side}")
            return {"id": str(pos.id), "symbol": symbol, "side": side, "qty": qty}

    async def close_position(self, position_id: str) -> bool:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Position).where(Position.id == int(position_id)))
            pos = result.scalar_one_or_none()
            if pos:
                pos.is_open = False
                pos.closed_at = datetime.now(timezone.utc)
                await db.commit()
            print(f"[Paper] {self.account.label}: CLOSE {position_id}")
            return True

    async def flatten_all(self) -> bool:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Position).where(Position.account_id == self.account.id, Position.is_open == True))
            positions = result.scalars().all()
            for pos in positions:
                pos.is_open = False
                pos.closed_at = datetime.now(timezone.utc)
            await db.commit()
            print(f"[Paper] {self.account.label}: FLATTEN ALL")
            return True


class TradeLockerBroker:
    def __init__(self, account: Account):
        self.account = account
        self._tl = None

    async def _get_client(self):
        if self._tl is None:
            from tradelocker import TLAPI
            self._tl = TLAPI(
                environment="live",
                username=self.account.api_key,
                password=self.account.api_secret,
                server=self.account.account_id,
            )
        return self._tl

    async def get_positions(self) -> list[dict]:
        tl = await self._get_client()
        positions = tl.get_all_positions()
        return [{"id": str(pos.id), "symbol": pos.tradableInstrumentId, "side": "long" if pos.side == "buy" else "short", "qty": float(pos.qty), "avg_price": float(pos.avgPrice), "open_pnl": float(pos.unrealizedPl) if hasattr(pos, "unrealizedPl") else 0.0} for pos in positions.itertuples()]

    async def place_order(self, symbol, side, qty):
        tl = await self._get_client()
        order_id = tl.create_order(symbol=symbol, quantity=qty, side="buy" if side == "long" else "sell", type_="market")
        return {"id": str(order_id), "symbol": symbol, "side": side, "qty": qty}

    async def close_position(self, position_id):
        tl = await self._get_client()
        tl.close_position(position_id=int(position_id))
        return True

    async def flatten_all(self):
        tl = await self._get_client()
        positions = tl.get_all_positions()
        for pos in positions.itertuples():
            tl.close_position(position_id=pos.id)
        return True


class MT4Broker:
    def __init__(self, account): self.account = account
    async def get_positions(self): raise NotImplementedError("MT4 noch nicht implementiert")
    async def place_order(self, s, si, q): raise NotImplementedError()
    async def close_position(self, pid): raise NotImplementedError()
    async def flatten_all(self): raise NotImplementedError()


class MT5Broker:
    def __init__(self, account): self.account = account
    async def get_positions(self): raise NotImplementedError("MT5 noch nicht implementiert")
    async def place_order(self, s, si, q): raise NotImplementedError()
    async def close_position(self, pid): raise NotImplementedError()
    async def flatten_all(self): raise NotImplementedError()
