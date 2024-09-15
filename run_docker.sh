DIR="$(realpath "$(dirname "$0")")"
cd "$DIR" || exit 1

docker run --env-file "$DIR/.env" -p 80:8000 --rm reuse:latest
