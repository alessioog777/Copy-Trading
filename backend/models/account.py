from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, func
from backend.core.database import Base

class Account(Base):
    __tablename__ = "accounts"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    label      = Column(String, nullable=False)
    broker     = Column(String, nullable=False)
    account_id = Column(String, nullable=False)
    api_key    = Column(String, nullable=True)
    api_secret = Column(String, nullable=True)
    is_leader  = Column(Boolean, default=False)
    is_active  = Column(Boolean, default=True)
    balance    = Column(Float, default=0.0)
    day_pnl    = Column(Float, default=0.0)
    open_pnl   = Column(Float, default=0.0)
    ratio      = Column(Float, default=1.0)
    created_at = Column(DateTime, server_default=func.now())
