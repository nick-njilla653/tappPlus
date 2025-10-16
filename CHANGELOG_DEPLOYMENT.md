# Changelog - Préparation déploiement VPS

## 📅 Date: 2025-10-16

## ✅ Modifications appliquées

### 🔧 Fichiers modifiés

#### 1. `apps/api/src/main.ts`
**Changements:**
- ✅ CORS configuré dynamiquement via `CORS_ORIGINS` (au lieu de hardcodé)
- ✅ Écoute sur `0.0.0.0` en production (au lieu de localhost uniquement)
- ✅ Console.log utilise variable `host` au lieu de localhost hardcodé

**Avant:**
```typescript
origin: process.env.NODE_ENV === 'production'
  ? ['https://meditache.com']
  : ['http://localhost:5500', 'http://localhost:5550']
```

**Après:**
```typescript
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://meditache.com']
    : ['http://localhost:5500', 'http://localhost:5550'];
```

**Impact:** ✅ Aucun breaking change, rétrocompatible avec dev

---

#### 2. `.gitignore`
**Changements:**
- ✅ Ajout d'entrées pour secrets production (certificats SSL, backups)
- ✅ Ajout d'entrées pour logs Nginx
- ✅ Commentaire pour ne pas ignorer migrations Prisma en production

**Lignes ajoutées:**
```gitignore
# Production - Secrets et données sensibles
nginx/ssl/*.pem
nginx/ssl/*.key
nginx/ssl/*.crt
backups/*.sql
backups/*.sql.gz

# Production - Logs
nginx/logs/
*.log.*

# Docker volumes data
postgres_data/
redis_data/
```

**Impact:** ✅ Empêche le commit accidentel de secrets

---

### 📄 Nouveaux fichiers créés

#### Configuration et environnement

1. **`.env.example`**
   - Template de variables d'environnement
   - Toutes les variables nécessaires documentées
   - Instructions pour générer des secrets forts
   - 85 lignes

2. **`docker-compose.prod.yml`**
   - Configuration Docker production complète
   - 5 services: postgres, redis, api, worker, web, nginx
   - Healthchecks pour tous les services
   - Rotation des logs automatique
   - Réseau isolé
   - 199 lignes

#### Dockerfiles optimisés

3. **`apps/api/Dockerfile.prod`**
   - Build multi-stage (3 stages)
   - Séparation deps / builder / runner
   - Utilisateur non-root pour sécurité
   - Healthcheck intégré
   - Optimisé pour production (uniquement prod dependencies)
   - 70 lignes

4. **`apps/web/Dockerfile.prod`**
   - Build multi-stage optimisé Next.js
   - Support standalone output
   - Utilisateur non-root (nextjs:nodejs)
   - Healthcheck intégré
   - Build-time args pour NEXT_PUBLIC_API_URL
   - 56 lignes

#### Configuration Nginx

5. **`nginx/nginx.conf`**
   - Configuration reverse proxy complète
   - Support HTTPS avec TLS 1.2 et 1.3
   - Headers de sécurité (HSTS, X-Frame-Options, etc.)
   - Rate limiting (API: 10r/s, Auth: 5r/m)
   - Gzip compression
   - Upstreams optimisés avec keepalive
   - Redirection HTTP → HTTPS automatique
   - 208 lignes

6. **`nginx/README.md`**
   - Guide complet configuration Nginx
   - Instructions SSL/TLS (Let's Encrypt, certificats existants, auto-signés)
   - Personnalisation (domaines, rate limiting, timeouts)
   - Commandes logs et monitoring
   - Dépannage
   - 257 lignes

#### Scripts de déploiement

7. **`scripts/deploy.sh`**
   - Script automatisé déploiement production
   - 8 étapes avec vérifications
   - Backup automatique avant mise à jour
   - Validation variables d'environnement
   - Health checks post-déploiement
   - Messages colorés pour suivi facile
   - 151 lignes

8. **`scripts/backup-db.sh`**
   - Backup automatisé PostgreSQL
   - Compression gzip
   - Nettoyage automatique anciens backups (7 jours)
   - Logs et statistiques
   - 68 lignes

9. **`scripts/restore-db.sh`**
   - Restauration interactive depuis backup
   - Sélection du backup à restaurer
   - Confirmation obligatoire (sécurité)
   - Arrêt services pendant restauration
   - 95 lignes

10. **`scripts/setup-ssl.sh`**
    - Configuration SSL/TLS interactive
    - Support Let's Encrypt (Certbot)
    - Support certificats existants
    - Support certificats auto-signés (tests)
    - Configuration renouvellement automatique
    - 174 lignes

11. **`scripts/README.md`**
    - Documentation complète des scripts
    - Exemples d'usage
    - Automatisation (cron)
    - Dépannage
    - Variables d'environnement
    - Personnalisation et sécurité
    - 367 lignes

#### Documentation

12. **`DEPLOYMENT.md`**
    - Guide complet déploiement VPS étape par étape
    - 6 étapes principales
    - Prérequis détaillés
    - Configuration VPS (Docker, firewall, etc.)
    - Instructions SSL
    - Monitoring et maintenance
    - Dépannage complet
    - Checklist post-déploiement
    - Commandes utiles
    - 477 lignes

13. **`CHANGELOG_DEPLOYMENT.md`** (ce fichier)
    - Récapitulatif de toutes les modifications
    - Liste des fichiers créés
    - Prochaines étapes

---

## 📊 Statistiques

- **Fichiers modifiés:** 2
- **Nouveaux fichiers:** 13
- **Total lignes ajoutées:** ~2,500+
- **Scripts bash:** 4
- **Fichiers Docker:** 3
- **Documentation:** 4

---

## 🔐 Sécurité

### ✅ Problèmes corrigés

1. **CORS hardcodé** → Maintenant configurable via `CORS_ORIGINS`
2. **Localhost dans CORS** → Variables d'environnement dynamiques
3. **Secrets en plaintext** → Template `.env.example` avec instructions
4. **Pas de HTTPS** → Configuration Nginx SSL/TLS complète
5. **Certificats non ignorés** → `.gitignore` mis à jour

### ✅ Améliorations de sécurité

1. **Rate limiting** configuré (10r/s API, 5r/m auth)
2. **Headers de sécurité** (HSTS, X-Frame-Options, CSP-ready)
3. **Utilisateurs non-root** dans tous les conteneurs Docker
4. **Healthchecks** sur tous les services
5. **Logs rotation** automatique (10MB max, 3 fichiers)
6. **Backups automatiques** avec rétention configurable
7. **Validation .env** dans script de déploiement
8. **SSL/TLS** only (TLS 1.2+, ciphers modernes)

---

## 📦 Architecture déploiement

```
VPS Ubuntu 20.04/22.04
    │
    ├── Docker Engine
    │   └── Docker Compose
    │       │
    │       ├── Nginx (reverse proxy, SSL termination)
    │       │   ├── Port 80 → Redirect HTTPS
    │       │   └── Port 443 → SSL/TLS
    │       │       ├── votre-domaine.com → Web (Next.js)
    │       │       └── api.votre-domaine.com → API (NestJS)
    │       │
    │       ├── Web (Next.js frontend)
    │       │   └── Port 5500 (interne)
    │       │
    │       ├── API (NestJS backend)
    │       │   └── Port 5550 (interne)
    │       │
    │       ├── Worker (Job processing)
    │       │
    │       ├── PostgreSQL 15
    │       │   └── Port 5432 (interne)
    │       │
    │       └── Redis 7
    │           └── Port 6379 (interne)
    │
    ├── Backups (backups/)
    │   └── Cron quotidien 2h
    │
    └── SSL Certificates (nginx/ssl/)
        └── Renouvellement auto (cron mensuel)
```

---

## 🚀 Prochaines étapes

### Immédiat (avant déploiement)

1. ✅ **Tester en local** avec `docker-compose.prod.yml`
2. ✅ **Générer secrets forts** pour JWT et database
3. ✅ **Configurer DNS** (A records vers IP VPS)
4. ✅ **Configurer .env** avec vraies valeurs

### Sur le VPS

1. 📦 **Provisionner VPS** (Ubuntu 20.04/22.04, 4GB+ RAM)
2. 🔧 **Installer Docker** et Docker Compose
3. 🔥 **Configurer firewall** (ufw: 22, 80, 443)
4. 📂 **Cloner projet** dans `/opt/tappplus`
5. 🔒 **Obtenir certificats SSL** (Let's Encrypt)
6. 🚀 **Déployer** avec `./scripts/deploy.sh`
7. 🌱 **Seed données** initiales
8. ✅ **Tester** l'application
9. 📊 **Configurer backups** automatiques (cron)
10. 🔐 **Changer mot de passe** admin

### Post-déploiement (recommandé)

1. 📈 **Monitoring** (Prometheus + Grafana ou équivalent)
2. 📧 **Alertes** (email/SMS en cas de problème)
3. 🌍 **CDN** (Cloudflare pour performance)
4. 🔄 **CI/CD** (GitHub Actions pour déploiement auto)
5. 📝 **Tests** (augmenter couverture tests)

---

## ⚠️ Points d'attention

### Variables d'environnement critiques

**AVANT le premier déploiement, générer:**

```bash
# JWT secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET

# Database credentials
openssl rand -base64 24  # POSTGRES_PASSWORD
openssl rand -base64 24  # REDIS_PASSWORD
```

### DNS

**Configurer AVANT d'obtenir SSL:**

```
Type    Host                        Value
A       votre-domaine.com           <IP_VPS>
A       www.votre-domaine.com       <IP_VPS>
A       api.votre-domaine.com       <IP_VPS>
```

**Vérifier propagation DNS:**
```bash
nslookup votre-domaine.com
nslookup api.votre-domaine.com
```

### Ports

**Ouvrir sur le VPS:**
- 22 (SSH)
- 80 (HTTP → redirect HTTPS)
- 443 (HTTPS)

**NE PAS exposer publiquement:**
- 5432 (PostgreSQL)
- 6379 (Redis)
- 5500 (Web - via Nginx seulement)
- 5550 (API - via Nginx seulement)

---

## 🧪 Test en local (recommandé)

Avant de déployer sur VPS, tester en local:

```bash
# 1. Copier .env
cp .env.example .env
nano .env  # Configurer pour local

# 2. Générer certificats auto-signés (tests)
./scripts/setup-ssl.sh  # Option 3

# 3. Mettre à jour nginx.conf
# Remplacer domaines par localhost

# 4. Build et démarrer
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 5. Seed
docker-compose -f docker-compose.prod.yml exec api npm run db:seed

# 6. Tester
curl -k https://localhost  # -k pour ignorer certificat auto-signé
```

---

## 📞 Support

En cas de problème:

1. **Consultez la documentation:**
   - `DEPLOYMENT.md` - Guide complet
   - `nginx/README.md` - Configuration Nginx
   - `scripts/README.md` - Scripts de déploiement

2. **Vérifiez les logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f [service]
   ```

3. **Vérifiez les variables d'environnement:**
   ```bash
   cat .env  # Ne pas partager ce fichier!
   ```

4. **Testez les connexions:**
   ```bash
   # PostgreSQL
   docker-compose -f docker-compose.prod.yml exec postgres pg_isready

   # Redis
   docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

   # API
   curl https://api.votre-domaine.com/api/v1/health
   ```

---

## ✨ Résumé

Votre projet Tapp+ est maintenant **prêt pour le déploiement VPS** avec:

✅ Configuration production sécurisée
✅ SSL/TLS automatique (Let's Encrypt)
✅ Backups automatisés
✅ Scripts de déploiement
✅ Monitoring et health checks
✅ Documentation complète
✅ Sécurité renforcée (rate limiting, headers, non-root users)
✅ Architecture scalable

**Temps estimé de déploiement:** 1-2 heures (incluant configuration VPS)

🚀 **Prêt à déployer!**
