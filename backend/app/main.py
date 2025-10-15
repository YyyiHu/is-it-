"""FastAPI application factory and configuration."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routers import epigram as epigram_router
from app.routers import auth as auth_router
from app.routers import user_settings as user_settings_router
from app.db import async_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    yield
    await async_engine.dispose()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="Is It", 
        docs_url="/docs", 
        openapi_url="/openapi.json",
        lifespan=lifespan
    )

    api_router = APIRouter(prefix="/api")
    cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE", "PUT"],
        allow_headers=["*"],
    )

    @application.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy"}

    api_router.include_router(epigram_router.router)
    api_router.include_router(auth_router.router)
    api_router.include_router(user_settings_router.router)
    application.include_router(api_router)

    return application


app = create_app()
