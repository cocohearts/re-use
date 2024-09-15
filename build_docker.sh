#!/bin/sh

DIR="$(realpath "$(dirname "$0")")"
cd "$DIR" || exit 1

set -x

docker build $(cat "$DIR/.env" | sed 's/^/--build-arg /g') -t reuse:latest .
