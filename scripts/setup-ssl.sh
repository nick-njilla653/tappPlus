#!/bin/bash

# ===========================================
# TAPP+ - Script de configuration SSL/TLS
# ===========================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔒 Configuration SSL/TLS pour Tapp+${NC}"

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ Fichier .env non trouvé${NC}"
    exit 1
fi

# Vérifier les variables de domaine
if [ -z "$DOMAIN" ] || [ -z "$API_DOMAIN" ]; then
    echo -e "${RED}❌ Variables DOMAIN et API_DOMAIN manquantes dans .env${NC}"
    exit 1
fi

echo -e "\nDomaines configurés:"
echo -e "  Frontend: ${GREEN}$DOMAIN${NC}"
echo -e "  API: ${GREEN}$API_DOMAIN${NC}"

# Créer le répertoire SSL
mkdir -p nginx/ssl

echo -e "\n${YELLOW}Choisissez une méthode d'obtention des certificats SSL:${NC}"
echo "1. Let's Encrypt (Certbot) - Gratuit et automatique (recommandé)"
echo "2. Certificats existants - Copier des certificats que vous possédez déjà"
echo "3. Certificats auto-signés - Pour tests uniquement (NON recommandé pour production)"
echo ""
read -p "Votre choix (1-3): " ssl_choice

case $ssl_choice in
    1)
        echo -e "\n${BLUE}Installation de Certbot...${NC}"

        # Vérifier si certbot est installé
        if ! command -v certbot &> /dev/null; then
            echo "Installation de Certbot..."

            # Détection de l'OS
            if [ -f /etc/debian_version ]; then
                sudo apt-get update
                sudo apt-get install -y certbot
            elif [ -f /etc/redhat-release ]; then
                sudo yum install -y certbot
            else
                echo -e "${RED}❌ Distribution non supportée. Installez Certbot manuellement.${NC}"
                exit 1
            fi
        fi

        echo -e "${GREEN}✓${NC} Certbot installé"

        echo -e "\n${BLUE}Obtention des certificats SSL...${NC}"
        echo -e "${YELLOW}Note: Assurez-vous que les ports 80 et 443 sont ouverts et que vos DNS pointent vers ce serveur${NC}"

        # Arrêter nginx temporairement si il tourne
        docker-compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true

        # Obtenir les certificats
        sudo certbot certonly --standalone \
            -d $DOMAIN \
            -d www.$DOMAIN \
            -d $API_DOMAIN \
            --non-interactive \
            --agree-tos \
            --email ${EMAIL_FROM} \
            --preferred-challenges http

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Certificats obtenus"

            # Copier les certificats
            echo -e "${BLUE}Copie des certificats...${NC}"
            sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
            sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
            sudo chown -R $USER:$USER nginx/ssl
            sudo chmod 644 nginx/ssl/fullchain.pem
            sudo chmod 600 nginx/ssl/privkey.pem

            echo -e "${GREEN}✓${NC} Certificats copiés dans nginx/ssl/"

            # Configurer le renouvellement automatique
            echo -e "\n${BLUE}Configuration du renouvellement automatique...${NC}"

            # Créer un script de renouvellement
            cat > /tmp/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet --deploy-hook "cd /opt/tappplus && docker-compose -f docker-compose.prod.yml restart nginx"
EOF

            sudo mv /tmp/renew-ssl.sh /etc/cron.monthly/renew-ssl-tappplus
            sudo chmod +x /etc/cron.monthly/renew-ssl-tappplus

            echo -e "${GREEN}✓${NC} Renouvellement automatique configuré (mensuel)"

        else
            echo -e "${RED}❌ Erreur lors de l'obtention des certificats${NC}"
            echo "Vérifiez que:"
            echo "  - Les ports 80 et 443 sont ouverts"
            echo "  - Les DNS pointent vers ce serveur"
            echo "  - Aucun autre service n'utilise le port 80"
            exit 1
        fi
        ;;

    2)
        echo -e "\n${BLUE}Copie de certificats existants${NC}"
        echo -e "${YELLOW}Veuillez fournir les chemins complets vers vos certificats:${NC}"

        read -p "Chemin vers fullchain.pem (certificat + chaîne): " fullchain_path
        read -p "Chemin vers privkey.pem (clé privée): " privkey_path

        if [ ! -f "$fullchain_path" ] || [ ! -f "$privkey_path" ]; then
            echo -e "${RED}❌ Fichiers non trouvés${NC}"
            exit 1
        fi

        cp "$fullchain_path" nginx/ssl/fullchain.pem
        cp "$privkey_path" nginx/ssl/privkey.pem
        chmod 644 nginx/ssl/fullchain.pem
        chmod 600 nginx/ssl/privkey.pem

        echo -e "${GREEN}✓${NC} Certificats copiés"
        ;;

    3)
        echo -e "\n${YELLOW}⚠️  ATTENTION: Création de certificats auto-signés${NC}"
        echo -e "${RED}Ces certificats ne sont PAS sécurisés pour la production!${NC}"
        read -p "Continuer? (y/N) " -n 1 -r
        echo

        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi

        echo -e "${BLUE}Génération des certificats auto-signés...${NC}"

        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/privkey.pem \
            -out nginx/ssl/fullchain.pem \
            -subj "/C=CM/ST=Littoral/L=Douala/O=Tapp+/CN=$DOMAIN"

        chmod 644 nginx/ssl/fullchain.pem
        chmod 600 nginx/ssl/privkey.pem

        echo -e "${GREEN}✓${NC} Certificats auto-signés créés"
        echo -e "${RED}⚠️  Les navigateurs afficheront un avertissement de sécurité${NC}"
        ;;

    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac

# Vérifier les certificats
echo -e "\n${BLUE}Vérification des certificats...${NC}"

if [ -f nginx/ssl/fullchain.pem ] && [ -f nginx/ssl/privkey.pem ]; then
    echo -e "${GREEN}✓${NC} Certificats présents"

    # Afficher les informations du certificat
    echo -e "\n📋 Informations du certificat:"
    openssl x509 -in nginx/ssl/fullchain.pem -noout -subject -dates

    echo -e "\n${GREEN}✨ Configuration SSL terminée!${NC}"
    echo -e "\nVous pouvez maintenant:"
    echo -e "  1. Mettre à jour nginx/nginx.conf avec vos domaines"
    echo -e "  2. Démarrer l'application: ${BLUE}./scripts/deploy.sh${NC}"
else
    echo -e "${RED}❌ Certificats manquants${NC}"
    exit 1
fi
