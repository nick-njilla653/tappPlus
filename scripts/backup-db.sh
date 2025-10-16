#!/bin/bash

# ===========================================
# TAPP+ - Script de backup base de données
# ===========================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📦 Backup de la base de données Tapp+${NC}"

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ Fichier .env non trouvé${NC}"
    exit 1
fi

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/tappplus_backup_$TIMESTAMP.sql"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Créer le répertoire de backup
mkdir -p $BACKUP_DIR

echo -e "${BLUE}Création du backup...${NC}"
echo "Fichier: $BACKUP_FILE"

# Vérifier si le conteneur PostgreSQL est en cours d'exécution
if ! docker ps | grep -q tappplus-postgres-prod; then
    echo -e "${RED}❌ Le conteneur PostgreSQL n'est pas en cours d'exécution${NC}"
    exit 1
fi

# Créer le backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U ${POSTGRES_USER} \
    --format=plain \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    ${POSTGRES_DB} > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backup SQL créé"

    # Compresser le backup
    echo -e "${BLUE}Compression du backup...${NC}"
    gzip $BACKUP_FILE

    BACKUP_FILE_GZ="${BACKUP_FILE}.gz"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)

    echo -e "${GREEN}✓${NC} Backup compressé: $BACKUP_FILE_GZ ($BACKUP_SIZE)"

    # Nettoyer les anciens backups
    echo -e "${BLUE}Nettoyage des anciens backups (> $RETENTION_DAYS jours)...${NC}"
    find $BACKUP_DIR -name "tappplus_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

    BACKUP_COUNT=$(ls -1 $BACKUP_DIR/tappplus_backup_*.sql.gz 2>/dev/null | wc -l)
    echo -e "${GREEN}✓${NC} Backups actuels: $BACKUP_COUNT"

    echo -e "\n${GREEN}✨ Backup terminé avec succès!${NC}"
    echo "Fichier: $BACKUP_FILE_GZ"

    # Liste des backups disponibles
    echo -e "\n📋 Backups disponibles:"
    ls -lh $BACKUP_DIR/tappplus_backup_*.sql.gz 2>/dev/null || echo "Aucun backup trouvé"

else
    echo -e "${RED}❌ Erreur lors de la création du backup${NC}"
    exit 1
fi
