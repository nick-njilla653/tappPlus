# Scripts de déploiement et maintenance - Tapp+

Ce répertoire contient tous les scripts nécessaires pour déployer et maintenir Tapp+ en production.

## 📜 Scripts disponibles

### 🚀 deploy.sh - Déploiement production

**Usage:**
```bash
./scripts/deploy.sh
```

**Ce que fait ce script:**
1. Vérifie que `.env` existe et que toutes les variables critiques sont définies
2. Vérifie que Docker et Docker Compose sont installés
3. Crée un backup de la base de données (si elle existe)
4. Arrête les anciens conteneurs
5. Pull les images de base (postgres, redis, nginx, node)
6. Build les nouvelles images Docker de l'application
7. Démarre PostgreSQL et Redis
8. Exécute les migrations Prisma
9. Démarre tous les services
10. Vérifie la santé de chaque service

**Prérequis:**
- Fichier `.env` configuré
- Certificats SSL dans `nginx/ssl/`
- Docker et Docker Compose installés

**En cas d'erreur:**
- Le script s'arrête immédiatement (`set -e`)
- Consultez les logs: `docker-compose -f docker-compose.prod.yml logs`

---

### 💾 backup-db.sh - Backup base de données

**Usage:**
```bash
./scripts/backup-db.sh
```

**Ce que fait ce script:**
1. Vérifie que PostgreSQL est en cours d'exécution
2. Crée un dump SQL de toute la base de données
3. Compresse le backup avec gzip
4. Nettoie les anciens backups (>7 jours par défaut)
5. Affiche la liste des backups disponibles

**Fichiers créés:**
```
backups/tappplus_backup_YYYYMMDD_HHMMSS.sql.gz
```

**Configuration:**
- Rétention par défaut: 7 jours
- Modifiable via `BACKUP_RETENTION_DAYS` dans `.env`

**Automatisation (recommandé):**
```bash
# Ajouter dans crontab pour backup quotidien à 2h
0 2 * * * cd /opt/tappplus && ./scripts/backup-db.sh >> /var/log/tappplus-backup.log 2>&1
```

---

### ♻️  restore-db.sh - Restauration base de données

**Usage:**
```bash
./scripts/restore-db.sh
```

**Ce que fait ce script:**
1. Liste tous les backups disponibles
2. Vous demande de choisir un backup
3. ⚠️ **ATTENTION**: Vous demande confirmation (opération destructive!)
4. Arrête les services API, Worker et Web
5. Décompresse et restaure le backup
6. Redémarre tous les services

**⚠️ IMPORTANT:**
- Cette opération **ÉCRASE** la base de données actuelle
- Créez un backup avant de restaurer si nécessaire
- Les services seront indisponibles pendant la restauration (~1-2 minutes)

**Exemple d'utilisation:**
```bash
$ ./scripts/restore-db.sh

📋 Backups disponibles:
  [0] tappplus_backup_20241016_140530.sql.gz - 2.1M - 20241016_140530
  [1] tappplus_backup_20241015_020000.sql.gz - 2.0M - 20241015_020000
  [2] tappplus_backup_20241014_020000.sql.gz - 1.9M - 20241014_020000

Entrez le numéro du backup à restaurer (ou 'q' pour quitter): 0

⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle!
Backup sélectionné: tappplus_backup_20241016_140530.sql.gz

Êtes-vous sûr de vouloir continuer? (yes/NO): yes
```

---

### 🔒 setup-ssl.sh - Configuration SSL/TLS

**Usage:**
```bash
./scripts/setup-ssl.sh
```

**Ce que fait ce script:**
1. Lit les domaines depuis `.env`
2. Vous propose 3 options:
   - **Option 1**: Let's Encrypt (gratuit, automatique) - **Recommandé**
   - **Option 2**: Certificats existants (si vous en avez déjà)
   - **Option 3**: Certificats auto-signés (tests uniquement)

**Option 1 - Let's Encrypt:**
- Installe Certbot si nécessaire
- Obtient des certificats SSL gratuits et valides
- Les copie dans `nginx/ssl/`
- Configure le renouvellement automatique (cron mensuel)

**Option 2 - Certificats existants:**
- Vous demande les chemins vers vos certificats
- Les copie dans `nginx/ssl/`
- Définit les bonnes permissions

**Option 3 - Auto-signés:**
- ⚠️ **NE PAS utiliser en production!**
- Génère des certificats pour tests locaux
- Les navigateurs afficheront un avertissement de sécurité

**Prérequis pour Let's Encrypt:**
- Ports 80 et 443 ouverts
- DNS configurés (pointant vers votre serveur)
- Variable `EMAIL_FROM` définie dans `.env`

---

## 🔧 Rendre les scripts exécutables

Lors du premier déploiement:

```bash
chmod +x scripts/*.sh
```

## 📊 Exemples d'usage

### Déploiement initial complet

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env
nano .env

# 2. Rendre les scripts exécutables
chmod +x scripts/*.sh

# 3. Configurer SSL
./scripts/setup-ssl.sh

# 4. Déployer
./scripts/deploy.sh

# 5. Seed des données initiales
docker-compose -f docker-compose.prod.yml exec api npm run db:seed
```

### Mise à jour de l'application

```bash
# Pull du code
git pull origin main

# Redéployer
./scripts/deploy.sh
```

### Backup avant maintenance

```bash
# Créer un backup manuel
./scripts/backup-db.sh

# Effectuer la maintenance...

# Si problème, restaurer
./scripts/restore-db.sh
```

### Test de restauration (recommandé mensuellement)

```bash
# 1. Créer un backup actuel
./scripts/backup-db.sh

# 2. Tester la restauration du dernier backup
./scripts/restore-db.sh

# 3. Vérifier que tout fonctionne
curl https://votre-domaine.com
```

## 🐛 Dépannage

### Script: "Permission denied"

```bash
chmod +x scripts/nom-du-script.sh
```

### Script: ".env non trouvé"

```bash
# Vérifiez que vous êtes dans le bon répertoire
pwd  # Devrait être /opt/tappplus

# Créer .env depuis le template
cp .env.example .env
nano .env
```

### deploy.sh: "Docker not found"

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter utilisateur au groupe docker
sudo usermod -aG docker $USER

# Relancer le shell
newgrp docker
```

### backup-db.sh: "PostgreSQL not running"

```bash
# Vérifier le statut
docker-compose -f docker-compose.prod.yml ps

# Démarrer PostgreSQL si nécessaire
docker-compose -f docker-compose.prod.yml up -d postgres
```

### restore-db.sh: "psql: FATAL: password authentication failed"

Vérifiez que `POSTGRES_USER` et `POSTGRES_PASSWORD` dans `.env` correspondent à la configuration actuelle de PostgreSQL.

### setup-ssl.sh: "Port 80 already in use"

```bash
# Trouver ce qui utilise le port 80
sudo lsof -i :80

# Arrêter le service (exemple Apache)
sudo systemctl stop apache2
sudo systemctl disable apache2
```

## 📚 Variables d'environnement utilisées

Les scripts lisent ces variables depuis `.env`:

| Variable | Utilisée par | Description |
|----------|-------------|-------------|
| `POSTGRES_USER` | backup, restore, deploy | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | backup, restore, deploy | Mot de passe PostgreSQL |
| `POSTGRES_DB` | backup, restore, deploy | Nom de la base de données |
| `DOMAIN` | setup-ssl | Domaine principal |
| `API_DOMAIN` | setup-ssl | Domaine de l'API |
| `EMAIL_FROM` | setup-ssl | Email pour Let's Encrypt |
| `BACKUP_RETENTION_DAYS` | backup | Jours de rétention des backups |

## ⚙️ Personnalisation

### Modifier la rétention des backups

Dans `.env`:
```env
BACKUP_RETENTION_DAYS=14  # Garder 14 jours au lieu de 7
```

### Changer l'heure du backup automatique

```bash
crontab -e

# Changer de 2h à 3h du matin
0 3 * * * cd /opt/tappplus && ./scripts/backup-db.sh >> /var/log/tappplus-backup.log 2>&1
```

### Ajouter des notifications (email, Slack, etc.)

Éditez `backup-db.sh` et ajoutez à la fin:

```bash
# Envoyer un email en cas de succès
if [ $? -eq 0 ]; then
    echo "Backup réussi" | mail -s "Tapp+ Backup OK" admin@example.com
fi
```

## 🔐 Sécurité

**Bonnes pratiques:**

1. ✅ **Ne jamais commiter** les scripts modifiés contenant des secrets
2. ✅ **Limiter les permissions** sur les scripts: `chmod 750 scripts/*.sh`
3. ✅ **Stocker les backups** dans un emplacement sécurisé séparé
4. ✅ **Chiffrer les backups sensibles**: `gpg -c backup.sql.gz`
5. ✅ **Tester les restaurations** régulièrement

**Mauvaises pratiques:**

1. ❌ Exécuter les scripts en tant que root (sauf setup-ssl si nécessaire)
2. ❌ Désactiver `set -e` dans les scripts (arrêt en cas d'erreur)
3. ❌ Modifier les scripts sans les tester d'abord
4. ❌ Ignorer les messages d'erreur

## 📞 Support

En cas de problème avec un script:

1. Vérifiez les logs: `docker-compose -f docker-compose.prod.yml logs`
2. Vérifiez `.env`: toutes les variables sont définies?
3. Vérifiez les permissions: `ls -la scripts/`
4. Exécutez le script en mode debug: `bash -x scripts/nom-du-script.sh`

---

**Astuce**: Tous les scripts affichent des messages colorés pour faciliter le suivi:
- 🔵 Bleu = Information
- 🟢 Vert = Succès
- 🟡 Jaune = Avertissement
- 🔴 Rouge = Erreur
