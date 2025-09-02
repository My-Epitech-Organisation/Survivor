# Utilise une image Python officielle comme base
FROM python:3.11-slim

# Définir les variables d'environnement pour le développement
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV VIRTUAL_ENV=/opt/venv
ENV DJANGO_DEBUG=True
ENV DJANGO_ENV=development

# Installer les dépendances système
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Créer et activer l'environnement virtuel
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de requirements
COPY requirement.txt .

# Installer les dépendances Python dans le venv
RUN pip install --upgrade pip \
    && pip install -r requirement.txt \
    && pip install uvicorn

# Copier le code de l'application
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app \
    && chown -R appuser:appuser $VIRTUAL_ENV

USER appuser

# Exposer le port
EXPOSE 8000

# Mode développement - commande avec auto-reload
CMD ["uvicorn", "backend.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--reload"]