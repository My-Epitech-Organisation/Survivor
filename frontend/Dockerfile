# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copier le fichier package.json
COPY package.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Build de production
RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Exposer le port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Démarrer le serveur de production
CMD ["node", "server.js"]
