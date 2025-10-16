#!/bin/bash

# ===========================================
# TAPP+ - Script de déploiement SIMPLIFIÉ
# ===========================================

set -e

echo "================================================"
echo "🚀 Déploiement SIMPLIFIÉ Tapp+ Production"
echo "================================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ===========================================
# 1. Vérifications
# ===========================================
echo -e "\n${BLUE}[1/5]${NC} Vérifications..."

if [ ! -f .env ]; then
    echo -e "${RED}❌ Fichier .env manquant!${NC}"
    exit 1
fi

export $(grep -v '^#' .env | xargs)
echo -e "${GREEN}✓${NC} Configuration chargée"

# ===========================================
# 2. Arrêt des anciens conteneurs
# ===========================================
echo -e "\n${BLUE}[2/5]${NC} Arrêt des anciens conteneurs..."

docker-compose -f docker-compose.simple.yml down 2>/dev/null || true
echo -e "${GREEN}✓${NC} Conteneurs arrêtés"

# ===========================================
# 3. Build des images
# ===========================================
echo -e "\n${BLUE}[3/5]${NC} Build des images..."

docker-compose -f docker-compose.simple.yml build --no-cache
echo -e "${GREEN}✓${NC} Images buildées"

# ===========================================
# 4. Démarrage PostgreSQL et migrations
# ===========================================
echo -e "\n${BLUE}[4/5]${NC} Démarrage base de données..."

docker-compose -f docker-compose.simple.yml up -d postgres redis

echo "Attente PostgreSQL (15s)..."
sleep 15

echo "Migrations Prisma..."
docker-compose -f docker-compose.simple.yml run --rm api npx prisma migrate deploy

echo -e "${GREEN}✓${NC} Base de données prête"

# ===========================================
# 5. Démarrage de tous les services
# ===========================================
echo -e "\n${BLUE}[5/5]${NC} Démarrage des services..."

docker-compose -f docker-compose.simple.yml up -d

echo "Attente services (10s)..."
sleep 10

# ===========================================
# Statut final
# ===========================================
echo -e "\n${GREEN}✨ Déploiement terminé!${NC}"
echo ""
docker-compose -f docker-compose.simple.yml ps

echo ""
echo -e "${GREEN}Accès:${NC}"
echo -e "  🌐 Frontend: http://localhost:5500"
echo -e "  🔌 API: http://localhost:5550"
echo -e "  📚 Docs: http://localhost:5550/api/docs"

echo ""
echo -e "${YELLOW}Commandes utiles:${NC}"
echo -e "  Logs: ${BLUE}docker-compose -f docker-compose.simple.yml logs -f${NC}"
echo -e "  Arrêter: ${BLUE}docker-compose -f docker-compose.simple.yml down${NC}"
echo -e "  Redémarrer: ${BLUE}docker-compose -f docker-compose.simple.yml restart${NC}"
