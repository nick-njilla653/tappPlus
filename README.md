# Meditache 🏥

Application web moderne de gestion des rappels d'interventions médicales avec notifications automatiques.

## 🚀 Fonctionnalités

### ✨ Fonctionnalités principales
- **Gestion des interventions** : Planification, modification et suivi des interventions médicales
- **Système de rappels automatiques** : Notifications J-1 et H-1 par SMS, Email et Push
- **Gestion des patients** : Fiches patients complètes avec historique médical
- **Consultations** : Enregistrement et suivi des consultations
- **Organisations** : Gestion multi-organisations (hôpitaux, cliniques)
- **Tableau de bord** : Vue d'ensemble avec statistiques en temps réel

### 🔔 Système de notifications
- **Rappels programmés** : J-1 (24h avant) et H-1 (1h avant) automatiques
- **Multi-canaux** : SMS (Twilio), Email (SendGrid), Push (FCM)
- **Gestion des échecs** : Retry automatique et manuel
- **Logs détaillés** : Suivi complet des envois

### 🛡️ Sécurité et conformité
- **Authentification JWT** : Tokens d'accès et de rafraîchissement
- **RBAC** : Contrôle d'accès basé sur les rôles
- **Audit logs** : Traçabilité complète des actions
- **RGPD** : Conformité et protection des données
- **Chiffrement** : Données sensibles chiffrées

## 🏗️ Architecture

### Stack technique
- **Frontend** : Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend** : NestJS + TypeScript + Prisma ORM
- **Base de données** : PostgreSQL
- **Cache/Queue** : Redis + BullMQ
- **Notifications** : Twilio (SMS) + SendGrid (Email) + FCM (Push)
- **Déploiement** : Docker + Docker Compose

### Structure du projet
```
meditache/
├── apps/
│   ├── api/                 # API NestJS
│   │   ├── src/
│   │   │   ├── auth/        # Authentification
│   │   │   ├── interventions/ # Gestion des interventions
│   │   │   ├── people/      # Gestion des patients
│   │   │   ├── consultations/ # Gestion des consultations
│   │   │   ├── reminders/   # Système de rappels
│   │   │   ├── notifications/ # Providers de notifications
│   │   │   └── workers/     # Workers de traitement
│   │   └── prisma/          # Schéma de base de données
│   └── web/                 # Frontend Next.js
│       └── src/
│           ├── app/         # Pages Next.js 13+
│           ├── components/  # Composants React
│           ├── lib/         # Utilitaires et API client
│           └── types/       # Types TypeScript
├── packages/                # Packages partagés
└── docker-compose.yml       # Configuration Docker
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- PostgreSQL (ou via Docker)
- Redis (ou via Docker)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd meditache
```

### 2. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer les variables d'environnement
nano .env
```

Variables importantes à configurer :
```env
# Base de données
DATABASE_URL="postgresql://meditache:meditache123@localhost:5432/meditache"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT (à changer en production)
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Notifications (optionnel pour les tests)
SENDGRID_API_KEY="your-sendgrid-api-key"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
```

### 3. Démarrage avec Docker (recommandé)
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### 4. Démarrage en développement
```bash
# Installer les dépendances
npm install

# Démarrer la base de données et Redis
docker-compose up -d postgres redis

# Configurer la base de données
cd apps/api
npm run db:push
npm run db:seed

# Démarrer l'API
npm run start:dev

# Dans un autre terminal, démarrer le frontend
cd apps/web
npm run dev

# Dans un autre terminal, démarrer le worker
cd apps/api
npm run worker:dev
```

### 5. Accès à l'application
- **Frontend** : http://localhost:5500
- **API** : http://localhost:5550
- **Documentation API** : http://localhost:5550/api/docs
- **Base de données** : localhost:5432

## 👤 Comptes de démonstration

### Administrateur
- **Email** : admin@meditache.com
- **Mot de passe** : admin123

### Médecin
- **Email** : docteur@meditache.com
- **Mot de passe** : docteur123

## 📱 Utilisation

### 1. Connexion
1. Accédez à http://localhost:5500
2. Connectez-vous avec un compte de démonstration
3. Explorez le tableau de bord

### 2. Créer une intervention
1. Cliquez sur "Nouvelle intervention"
2. Sélectionnez un patient
3. Définissez la date et l'heure
4. Les rappels J-1 et H-1 sont automatiquement programmés

### 3. Gérer les patients
1. Allez dans "Patients"
2. Ajoutez de nouveaux patients
3. Consultez l'historique médical

### 4. Suivre les rappels
1. Consultez la section "Rappels"
2. Vérifiez le statut des envois
3. Relancez les rappels échoués si nécessaire

## 🔧 Configuration des notifications

### SMS (Twilio)
1. Créez un compte Twilio
2. Récupérez Account SID et Auth Token
3. Configurez les variables d'environnement

### Email (SendGrid)
1. Créez un compte SendGrid
2. Générez une API Key
3. Configurez la variable SENDGRID_API_KEY

### Push (Firebase)
1. Créez un projet Firebase
2. Téléchargez le fichier de service
3. Configurez FCM_SERVICE_ACCOUNT

## 🧪 Tests

```bash
# Tests de l'API
cd apps/api
npm run test

# Tests du frontend
cd apps/web
npm run test

# Tests end-to-end
npm run test:e2e
```

## 📊 Monitoring

### Logs
```bash
# Logs de l'API
docker-compose logs -f api

# Logs du worker
docker-compose logs -f worker

# Logs de la base de données
docker-compose logs -f postgres
```

### Métriques
- **Health checks** : http://localhost:5550/health
- **Statistiques des rappels** : Via l'interface web
- **Logs des notifications** : Base de données

## 🚀 Déploiement en production

### 1. Configuration production
```bash
# Variables d'environnement sécurisées
export NODE_ENV=production
export JWT_SECRET="your-very-secure-secret"
export DATABASE_URL="postgresql://user:pass@prod-db:5432/meditache"
```

### 2. Build et déploiement
```bash
# Build des images Docker
docker-compose -f docker-compose.prod.yml build

# Déploiement
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Sauvegardes
```bash
# Sauvegarde de la base de données
docker-compose exec postgres pg_dump -U meditache meditache > backup.sql

# Restauration
docker-compose exec -T postgres psql -U meditache meditache < backup.sql
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Documentation** : [Wiki du projet]
- **Issues** : [GitHub Issues]
- **Email** : support@meditache.com

## 🙏 Remerciements

- [NestJS](https://nestjs.com/) - Framework Node.js
- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://prisma.io/) - ORM TypeScript
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Twilio](https://twilio.com/) - Service SMS
- [SendGrid](https://sendgrid.com/) - Service Email

---

**Meditache** - Simplifiez la gestion des rappels médicaux 🏥✨
