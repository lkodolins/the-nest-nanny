#!/bin/bash
set -e

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
    echo "Running migrations..."
    python manage.py migrate --noinput || true
fi

if [ "${RUN_COLLECTSTATIC:-1}" = "1" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput 2>/dev/null || true
fi

echo "Starting server..."
exec "$@"
