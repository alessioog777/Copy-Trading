from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func
from backend.core.database import Base

class Position(Base):
    __tablename__ = "positions"
    id            = Column(Integer, primary_key=True, index=True)
    account_id    = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    symbol        = Column(String, nullable=False)
    side          = Column(String, nullable=False)
    qty           = Column(Float, nullable=False)
    avg_price     = Column(Float, nullable=False)
    open_pnl      = Column(Float, default=0.0)
    day_pnl       = Column(Float, default=0.0)
    is_open       = Column(Boolean, default=True)
    source_pos_id = Column(String, nullable=True)
    opened_at     = Column(DateTime, server_default=func.now())
    closed_at     = Column(DateTime, nullable=True)
