#!/bin/sh

echo "Starting migrations..."
python manage.py migrate --noinput

echo "Starting the server..."
exec "$@"
