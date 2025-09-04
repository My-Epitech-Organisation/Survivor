FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

# Installer Chromium et dépendances nécessaires pour Puppeteer
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    # Supprimé dbus qui cause des problèmes
    # Ajouté des dépendances minimales requises
    eudev \
    ttf-liberation \
    libstdc++ \
    && rm -rf /var/cache/apk/*

# Vérifier l'installation et la version de Chromium
RUN chromium-browser --version

# Configuration de Puppeteer pour utiliser Chromium d'Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV DOCKER_ENV=true
ENV NODE_ENV=production

# Créer l'utilisateur nextjs et configurer les permissions
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers de l'application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Créer et configurer le répertoire de cache pour Puppeteer avec les bonnes permissions
RUN mkdir -p /home/nextjs/.cache/puppeteer && \
    chown -R nextjs:nodejs /home/nextjs/.cache && \
    chmod -R 777 /home/nextjs/.cache

# Assurer que le chromium est accessible à l'utilisateur nextjs
RUN chmod -R 755 /usr/bin/chromium-browser && \
    chmod 755 /usr/bin

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]