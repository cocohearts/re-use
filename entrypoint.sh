#!/bin/sh

export DIST_PATH=/app/dist
/app/venv/bin/uvicorn --host 0.0.0.0 backend.main:app
