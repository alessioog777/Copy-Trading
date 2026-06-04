from sqlalchemy import Column, Integer, String, DateTime, func
from backend.core.database import Base

class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String, unique=True, index=True, nullable=False)
    username   = Column(String, unique=True, index=True, nullable=False)
    password   = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
