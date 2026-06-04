from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio
import json
from backend.core.database import get_db, AsyncSessionLocal
from backend.core.security import get_current_user
from backend.models.account import Account
from backend.models.position import Position
from backend.services.copy_service import CopyService

router = APIRouter()
_copy_tasks: dict[int, asyncio.Task] = {}

@router.post("/start")
async def start_copying(user_id: int = Depends(get_current_user)):
    if user_id not in _copy_tasks or _copy_tasks[user_id].done():
        _copy_tasks[user_id] = asyncio.create_task(copy_loop(user_id))
    return {"message": "Copy Engine gestartet"}

@router.post("/stop")
async def stop_copying(user_id: int = Depends(get_current_user)):
    if user_id in _copy_tasks:
        _copy_tasks[user_id].cancel()
    return {"message": "Copy Engine gestoppt"}

@router.post("/flatten-all")
async def flatten_all(user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    acc_result = await db.execute(select(Account).where(Account.user_id == user_id))
    accounts = acc_result.scalars().all()
    for acc in accounts:
        await CopyService(acc).flatten_all()
    return {"message": f"{len(accounts)} Accounts geflattened"}

@router.post("/disable-all-followers")
async def disable_all_followers(user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    acc_result = await db.execute(select(Account).where(Account.user_id == user_id, Account.is_leader == False))
    accounts = acc_result.scalars().all()
    for acc in accounts:
        acc.is_active = False
    await db.commit()
    return {"message": f"{len(accounts)} Follower deaktiviert"}

@router.post("/enable-all-followers")
async def enable_all_followers(user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    acc_result = await db.execute(select(Account).where(Account.user_id == user_id, Account.is_leader == False))
    accounts = acc_result.scalars().all()
    for acc in accounts:
        acc.is_active = True
    await db.commit()
    return {"message": f"{len(accounts)} Follower aktiviert"}

@router.post("/test-position")
async def add_test_position(user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    leader_result = await db.execute(select(Account).where(Account.user_id == user_id, Account.is_leader == True))
    leader = leader_result.scalar_one_or_none()
    if not leader:
        from fastapi import HTTPException
        raise HTTPException(404, "Kein Leader gesetzt")
    pos = Position(account_id=leader.id, symbol="MNQZ5", side="long", qty=1.0, avg_price=21248.50, open_pnl=150.0, day_pnl=150.0, sl=21200.0, tp=21350.0, is_open=True)
    db.add(pos)
    await db.commit()
    return {"message": f"Test-Position mit SL/TP beim Leader #{leader.id} hinzugefuegt"}

@router.delete("/test-position")
async def remove_test_positions(user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    leader_result = await db.execute(select(Account).where(Account.user_id == user_id, Account.is_leader == True))
    leader = leader_result.scalar_one_or_none()
    if not leader:
        from fastapi import HTTPException
        raise HTTPException(404, "Kein Leader gesetzt")
    pos_result = await db.execute(select(Position).where(Position.account_id == leader.id))
    positions = pos_result.scalars().all()
    for p in positions:
        await db.delete(p)
    await db.commit()
    return {"message": f"{len(positions)} Positionen geloescht"}

@router.websocket("/ws/{user_id}")
async def websocket_positions(websocket: WebSocket, user_id: int):
    await websocket.accept()
    try:
        while True:
            async with AsyncSessionLocal() as db:
                acc_result = await db.execute(select(Account).where(Account.user_id == user_id))
                accounts = acc_result.scalars().all()
                pos_result = await db.execute(select(Position).where(
                    Position.account_id.in_([a.id for a in accounts]),
                    Position.is_open == True,
                ))
                positions = pos_result.scalars().all()
            await websocket.send_text(json.dumps({
                "positions": [{"id": p.id, "account_id": p.account_id, "symbol": p.symbol, "side": p.side, "qty": p.qty, "avg_price": p.avg_price, "open_pnl": p.open_pnl, "day_pnl": p.day_pnl, "sl": p.sl, "tp": p.tp} for p in positions],
                "accounts": [{"id": a.id, "label": a.label, "is_active": a.is_active, "is_leader": a.is_leader, "balance": a.balance, "day_pnl": a.day_pnl, "open_pnl": a.open_pnl} for a in accounts],
            }))
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass

async def copy_loop(user_id: int):
    """Laeuft alle 200ms - kopiert Trades, SL und TP sofort."""
    while True:
        try:
            async with AsyncSessionLocal() as db:
                leader = (await db.execute(
                    select(Account).where(Account.user_id == user_id, Account.is_leader == True)
                )).scalar_one_or_none()

                if not leader:
                    await asyncio.sleep(1)
                    continue

                followers = (await db.execute(
                    select(Account).where(
                        Account.user_id == user_id,
                        Account.is_leader == False,
                        Account.is_active == True,
                    )
                )).scalars().all()

                leader_service = CopyService(leader)
                leader_positions = await leader_service.get_positions()

                for follower in followers:
                    await CopyService(follower).sync_positions(leader_positions)

        except Exception as e:
            print(f"[CopyEngine] Fehler: {e}")

        await asyncio.sleep(0.2)  # 200ms Polling
