#!/bin/bash

# ===========================================
# TAPP+ - Script de restauration base de données
# ===========================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}♻️  Restauration de la base de données Tapp+${NC}"

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ Fichier .env non trouvé${NC}"
    exit 1
fi

BACKUP_DIR="./backups"

# Vérifier le répertoire de backup
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Répertoire de backup non trouvé: $BACKUP_DIR${NC}"
    exit 1
fi

# Lister les backups disponibles
echo -e "\n📋 Backups disponibles:"
backups=($(ls -t $BACKUP_DIR/tappplus_backup_*.sql.gz 2>/dev/null))

if [ ${#backups[@]} -eq 0 ]; then
    echo -e "${RED}❌ Aucun backup trouvé${NC}"
    exit 1
fi

# Afficher la liste numérotée
for i in "${!backups[@]}"; do
    backup_file="${backups[$i]}"
    backup_size=$(du -h "$backup_file" | cut -f1)
    backup_date=$(basename "$backup_file" | sed 's/tappplus_backup_\(.*\)\.sql\.gz/\1/')
    echo "  [$i] $(basename $backup_file) - $backup_size - $backup_date"
done

# Demander quel backup restaurer
echo -e "\n${YELLOW}Entrez le numéro du backup à restaurer (ou 'q' pour quitter):${NC}"
read -r choice

if [ "$choice" = "q" ]; then
    echo "Annulé"
    exit 0
fi

# Vérifier que le choix est valide
if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -ge "${#backups[@]}" ]; then
    echo -e "${RED}❌ Choix invalide${NC}"
    exit 1
fi

BACKUP_FILE="${backups[$choice]}"

echo -e "\n${YELLOW}⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle!${NC}"
echo -e "Backup sélectionné: $(basename $BACKUP_FILE)"
echo -e "\n${RED}Êtes-vous sûr de vouloir continuer? (yes/NO)${NC}"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Annulé"
    exit 0
fi

# Vérifier si le conteneur PostgreSQL est en cours d'exécution
if ! docker ps | grep -q tappplus-postgres-prod; then
    echo -e "${RED}❌ Le conteneur PostgreSQL n'est pas en cours d'exécution${NC}"
    echo "Démarrez-le avec: docker-compose -f docker-compose.prod.yml up -d postgres"
    exit 1
fi

echo -e "\n${BLUE}Décompression du backup...${NC}"
TEMP_SQL="${BACKUP_FILE%.gz}"
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"

echo -e "${BLUE}Restauration de la base de données...${NC}"

# Arrêter les services qui utilisent la DB
echo "Arrêt des services..."
docker-compose -f docker-compose.prod.yml stop api worker web

# Restaurer la base de données
docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} < "$TEMP_SQL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Base de données restaurée"

    # Nettoyer le fichier temporaire
    rm "$TEMP_SQL"

    # Redémarrer les services
    echo -e "${BLUE}Redémarrage des services...${NC}"
    docker-compose -f docker-compose.prod.yml up -d

    echo -e "\n${GREEN}✨ Restauration terminée avec succès!${NC}"
    echo -e "Les services redémarrent..."

else
    echo -e "${RED}❌ Erreur lors de la restauration${NC}"
    rm "$TEMP_SQL"
    exit 1
fi
