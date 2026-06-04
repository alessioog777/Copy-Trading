from backend.models.account import Account


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


class TradeLockerBroker:
    """
    TradeLocker Broker via offizielles Python Package.
    account.api_key    = Email
    account.api_secret = Passwort
    account.account_id = Server (z.B. "PINEX")
    """

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
        result = []
        for pos in positions.itertuples():
            result.append({
                "id": str(pos.id),
                "symbol": pos.tradableInstrumentId,
                "side": "long" if pos.side == "buy" else "short",
                "qty": float(pos.qty),
                "avg_price": float(pos.avgPrice),
                "open_pnl": float(pos.unrealizedPl) if hasattr(pos, "unrealizedPl") else 0.0,
            })
        return result

    async def place_order(self, symbol: str, side: str, qty: float) -> dict:
        tl = await self._get_client()
        order_side = "buy" if side == "long" else "sell"
        order_id = tl.create_order(
            symbol=symbol,
            quantity=qty,
            side=order_side,
            type_="market",
        )
        return {"id": str(order_id), "symbol": symbol, "side": side, "qty": qty}

    async def close_position(self, position_id: str) -> bool:
        tl = await self._get_client()
        tl.close_position(position_id=int(position_id))
        return True

    async def flatten_all(self) -> bool:
        tl = await self._get_client()
        positions = tl.get_all_positions()
        for pos in positions.itertuples():
            tl.close_position(position_id=pos.id)
        return True


class PaperBroker:
    _positions: dict = {}
    def __init__(self, account):
        self.account = account
        if str(account.id) not in self._positions:
            self._positions[str(account.id)] = []
    def _key(self): return str(self.account.id)
    async def get_positions(self): return self._positions[self._key()]
    async def place_order(self, symbol, side, qty):
        pos = {"id": f"paper-{symbol}-{side}", "symbol": symbol, "side": side, "qty": qty}
        self._positions[self._key()].append(pos)
        return pos
    async def close_position(self, pid):
        self._positions[self._key()] = [p for p in self._positions[self._key()] if p["id"] != pid]
        return True
    async def flatten_all(self):
        self._positions[self._key()] = []
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
