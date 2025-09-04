#!/bin/bash
set -e

echo "Starting migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

echo "Starting the server..."
exec "$@"
