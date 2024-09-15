#!/bin/sh

DIR="$(realpath "$(dirname "$0")")"
cd "$DIR" || exit 1

set -x

docker build -t reuse:latest $(cat "$DIR/.env" | sed 's/^/--build-arg /g') .
