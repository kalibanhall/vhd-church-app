/**
 * =============================================================================
 * GUIDE DE DÉPLOIEMENT PRODUCTION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * =============================================================================
 */

# 🚀 Guide de Déploiement en Production

## ✅ Checklist Pré-déploiement

### 1. 🧹 Nettoyage du Code
```bash
# Exécuter le script de nettoyage automatique
node production-cleanup.js
```

### 2. 🔍 Vérifications de Sécurité
- [ ] Variables d'environnement sécurisées
- [ ] JWT_SECRET généré aléatoirement (32+ caractères)
- [ ] Suppression des logs de développement
- [ ] Validation des entrées utilisateur
- [ ] Protection CORS configurée

### 3. 📦 Construction Optimisée
```bash
# Installation des dépendances de production uniquement
npm ci --only=production

# Construction optimisée
npm run build

# Test de la construction
npm start
```

## 🌍 Options de Déploiement

### Option 1: Vercel (Recommandé)
```bash
# Installation de Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod
```

**Configuration Vercel:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Option 2: Netlify
```bash
# Build command: npm run build && npm run export
# Publish directory: out
```

### Option 3: Serveur VPS/Dédié

**Avec PM2:**
```bash
# Installation PM2
npm install -g pm2

# Démarrage de l'application
pm2 start npm --name "vhd-church-app" -- start
pm2 save
pm2 startup
```

**Avec Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Configuration Serveur

### Variables d'Environnement Production
```env
# Base de données
DATABASE_URL="file:./database_production.db"

# Authentification
JWT_SECRET="VOTRE_SECRET_JWT_SUPER_SECURISE_32_CARACTERES_MINIMUM"
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="VOTRE_SECRET_NEXTAUTH_UNIQUE"

# Configuration
NODE_ENV="production"
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🗄️ Base de Données Production

### Migration SQLite vers PostgreSQL (Optionnel)
```bash
# Installation des dépendances PostgreSQL
npm install pg @types/pg

# Modification du schema.prisma
# datasource db {
#   provider = "postgresql"
#   url      = env("DATABASE_URL")
# }

# Migration
npx prisma db push
```

### Sauvegarde Automatique
```bash
#!/bin/bash
# Créer un script de sauvegarde quotidienne
DATE=$(date +%Y%m%d_%H%M%S)
cp database.db "backups/backup_$DATE.db"

# Ajouter à crontab pour exécution quotidienne
# 0 2 * * * /path/to/backup-script.sh
```

## 🔐 Sécurité Production

### 1. HTTPS/SSL
```bash
# Avec Let's Encrypt (gratuit)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

### 2. Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3. Rate Limiting
```javascript
// Ajouter dans middleware.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

## 📊 Monitoring et Logs

### 1. Logs de Production
```javascript
// utils/logger.js
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

### 2. Health Check
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.3',
    author: 'CHRIS NGOZULU KASONGO (KalibanHall)'
  })
}
```

## 🔄 Maintenance

### Mise à jour en Production
```bash
# 1. Sauvegarde
cp -r /app /app_backup_$(date +%Y%m%d)

# 2. Arrêt de l'application
pm2 stop vhd-church-app

# 3. Mise à jour du code
git pull origin main
npm ci --only=production
npm run build

# 4. Migration de la base de données si nécessaire
npx prisma db push

# 5. Redémarrage
pm2 start vhd-church-app
```

### Scripts de Maintenance
```bash
# nettoyage-cache.sh
#!/bin/bash
rm -rf .next/cache
npm run build
pm2 restart vhd-church-app

# optimisation-db.sh
#!/bin/bash
npx prisma db push --force-reset
node seed-production-data.js
```

## 📈 Performance

### Optimisations
- Compression Gzip activée
- Cache des ressources statiques (CDN)
- Optimisation des images (next/image)
- Lazy loading des composants
- Minification CSS/JS

### Métriques à Surveiller
- Temps de réponse API
- Utilisation mémoire
- Taille de la base de données
- Taux d'erreur
- Temps de chargement des pages

## 🆘 Résolution de Problèmes

### Erreurs Communes
1. **Port 3000 déjà utilisé**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Erreur de permissions base de données**
   ```bash
   chmod 664 database.db
   ```

3. **Mémoire insuffisante**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

## 📞 Support

**Développeur:** CHRIS NGOZULU KASONGO (KalibanHall)  
**GitHub:** https://github.com/KalibanHall

---

*Guide créé par CHRIS NGOZULU KASONGO (KalibanHall) - Octobre 2025*