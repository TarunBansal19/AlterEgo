import logging
import asyncio
from contextlib import asynccontextmanager 
from fastapi import FastAPI
from database import create_tables
from routes import router
from fastapi.middleware.cors import CORSMiddleware
from services.cleanup import cleanup_expired_headshots

@asynccontextmanager 
async def lifespan(app: FastAPI):
    # Startup code 
    create_tables()
    
    # Start background cleanup task
    cleanup_task = asyncio.create_task(cleanup_expired_headshots())
    
    yield
    
    # Clean up on shutdown
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="AI Avatar Branding API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(router)