# INSTRUCTIONS DÉPLOIEMENT VERCEL - VARIABLES D'ENVIRONNEMENT

## ⚠️ PROBLÈME DÉTECTÉ
L'erreur 500 est probablement causée par des variables d'environnement manquantes sur Vercel.

## 🔧 SOLUTION IMMÉDIATE

### 1. Aller sur Vercel Dashboard
- https://vercel.com/kalibanhall/vhd-church-app
- Onglet "Settings" > "Environment Variables"

### 2. Ajouter ces variables EXACTES :

```
DATABASE_URL = postgresql://postgres.yckqzuugkjzcemaxbwji:VhdChurch2025@aws-1-eu-west-2.pooler.supabase.com:6543/postgres

JWT_SECRET = VhdChurch2025SecretKey

NEXT_PUBLIC_APP_URL = https://vhd-church-app.vercel.app

NODE_ENV = production
```

### 3. Redéployer
Après ajout des variables, cliquer "Redeploy" ou pusher ce commit.

## 🚨 URGENT
Sans ces variables, l'API ne peut pas se connecter à la base de données.