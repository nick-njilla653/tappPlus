FROM node:18-slim

# Installer les dépendances nécessaires pour Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Installer les dépendances (incluant devDependencies pour le build)
RUN npm ci

# Copier le code source
COPY apps/api/ ./

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application
RUN npm run build

# Vérifier que le build a réussi
RUN ls -la dist/ && echo "Build réussi, fichiers dans dist:" && find dist/ -name "*.js" -type f

# Exposer le port
EXPOSE 5550

# Commande par défaut
CMD ["node", "dist/main.js"]
