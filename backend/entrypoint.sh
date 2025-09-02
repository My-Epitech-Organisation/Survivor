#!/bin/sh

echo "Lancement des migrations..."
python manage.py migrate --noinput

echo "Démarrage du serveur..."
exec "$@"
