#!/usr/bin/env bash

# Exit on error
set -e

# Start FastAPI with Uvicorn on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000
