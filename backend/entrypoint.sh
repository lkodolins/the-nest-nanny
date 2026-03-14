#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "import socket; s = socket.create_connection(('db', 5432), timeout=2); s.close()" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL is ready"

echo "Waiting for Redis..."
while ! python -c "import socket; s = socket.create_connection(('redis', 6379), timeout=2); s.close()" 2>/dev/null; do
    sleep 1
done
echo "Redis is ready"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Seeding data..."
python manage.py seed_data

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

echo "Starting server..."
exec "$@"
