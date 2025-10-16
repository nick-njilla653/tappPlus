# 🚀 Quick Start - Déploiement VPS Tapp+

Guide rapide pour déployer Tapp+ sur votre VPS en 30 minutes.

## ⚡ Pré-requis rapide

- VPS Ubuntu 20.04+ avec 4GB RAM minimum
- Nom de domaine avec DNS configurés
- Accès SSH au VPS

---

## 📝 Étapes (dans l'ordre)

### 1️⃣ Sur votre VPS (5 min)

```bash
# Connexion SSH
ssh root@VOTRE_IP_VPS

# Installation rapide Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Firewall
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable

# Installer outils
sudo apt update && sudo apt install -y git certbot
```

### 2️⃣ Cloner et configurer (5 min)

```bash
# Cloner dans /opt/tappplus
sudo mkdir -p /opt/tappplus && sudo chown -R $USER:$USER /opt/tappplus
cd /opt/tappplus
git clone <VOTRE_REPO_URL> .

# Configuration .env
cp .env.example .env
nano .env
```

**Variables ESSENTIELLES à modifier dans .env:**

```bash
# Générer secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)

# Domaines (remplacer par les vôtres)
DOMAIN=votre-domaine.com
API_DOMAIN=api.votre-domaine.com
CORS_ORIGINS=https://votre-domaine.com
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

### 3️⃣ Mettre à jour Nginx (2 min)

```bash
nano nginx/nginx.conf

# Remplacer TOUTES les occurrences de:
# - votre-domaine.com → votre vrai domaine
# - api.votre-domaine.com → votre vrai sous-domaine API
```

### 4️⃣ SSL avec Let's Encrypt (5 min)

```bash
chmod +x scripts/*.sh
./scripts/setup-ssl.sh
# Choisir option 1 (Let's Encrypt)
```

### 5️⃣ Déployer (10 min)

```bash
./scripts/deploy.sh
```

Attendez que tous les services démarrent (statut "healthy").

### 6️⃣ Seed données initiales (1 min)

```bash
docker-compose -f docker-compose.prod.yml exec api npm run db:seed
```

### 7️⃣ Tester (2 min)

```bash
# Test API
curl https://api.votre-domaine.com/api/v1/health

# Test Frontend (dans navigateur)
# Ouvrir: https://votre-domaine.com

# Login admin:
# Email: admin@meditache.com
# Password: admin123
```

⚠️ **IMPORTANT:** Changez immédiatement le mot de passe admin après connexion!

### 8️⃣ Backup automatique (2 min)

```bash
crontab -e

# Ajouter cette ligne (backup quotidien 2h)
0 2 * * * cd /opt/tappplus && ./scripts/backup-db.sh >> /var/log/tappplus-backup.log 2>&1

# SSL renewal (tous les 60 jours)
0 0 1 */2 * certbot renew --quiet && cd /opt/tappplus && docker-compose -f docker-compose.prod.yml restart nginx
```

---

## ✅ Vérification finale

```bash
# Tous les conteneurs UP et healthy
docker-compose -f docker-compose.prod.yml ps

# Logs OK (pas d'erreurs critiques)
docker-compose -f docker-compose.prod.yml logs --tail=50

# SSL valide
curl -I https://votre-domaine.com | grep "HTTP/2 200"

# API répond
curl https://api.votre-domaine.com/api/v1/health
```

---

## 🔄 Commandes utiles au quotidien

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f [api|web|worker]

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart [service]

# Backup manuel
./scripts/backup-db.sh

# Restaurer backup
./scripts/restore-db.sh

# Mise à jour application
cd /opt/tappplus
git pull origin main
./scripts/deploy.sh

# Vérifier espace disque
df -h

# Nettoyer Docker
docker system prune -a
```

---

## 🆘 Problèmes courants

### Service ne démarre pas
```bash
docker-compose -f docker-compose.prod.yml logs [service]
docker-compose -f docker-compose.prod.yml restart [service]
```

### SSL ne fonctionne pas
```bash
# Vérifier certificats
ls -la nginx/ssl/
# Redémarrer nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### "Port already in use"
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # ou autre service
```

### Database connection failed
```bash
# Vérifier .env
cat .env | grep DATABASE_URL
# Vérifier postgres
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

---

## 📚 Documentation complète

Pour plus de détails, consultez:

- **DEPLOYMENT.md** - Guide complet étape par étape
- **CHANGELOG_DEPLOYMENT.md** - Liste des modifications
- **nginx/README.md** - Configuration Nginx détaillée
- **scripts/README.md** - Documentation des scripts

---

## 🎯 Checklist finale

- [ ] VPS provisionné (Ubuntu 20.04+, 4GB+ RAM)
- [ ] Docker et Docker Compose installés
- [ ] Firewall configuré (ports 22, 80, 443)
- [ ] DNS configurés (A records)
- [ ] Projet cloné dans /opt/tappplus
- [ ] .env configuré avec secrets générés
- [ ] nginx.conf mis à jour avec vrais domaines
- [ ] Certificats SSL obtenus (Let's Encrypt)
- [ ] Application déployée (./scripts/deploy.sh)
- [ ] Données seeded (compte admin créé)
- [ ] Application accessible via HTTPS
- [ ] Login admin testé
- [ ] Mot de passe admin changé
- [ ] Backups automatiques configurés (cron)
- [ ] Logs vérifiés (pas d'erreurs)

---

## 🎉 C'est tout!

Votre application Tapp+ est maintenant en production et accessible à:

- 🌐 Frontend: `https://votre-domaine.com`
- 🔌 API: `https://api.votre-domaine.com`
- 📚 Docs API: `https://api.votre-domaine.com/api/docs`

**Temps total:** ~30 minutes

**Prochaines étapes recommandées:**
1. Configurer notifications (Twilio SMS, Email)
2. Mettre en place monitoring (Prometheus/Grafana)
3. Configurer CI/CD pour déploiements automatiques
4. Ajouter un CDN (Cloudflare) pour performance
5. Tester les backups régulièrement

---

**Besoin d'aide?** Consultez DEPLOYMENT.md pour le guide complet.
