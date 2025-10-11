"""
FastAPI application entry point for v1.

This module builds the app through a factory to keep configuration tidy.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.middleware.client_id import ClientIdMiddleware
from app.routers import epigram as epigram_router


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns
    -------
    FastAPI
        The configured application instance.
    """
    application = FastAPI(title="Is It")

    # Get CORS origins from environment variable
    cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["*"],
    )

    application.add_middleware(ClientIdMiddleware)

    # Add health check endpoint
    @application.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy"}

    application.include_router(epigram_router.router)

    return application


# Uvicorn entry point exposed as a module global
app = create_app()
