#!/bin/bash

# ===========================================
# TAPP+ - Script de déploiement production
# ===========================================

set -e  # Arrêter en cas d'erreur

echo "================================================"
echo "🚀 Démarrage du déploiement Tapp+ Production"
echo "================================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===========================================
# 1. Vérifications préalables
# ===========================================
echo -e "\n${BLUE}[1/8]${NC} Vérifications préalables..."

# Vérifier que .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Fichier .env manquant!${NC}"
    echo "Copiez .env.example vers .env et configurez les variables"
    exit 1
fi

echo -e "${GREEN}✓${NC} Fichier .env trouvé"

# Charger les variables d'environnement
export $(grep -v '^#' .env | xargs)

# Vérifier les variables critiques
REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "JWT_REFRESH_SECRET" "REDIS_PASSWORD" "NEXT_PUBLIC_API_URL" "CORS_ORIGINS")

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Variable $var manquante dans .env${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓${NC} Variables d'environnement validées"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker et Docker Compose disponibles"

# Vérifier SSL certificates
if [ ! -f nginx/ssl/fullchain.pem ] || [ ! -f nginx/ssl/privkey.pem ]; then
    echo -e "${YELLOW}⚠️  Certificats SSL manquants dans nginx/ssl/${NC}"
    echo "Veuillez obtenir les certificats SSL avant de continuer"
    echo "Voir nginx/README.md pour les instructions"
    read -p "Continuer quand même ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ===========================================
# 2. Backup de la base de données
# ===========================================
echo -e "\n${BLUE}[2/8]${NC} Backup de la base de données..."

# Vérifier si la DB existe déjà (pas premier déploiement)
if docker ps -a | grep -q tappplus-postgres-prod; then
    echo "Création d'un backup avant mise à jour..."
    ./scripts/backup-db.sh || echo -e "${YELLOW}⚠️  Backup échoué (normal si première installation)${NC}"
else
    echo -e "${YELLOW}⚠️  Pas de base de données existante (premier déploiement)${NC}"
fi

# ===========================================
# 3. Arrêt des anciens conteneurs
# ===========================================
echo -e "\n${BLUE}[3/8]${NC} Arrêt des anciens conteneurs..."

if docker-compose -f docker-compose.prod.yml ps | grep -q Up; then
    echo "Arrêt des conteneurs en cours d'exécution..."
    docker-compose -f docker-compose.prod.yml down
    echo -e "${GREEN}✓${NC} Conteneurs arrêtés"
else
    echo -e "${YELLOW}⚠️  Aucun conteneur en cours d'exécution${NC}"
fi

# ===========================================
# 4. Pull des dernières images de base
# ===========================================
echo -e "\n${BLUE}[4/8]${NC} Mise à jour des images de base..."

docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull nginx:alpine
docker pull node:18-slim
docker pull node:18-alpine

echo -e "${GREEN}✓${NC} Images de base à jour"

# ===========================================
# 5. Build des nouvelles images
# ===========================================
echo -e "\n${BLUE}[5/8]${NC} Build des images Docker..."

echo "Construction des images (cela peut prendre quelques minutes)..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${GREEN}✓${NC} Images buildées avec succès"

# ===========================================
# 6. Migrations de base de données
# ===========================================
echo -e "\n${BLUE}[6/8]${NC} Démarrage des services de base..."

# Démarrer postgres et redis
docker-compose -f docker-compose.prod.yml up -d postgres redis

echo "Attente du démarrage de PostgreSQL..."
sleep 10

# Vérifier si postgres est prêt
docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U ${POSTGRES_USER} || {
    echo -e "${RED}❌ PostgreSQL ne répond pas${NC}"
    exit 1
}

echo -e "${GREEN}✓${NC} PostgreSQL prêt"

echo "Exécution des migrations de base de données..."
docker-compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

echo -e "${GREEN}✓${NC} Migrations appliquées"

# ===========================================
# 7. Démarrage de tous les services
# ===========================================
echo -e "\n${BLUE}[7/8]${NC} Démarrage de tous les services..."

docker-compose -f docker-compose.prod.yml up -d

echo "Attente du démarrage des services..."
sleep 15

# ===========================================
# 8. Vérification de santé
# ===========================================
echo -e "\n${BLUE}[8/8]${NC} Vérification de santé des services..."

echo -e "\nStatut des conteneurs:"
docker-compose -f docker-compose.prod.yml ps

# Vérifier chaque service
services=("postgres" "redis" "api" "web" "worker" "nginx")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps | grep $service | grep -q Up; then
        echo -e "${GREEN}✓${NC} $service: Running"
    else
        echo -e "${RED}✗${NC} $service: Not running"
        all_healthy=false
    fi
done

# Vérifier les logs pour des erreurs critiques
echo -e "\n${YELLOW}Vérification des logs récents...${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20 api | grep -i error || echo "Pas d'erreurs dans les logs API"

# ===========================================
# Résumé final
# ===========================================
echo -e "\n================================================"
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}✨ Déploiement terminé avec succès!${NC}"
else
    echo -e "${YELLOW}⚠️  Déploiement terminé avec des avertissements${NC}"
    echo "Vérifiez les logs: docker-compose -f docker-compose.prod.yml logs"
fi
echo "================================================"

echo -e "\n📊 Informations d'accès:"
echo -e "  🌐 Frontend: https://${DOMAIN}"
echo -e "  🔌 API: https://${API_DOMAIN}"
echo -e "  📚 Documentation API: https://${API_DOMAIN}/api/docs"

echo -e "\n💡 Commandes utiles:"
echo -e "  Voir les logs: ${BLUE}docker-compose -f docker-compose.prod.yml logs -f [service]${NC}"
echo -e "  Redémarrer: ${BLUE}docker-compose -f docker-compose.prod.yml restart [service]${NC}"
echo -e "  Arrêter: ${BLUE}docker-compose -f docker-compose.prod.yml down${NC}"
echo -e "  Backup DB: ${BLUE}./scripts/backup-db.sh${NC}"

echo -e "\n${GREEN}Déploiement terminé!${NC} 🎉"
