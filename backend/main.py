from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.core.database import init_db
from backend.routers import auth, accounts, positions, copy_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Copy Trading API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:1420", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",      tags=["Auth"])
app.include_router(accounts.router,    prefix="/api/accounts",  tags=["Accounts"])
app.include_router(positions.router,   prefix="/api/positions", tags=["Positions"])
app.include_router(copy_engine.router, prefix="/api/copy",      tags=["Copy Engine"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
