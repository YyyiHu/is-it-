"""
Main entry point for the Is it API backend.
"""

from fastapi import FastAPI

# Create the FastAPI application instance
app = FastAPI(title="Is it API")


@app.get("/health")
def health():
    """
    Health check endpoint.

    Returns:
        dict: A simple JSON response confirming the API is operational.
    """
    return {"status": "ok"}
