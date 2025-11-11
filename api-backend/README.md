# VHD Church API Backend

API Backend centralisée pour l'application VHD Church, déployée sur Render.

## 🚀 Architecture

- **Framework**: Express.js + TypeScript
- **Base de données**: PostgreSQL (Supabase)
- **Authentification**: JWT + Supabase Auth
- **Déploiement**: Render
- **CORS**: Configuré pour Vercel + Mobile

## 📦 Installation Locale

```bash
cd api-backend
npm install
cp .env.example .env
# Éditer .env avec vos valeurs
npm run dev
```

## 🌐 Déploiement sur Render

### 1. Créer un compte Render
- Allez sur https://render.com
- Créez un compte (gratuit)

### 2. Créer un nouveau Web Service

1. **Dashboard Render** → **New** → **Web Service**
2. **Connecter votre repo GitHub** : `kalibanhall/vhd-church-app`
3. **Configuration** :
   - **Name**: `vhd-church-api`
   - **Region**: `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Root Directory**: `api-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Variables d'environnement

Dans **Environment** → **Add Environment Variable**, ajoutez :

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.lwmyferidfbzcnggddob:VhdChurch2025!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
SUPABASE_URL=https://lwmyferidfbzcnggddob.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bXlmZXJpZGZiemNuZ2dkZG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjAzNTgsImV4cCI6MjA3NjY5NjM1OH0.LPCWcEpvGMBr5_M7v2R42OmfzpCSM6ZkNTq5ZFA7B_0
JWT_SECRET=vhd-church-app-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://vhd-church-app.vercel.app,http://localhost:3000
CHURCH_NAME=My Church App
CHURCH_EMAIL=contact@mychurchapp.com
```

### 4. Déployer

- Cliquez sur **Create Web Service**
- Render va builder et déployer automatiquement
- Attendez ~5 minutes

### 5. URL de l'API

Une fois déployé, Render vous donnera une URL :
```
https://vhd-church-api.onrender.com
```

## 📡 Endpoints

### Health Check
```bash
GET https://vhd-church-api.onrender.com/health
```

### API v1
```bash
GET https://vhd-church-api.onrender.com/v1/members
GET https://vhd-church-api.onrender.com/v1/donations
GET https://vhd-church-api.onrender.com/v1/preachings
```

Tous les endpoints nécessitent un header `Authorization: Bearer <token>`

## 🔧 Configuration Frontend (Next.js)

### 1. Ajouter la variable d'environnement sur Vercel

**Vercel Dashboard** → **vhd-church-app** → **Settings** → **Environment Variables**

```
NEXT_PUBLIC_API_URL=https://vhd-church-api.onrender.com/v1
```

### 2. Créer un fichier API client

```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/v1';

export const fetchMembers = async (token: string) => {
  const response = await fetch(`${API_URL}/members`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};
```

## 🔒 Sécurité

- ✅ CORS configuré pour Vercel uniquement
- ✅ Helmet pour les headers de sécurité
- ✅ Rate limiting prévu
- ✅ Validation des inputs
- ✅ Tokens JWT avec expiration

## 📊 Monitoring

- **Logs Render** : Dashboard Render → Logs
- **Health Check** : `/health` endpoint
- **Uptime** : Render offre monitoring gratuit

## 🆓 Plan Gratuit Render

- ✅ 750 heures/mois (suffisant pour 1 service 24/7)
- ✅ 512 MB RAM
- ✅ Partage CPU
- ⚠️ Sleep après 15min d'inactivité (se réveille en ~30s)

## 🚀 Prochaines étapes

1. ✅ Déployer sur Render
2. ✅ Tester le health check
3. ✅ Configurer NEXT_PUBLIC_API_URL sur Vercel
4. ✅ Migrer progressivement les appels API du frontend
5. ✅ Implémenter les routes manquantes

## 📝 Notes

- Le service gratuit Render "dort" après 15min sans requête
- Première requête après sleep prend ~30s (cold start)
- Pour éviter ça : passer au plan payant ($7/mois) ou ping automatique

## 🆘 Support

- Documentation Render : https://render.com/docs
- Dashboard : https://dashboard.render.com

---

**Auteur**: CHRIS NGOZULU KASONGO (KalibanHall)
**Version**: 1.0.0
