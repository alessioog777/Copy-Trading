from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from backend.core.database import get_db
from backend.core.security import hash_password, verify_password, create_access_token
from backend.models.user import User

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where((User.email == body.email) | (User.username == body.username)))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email oder Username bereits vergeben")
    user = User(email=body.email, username=body.username, password=hash_password(body.password))
    db.add(user)
    await db.commit()
    return {"message": "Account erstellt"}

@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email oder Passwort falsch")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, username=user.username)
