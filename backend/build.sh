#!/usr/bin/env bash
# Render build script
set -o errexit

pip install -r requirements/production.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput
