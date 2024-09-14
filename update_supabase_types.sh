#!/bin/sh

DIR="$(realpath "$(dirname "$0")")"
. "$DIR/.env"

cd "$DIR/frontend" || exit 1
npx supabase gen types --lang=typescript --project-id "$PROJECT_REF" > database.types.ts
