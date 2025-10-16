# Configuration Nginx - Tapp+

Ce répertoire contient la configuration Nginx pour le reverse proxy en production.

## 📁 Structure

```
nginx/
├── nginx.conf          # Configuration principale
├── ssl/                # Certificats SSL/TLS
│   ├── fullchain.pem   # Certificat + chaîne (à créer)
│   └── privkey.pem     # Clé privée (à créer)
└── logs/               # Logs Nginx (créé automatiquement)
```

## 🔒 Configuration SSL/TLS

### Option 1: Let's Encrypt (Recommandé)

Utilisez le script automatique:

```bash
./scripts/setup-ssl.sh
```

Ou manuellement:

```bash
# Installer Certbot
sudo apt install certbot

# Obtenir les certificats (arrêtez nginx d'abord)
docker-compose -f docker-compose.prod.yml stop nginx

# Obtenir le certificat
sudo certbot certonly --standalone \
  -d votre-domaine.com \
  -d www.votre-domaine.com \
  -d api.votre-domaine.com \
  --email votre-email@example.com \
  --agree-tos

# Copier les certificats
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem
```

### Option 2: Certificats existants

Si vous avez déjà des certificats:

```bash
# Copier vos certificats
cp /chemin/vers/fullchain.pem nginx/ssl/
cp /chemin/vers/privkey.pem nginx/ssl/

# Définir les permissions
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

### Option 3: Certificats auto-signés (Tests uniquement)

**⚠️ NE PAS utiliser en production!**

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=CM/ST=Littoral/L=Douala/O=Tapp+/CN=votre-domaine.com"

chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

## ⚙️ Personnalisation de nginx.conf

### Changer les domaines

Éditez `nginx/nginx.conf` et remplacez:

```nginx
# Ligne ~72 et ~156
server_name votre-domaine.com www.votre-domaine.com;

# Ligne ~130
server_name api.votre-domaine.com;
```

Par vos vrais domaines.

### Ajuster les limites de taux (Rate Limiting)

```nginx
# Ligne ~23 - API général
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# Ligne ~24 - Auth endpoints
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
```

Augmentez ou diminuez selon vos besoins.

### Taille maximale des uploads

```nginx
# Ligne ~21
client_max_body_size 10M;
```

### Timeouts

```nginx
# Lignes ~94-96 et ~178-180
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

## 🔍 Logs

### Accéder aux logs

```bash
# Access logs
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/access.log

# Error logs
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/error.log

# Logs locaux (si volume monté)
tail -f nginx/logs/access.log
tail -f nginx/logs/error.log
```

### Format des logs

Le format par défaut inclut:
- IP client
- Date/heure
- Méthode et URL
- Status code
- Taille de la réponse
- User agent
- IP forwarded

## 🛡️ Sécurité

### Headers de sécurité configurés

- `Strict-Transport-Security`: Force HTTPS pendant 1 an
- `X-Frame-Options`: Protection contre clickjacking
- `X-Content-Type-Options`: Empêche MIME sniffing
- `X-XSS-Protection`: Protection XSS navigateur
- `Referrer-Policy`: Contrôle des referrers

### Rate limiting

- **API générale**: 10 requêtes/seconde avec burst de 20
- **Endpoints auth**: 5 requêtes/minute avec burst de 3
- **Health check**: Pas de limite

### SSL/TLS

- Protocoles: TLS 1.2 et 1.3 uniquement
- Ciphers: Suite moderne et sécurisée
- Session cache: 10 minutes

## 🧪 Tester la configuration

### Vérifier la syntaxe

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Recharger sans downtime

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Tester HTTPS

```bash
# Vérifier le certificat
openssl s_client -connect votre-domaine.com:443 -servername votre-domaine.com

# Tester avec curl
curl -I https://votre-domaine.com
curl -I https://api.votre-domaine.com/api/v1/health
```

### Tester le rate limiting

```bash
# Test rapide (devrait être bloqué après plusieurs requêtes)
for i in {1..50}; do curl https://api.votre-domaine.com/api/v1/health; done
```

## 🔄 Renouvellement SSL

### Automatique (recommandé)

Configuré via cron (voir DEPLOYMENT.md):

```bash
0 0 1 */2 * certbot renew --quiet && docker-compose -f /opt/tappplus/docker-compose.prod.yml restart nginx
```

### Manuel

```bash
# Renouveler
sudo certbot renew

# Copier les nouveaux certificats
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl

# Redémarrer nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 📊 Monitoring

### Vérifier le status

```bash
# Via curl
curl http://localhost:80/nginx_status

# Métriques Docker
docker stats tappplus-nginx-prod
```

### Analyser les logs

```bash
# Requêtes par IP
awk '{print $1}' nginx/logs/access.log | sort | uniq -c | sort -rn | head -10

# Status codes
awk '{print $9}' nginx/logs/access.log | sort | uniq -c | sort -rn

# URLs les plus demandées
awk '{print $7}' nginx/logs/access.log | sort | uniq -c | sort -rn | head -10
```

## 🐛 Dépannage

### Erreur: "certificate verify failed"

- Vérifiez que fullchain.pem contient le certificat ET la chaîne
- Vérifiez les permissions (644 pour fullchain, 600 pour privkey)

### Erreur: "bind() to 0.0.0.0:80 failed"

- Un autre service utilise le port 80
- Vérifiez avec: `sudo lsof -i :80`
- Arrêtez le service: `sudo systemctl stop apache2` (exemple)

### Erreur: "could not build optimal types_hash"

- Augmentez `types_hash_max_size` dans nginx.conf

### Rate limiting trop strict

- Ajustez les valeurs dans nginx.conf (lignes 23-24)
- Rechargez: `docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload`

## 📚 Ressources

- [Documentation Nginx](https://nginx.org/en/docs/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Security Headers Check](https://securityheaders.com/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)

---

**Note**: Après toute modification de nginx.conf, testez la configuration avant de redémarrer:

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -t && \
docker-compose -f docker-compose.prod.yml restart nginx
```
