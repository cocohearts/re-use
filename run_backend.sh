#!/bin/sh

DIR="$(realpath "$(dirname "$0")")"
cd "$DIR" || exit 1
. "$DIR/backend/venv/bin/activate"

uvicorn backend.main:app --reload
