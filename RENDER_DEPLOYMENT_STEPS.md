# 🚀 Déploiement de l'API sur Render - Instructions Complètes

## ✅ Prérequis Complétés
- ✅ Code poussé sur GitHub (kalibanhall/vhd-church-app)
- ✅ API backend dans le dossier `api-backend/`
- ✅ DATABASE_URL Supabase récupéré

## 📋 ÉTAPES À SUIVRE MAINTENANT

### Étape 1 : Créer le Web Service sur Render

1. **Ouvrir Render** : https://dashboard.render.com
   - Se connecter avec votre compte GitHub

2. **Créer un nouveau Web Service** :
   - Cliquer sur **"New +"** (en haut à droite)
   - Sélectionner **"Web Service"**

3. **Connecter le repository** :
   - Chercher : `kalibanhall/vhd-church-app`
   - Cliquer sur **"Connect"** à côté du repository

### Étape 2 : Configuration du Service

Remplir le formulaire avec ces valeurs EXACTES :

```
┌─────────────────────────────────────────────────────────────┐
│ CONFIGURATION GÉNÉRALE                                       │
├─────────────────────────────────────────────────────────────┤
│ Name:              vhd-church-api                           │
│ Region:            Frankfurt (EU Central)                   │
│ Branch:            main                                     │
│ Root Directory:    api-backend                              │
│ Runtime:           Node                                     │
│ Build Command:     npm install && npm run build             │
│ Start Command:     npm start                                │
│ Instance Type:     Free                                     │
└─────────────────────────────────────────────────────────────┘
```

### Étape 3 : Variables d'Environnement

**IMPORTANT** : Cliquer sur **"Advanced"** puis ajouter ces variables d'environnement :

Copier-coller ces variables UNE PAR UNE :

```env
# 1. NODE_ENV
NODE_ENV=production

# 2. PORT
PORT=10000

# 3. API_VERSION
API_VERSION=v1

# 4. DATABASE_URL (⚠️ CRITIQUE - avec pgbouncer=true)
DATABASE_URL=postgresql://postgres.lwmyferidfbzcnggddob:QualisApp2025@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# 5. SUPABASE_URL
SUPABASE_URL=https://lwmyferidfbzcnggddob.supabase.co

# 6. SUPABASE_ANON_KEY
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bXlmZXJpZGZiemNuZ2dkZG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjAzNTgsImV4cCI6MjA3NjY5NjM1OH0.LPCWcEpvGMBr5_M7v2R42OmfzpCSM6ZkNTq5ZFA7B_0

# 7. JWT_SECRET
JWT_SECRET=vhd-church-app-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key

# 8. JWT_EXPIRES_IN
JWT_EXPIRES_IN=7d

# 9. ALLOWED_ORIGINS
ALLOWED_ORIGINS=https://vhd-church-app.vercel.app,http://localhost:3000

# 10. CHURCH_NAME
CHURCH_NAME=VHD Church App

# 11. CHURCH_EMAIL
CHURCH_EMAIL=contact@vhdchurchapp.com
```

### Étape 4 : Déployer

1. Vérifier que TOUTES les variables sont bien ajoutées (11 au total)
2. Cliquer sur **"Create Web Service"** (en bas)
3. Render va commencer le déploiement automatiquement

### Étape 5 : Suivre le Déploiement

Vous verrez les logs en temps réel :
- ⏳ Installation des packages (~2-3 min)
- ⏳ Compilation TypeScript (~1 min)
- ⏳ Démarrage du serveur (~30 sec)
- ✅ **Deploy live** quand c'est prêt

**Durée totale estimée : 5-7 minutes**

### Étape 6 : Récupérer l'URL de l'API

Une fois déployé, Render vous donnera une URL comme :
```
https://vhd-church-api.onrender.com
```

ou 

```
https://vhd-church-api-xxxx.onrender.com
```

### Étape 7 : Tester l'API

Testez ces endpoints dans votre navigateur :

1. **Root endpoint** :
   ```
   https://[VOTRE-URL].onrender.com/
   ```
   
2. **Health check** :
   ```
   https://[VOTRE-URL].onrender.com/v1/health
   ```

3. **API routes** :
   ```
   https://[VOTRE-URL].onrender.com/v1/members
   https://[VOTRE-URL].onrender.com/v1/donations
   ```

## 🎯 CHECKLIST FINALE

Avant de cliquer sur "Create Web Service", vérifiez :

- [ ] Root Directory = `api-backend`
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] PORT = 10000
- [ ] DATABASE_URL contient `?pgbouncer=true` à la fin
- [ ] 11 variables d'environnement ajoutées
- [ ] Instance Type = Free

## 🆘 En cas de problème

Si le déploiement échoue :
1. Vérifier les logs dans Render
2. Vérifier que toutes les variables d'environnement sont correctes
3. Vérifier que le Root Directory est bien `api-backend`

## 📞 Prochaines étapes après déploiement

Une fois l'API déployée sur Render :
1. Récupérer l'URL Render
2. Mettre à jour Vercel avec la nouvelle URL API
3. Tester l'application complète

---

**Créé le :** 11 novembre 2025
**Status :** Prêt pour déploiement
