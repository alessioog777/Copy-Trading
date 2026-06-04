from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models.account import Account

router = APIRouter()

class AccountCreate(BaseModel):
    label: str
    broker: str
    account_id: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    ratio: float = 1.0

class AccountOut(BaseModel):
    id: int
    label: str
    broker: str
    account_id: str
    is_leader: bool
    is_active: bool
    balance: float
    day_pnl: float
    open_pnl: float
    ratio: float
    model_config = {"from_attributes": True}

@router.get("/", response_model=list[AccountOut])
async def get_accounts(user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).where(Account.user_id == user_id))
    return result.scalars().all()

@router.post("/", response_model=AccountOut, status_code=201)
async def add_account(body: AccountCreate, user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    account = Account(user_id=user_id, **body.model_dump())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account

@router.patch("/{account_id}/toggle")
async def toggle_account(account_id: int, user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    acc = await _get_account(account_id, user_id, db)
    acc.is_active = not acc.is_active
    await db.commit()
    return {"id": acc.id, "is_active": acc.is_active}

@router.patch("/{account_id}/set-leader")
async def set_leader(account_id: int, user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).where(Account.user_id == user_id))
    for acc in result.scalars().all():
        acc.is_leader = acc.id == account_id
    await db.commit()
    return {"leader_id": account_id}

@router.delete("/{account_id}", status_code=204)
async def delete_account(account_id: int, user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    acc = await _get_account(account_id, user_id, db)
    await db.delete(acc)
    await db.commit()

async def _get_account(account_id: int, user_id: int, db: AsyncSession) -> Account:
    result = await db.execute(select(Account).where(Account.id == account_id, Account.user_id == user_id))
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(404, "Account nicht gefunden")
    return acc
