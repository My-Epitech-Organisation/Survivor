#!/bin/bash
set -e

# Handle signals
trap 'echo "Received SIGINT/SIGTERM, shutting down gracefully..."; exit' SIGINT SIGTERM

echo "Starting migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

echo "Starting the server..."
exec "$@"
