# 🚀 Guide de déploiement VPS - Tapp+

Ce guide vous accompagne étape par étape pour déployer Tapp+ sur votre VPS en production.

## 📋 Prérequis

### VPS
- **OS**: Ubuntu 20.04 LTS ou 22.04 LTS (recommandé)
- **CPU**: Minimum 2 cores, recommandé 4 cores
- **RAM**: Minimum 4GB, recommandé 8GB
- **Stockage**: Minimum 40GB SSD
- **Accès**: Root ou sudo

### Domaines
- Un nom de domaine acheté (ex: `votre-domaine.com`)
- DNS configurés pour pointer vers votre VPS:
  - `votre-domaine.com` → IP de votre VPS
  - `www.votre-domaine.com` → IP de votre VPS
  - `api.votre-domaine.com` → IP de votre VPS

### Comptes (optionnels pour notifications)
- Compte Twilio (SMS)
- Compte Gmail ou SMTP (Email)
- Projet Firebase (Push notifications)

---

## 🛠️ Étape 1: Préparation du VPS

### 1.1 Connexion au VPS

```bash
ssh root@VOTRE_IP_VPS
```

### 1.2 Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Installation de Docker

```bash
# Télécharger et exécuter le script d'installation
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Vérifier l'installation
docker --version
```

### 1.4 Installation de Docker Compose

```bash
# Télécharger Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker-compose --version
```

### 1.5 Installation d'outils supplémentaires

```bash
sudo apt install -y git curl wget nano htop certbot
```

### 1.6 Configuration du firewall

```bash
# Installer ufw si nécessaire
sudo apt install -y ufw

# Autoriser SSH (IMPORTANT: avant d'activer ufw)
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

---

## 📦 Étape 2: Clonage et configuration du projet

### 2.1 Cloner le projet

```bash
# Créer un répertoire pour l'application
sudo mkdir -p /opt/tappplus
sudo chown -R $USER:$USER /opt/tappplus

# Cloner le repository
cd /opt/tappplus
git clone <VOTRE_REPOSITORY_URL> .

# Si repository privé, configurer les credentials git
git config --global credential.helper store
```

### 2.2 Configuration des variables d'environnement

```bash
# Copier le template
cp .env.example .env

# Éditer le fichier .env
nano .env
```

**Variables CRITIQUES à configurer:**

```env
# ⚠️ GÉNÉRER DES SECRETS FORTS
JWT_SECRET=<GÉNÉRER_AVEC_COMMANDE_CI_DESSOUS>
JWT_REFRESH_SECRET=<GÉNÉRER_AVEC_COMMANDE_CI_DESSOUS>
POSTGRES_PASSWORD=<GÉNÉRER_AVEC_COMMANDE_CI_DESSOUS>
REDIS_PASSWORD=<GÉNÉRER_AVEC_COMMANDE_CI_DESSOUS>

# 🌐 DOMAINES
DOMAIN=votre-domaine.com
API_DOMAIN=api.votre-domaine.com
CORS_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com

# 📧 EMAIL (recommandé)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app-gmail
EMAIL_FROM=noreply@votre-domaine.com

# 📱 SMS Twilio (optionnel)
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+237XXXXXXXXX
```

**Générer des secrets forts:**

```bash
# JWT_SECRET
openssl rand -base64 32

# JWT_REFRESH_SECRET
openssl rand -base64 32

# POSTGRES_PASSWORD
openssl rand -base64 24

# REDIS_PASSWORD
openssl rand -base64 24
```

### 2.3 Mettre à jour nginx.conf avec vos domaines

```bash
nano nginx/nginx.conf
```

Remplacez tous les `votre-domaine.com` par votre vrai domaine.

---

## 🔒 Étape 3: Configuration SSL/TLS

### Option A: Let's Encrypt (Recommandé - Gratuit)

```bash
# Rendre le script exécutable
chmod +x scripts/setup-ssl.sh

# Exécuter le script
./scripts/setup-ssl.sh

# Choisir option 1 (Let's Encrypt)
```

Le script va:
- Installer Certbot
- Obtenir les certificats SSL gratuits
- Les copier dans `nginx/ssl/`
- Configurer le renouvellement automatique

### Option B: Certificats existants

Si vous avez déjà des certificats:

```bash
# Copier vos certificats
cp /chemin/vers/fullchain.pem nginx/ssl/
cp /chemin/vers/privkey.pem nginx/ssl/

# Définir les bonnes permissions
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

---

## 🚀 Étape 4: Déploiement

### 4.1 Rendre les scripts exécutables

```bash
chmod +x scripts/*.sh
```

### 4.2 Premier déploiement

```bash
# Lancer le script de déploiement
./scripts/deploy.sh
```

Le script va automatiquement:
1. ✅ Vérifier les prérequis
2. 💾 Créer un backup (si DB existe)
3. 🛑 Arrêter les anciens conteneurs
4. 📥 Pull des images de base
5. 🏗️ Build des images Docker
6. 🗄️ Exécuter les migrations de base de données
7. ▶️ Démarrer tous les services
8. 🏥 Vérifier la santé des services

### 4.3 Seed des données initiales (première installation)

```bash
# Créer le compte admin et les données de démonstration
docker-compose -f docker-compose.prod.yml exec api npm run db:seed
```

---

## 🎉 Étape 5: Vérification

### 5.1 Vérifier que tous les services tournent

```bash
docker-compose -f docker-compose.prod.yml ps
```

Tous les services doivent être "Up" avec status "healthy".

### 5.2 Tester les URLs

```bash
# Frontend
curl -I https://votre-domaine.com

# API Health
curl https://api.votre-domaine.com/api/v1/health

# API Docs (optionnel)
# Ouvrir dans le navigateur: https://api.votre-domaine.com/api/docs
```

### 5.3 Vérifier les logs

```bash
# Logs de tous les services
docker-compose -f docker-compose.prod.yml logs

# Logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f worker
```

### 5.4 Tester l'application

1. Ouvrez `https://votre-domaine.com` dans votre navigateur
2. Connectez-vous avec le compte admin:
   - Email: `admin@meditache.com`
   - Mot de passe: `admin123`
3. **Changez immédiatement le mot de passe admin!**

---

## 📊 Étape 6: Monitoring et maintenance

### 6.1 Configuration des backups automatiques

```bash
# Ouvrir crontab
crontab -e

# Ajouter cette ligne pour backup quotidien à 2h du matin
0 2 * * * cd /opt/tappplus && ./scripts/backup-db.sh >> /var/log/tappplus-backup.log 2>&1

# Renouvellement SSL tous les 60 jours
0 0 1 */2 * certbot renew --quiet && cd /opt/tappplus && docker-compose -f docker-compose.prod.yml restart nginx
```

### 6.2 Vérifier l'espace disque

```bash
df -h
```

Si l'espace est faible:

```bash
# Nettoyer les images Docker inutilisées
docker system prune -a

# Nettoyer les anciens backups (garder 7 derniers)
find /opt/tappplus/backups -name "*.gz" -mtime +7 -delete
```

### 6.3 Monitoring des logs

```bash
# Voir les logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Logs des dernières 100 lignes
docker-compose -f docker-compose.prod.yml logs --tail=100

# Logs d'un service avec timestamp
docker-compose -f docker-compose.prod.yml logs -f --timestamps api
```

---

## 🔄 Mises à jour

### Pour déployer une nouvelle version:

```bash
cd /opt/tappplus

# Pull du code
git pull origin main

# Redéployer
./scripts/deploy.sh
```

---

## 🆘 Dépannage

### Problème: Service ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs [service]

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart [service]

# Reconstruire et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build [service]
```

### Problème: Base de données corrompue

```bash
# Restaurer depuis un backup
./scripts/restore-db.sh
```

### Problème: Certificats SSL expirés

```bash
# Renouveler manuellement
sudo certbot renew

# Copier les nouveaux certificats
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl

# Redémarrer nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Problème: Mémoire insuffisante

```bash
# Vérifier la mémoire
free -h

# Ajouter du swap (si pas de swap)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Problème: Port 80 ou 443 déjà utilisé

```bash
# Vérifier ce qui utilise le port
sudo lsof -i :80
sudo lsof -i :443

# Arrêter le service (exemple Apache)
sudo systemctl stop apache2
sudo systemctl disable apache2
```

---

## 📞 Commandes utiles

```bash
# Statut des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Redémarrer tous les services
docker-compose -f docker-compose.prod.yml restart

# Arrêter tous les services
docker-compose -f docker-compose.prod.yml down

# Démarrer en mode détaché
docker-compose -f docker-compose.prod.yml up -d

# Voir les ressources utilisées
docker stats

# Shell dans un conteneur
docker-compose -f docker-compose.prod.yml exec api sh
docker-compose -f docker-compose.prod.yml exec postgres psql -U meditache

# Backup manuel
./scripts/backup-db.sh

# Restaurer backup
./scripts/restore-db.sh

# Voir les logs Nginx
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/access.log
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/error.log
```

---

## ✅ Checklist post-déploiement

- [ ] Application accessible via HTTPS
- [ ] Certificats SSL valides
- [ ] Connexion admin fonctionne
- [ ] Mot de passe admin changé
- [ ] Backup automatique configuré (cron)
- [ ] Monitoring des logs actif
- [ ] Notifications email testées
- [ ] Notifications SMS testées (si configuré)
- [ ] Firewall configuré
- [ ] DNS correctement configurés
- [ ] Documentation équipe à jour

---

## 🎯 Performance et optimisation

### Pour améliorer les performances:

1. **Activer le cache Redis pour les sessions**
2. **Configurer un CDN** (Cloudflare, AWS CloudFront)
3. **Optimiser PostgreSQL** (ajuster shared_buffers, work_mem)
4. **Mettre en place un monitoring** (Prometheus + Grafana)
5. **Load balancing** si trafic important (plusieurs instances)

---

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation NestJS](https://docs.nestjs.com)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Docker](https://docs.docker.com)
- [Let's Encrypt](https://letsencrypt.org)

---

**Besoin d'aide?** Consultez les logs ou ouvrez une issue sur le repository du projet.
