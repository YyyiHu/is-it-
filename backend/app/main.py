"""
FastAPI application entry point for v1.

This module builds the app through a factory to keep configuration tidy.
"""

import os
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routers import epigram as epigram_router
from app.routers import auth as auth_router
from app.routers import user_settings as user_settings_router


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns
    -------
    FastAPI
        The configured application instance.
    """
    application = FastAPI(title="Is It", docs_url="/docs", openapi_url="/openapi.json")

    # Create API router with /api prefix
    api_router = APIRouter(prefix="/api")

    # Get CORS origins from environment variable
    cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE", "PUT"],  # Added PUT for user settings
        allow_headers=["*"],
    )

    # Removed ClientIdMiddleware as it's no longer needed with JWT authentication

    # Add health check endpoint
    @application.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy"}

    # Include all routers under the API router
    api_router.include_router(epigram_router.router)
    api_router.include_router(auth_router.router)
    api_router.include_router(user_settings_router.router)

    # Include the API router in the main application
    application.include_router(api_router)

    return application


# Uvicorn entry point exposed as a module global
app = create_app()
