from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from pydantic import BaseModel
from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models.position import Position
from backend.models.account import Account

router = APIRouter()

class PositionOut(BaseModel):
    id: int
    account_id: int
    symbol: str
    side: str
    qty: float
    avg_price: float
    open_pnl: float
    day_pnl: float
    is_open: bool
    opened_at: datetime
    model_config = {"from_attributes": True}

@router.get("/", response_model=list[PositionOut])
async def get_all_positions(user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    acc_result = await db.execute(select(Account.id).where(Account.user_id == user_id))
    account_ids = [row[0] for row in acc_result.all()]
    if not account_ids:
        return []
    result = await db.execute(select(Position).where(Position.account_id.in_(account_ids), Position.is_open == True))
    return result.scalars().all()
