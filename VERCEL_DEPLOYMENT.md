# 🚀 GUIDE DÉPLOIEMENT VERCEL - ÉTAPE PAR ÉTAPE

## 🎯 CHRIS NGOZULU KASONGO (KalibanHall) - Déploiement Vercel

### 📋 ÉTAPE 1: CRÉER COMPTE VERCEL
**👉 Aller sur :** https://vercel.com

1. **Cliquer** "Sign Up"
2. **Choisir** "Continue with GitHub" ✅ (Recommandé)
3. **Autoriser** Vercel à accéder à votre GitHub
4. **Confirmer** votre compte

### 📋 ÉTAPE 2: IMPORTER VOTRE PROJET
1. **Cliquer** "New Project"
2. **Trouver** votre repository "vhd-church-app" 
3. **Cliquer** "Import" à côté de votre repo

### 📋 ÉTAPE 3: CONFIGURATION AUTOMATIQUE
Vercel détectera automatiquement :
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`

### 📋 ÉTAPE 4: VARIABLES D'ENVIRONNEMENT
**IMPORTANT :** Configurer avant le déploiement !

Dans la section "Environment Variables", ajouter :
```
DATABASE_URL = postgresql://[À configurer avec Supabase]
JWT_SECRET = votre-secret-jwt-production-32-chars
NEXTAUTH_URL = https://vhd-church-app.vercel.app
NEXTAUTH_SECRET = votre-secret-nextauth-production
```

### 📋 ÉTAPE 5: DÉPLOYER
1. **Cliquer** "Deploy" 
2. **Attendre** la construction (~2-3 minutes)
3. **Célébrer** ! 🎉

---

## 🔗 LIENS DIRECTS
- **Vercel Dashboard:** https://vercel.com
- **Votre App (bientôt):** https://vhd-church-app.vercel.app

---

*Guide par CHRIS NGOZULU KASONGO (KalibanHall)*