# 🚨 CONFIGURATION CRITIQUE VERCEL - Variables d'Environnement

## ❌ Problème Actuel
L'application mobile ne peut pas se connecter car `NEXT_PUBLIC_API_URL` n'est **PAS** configurée sur Vercel.

## ✅ Solution Immédiate

### Étape 1: Aller sur Vercel Dashboard
1. Ouvrir https://vercel.com/kalibanhalls-projects/vhd-church-app
2. Cliquer sur **Settings** (en haut)
3. Cliquer sur **Environment Variables** (menu gauche)

### Étape 2: Ajouter la Variable Critique
Cliquez sur **Add New** et ajoutez:

```
Name: NEXT_PUBLIC_API_URL
Value: https://vhd-church-api.onrender.com/v1
Environment: Production, Preview, Development (cocher les 3)
```

### Étape 3: Ajouter les Autres Variables (optionnel mais recommandé)

```
Name: DATABASE_URL
Value: postgresql://postgres.lwmyferidfbzcnggddob:QualisApp2025@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
Environment: Production, Preview, Development
```

```
Name: JWT_SECRET
Value: vhd-church-app-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key
Environment: Production, Preview, Development
```

### Étape 4: Redéployer
Après avoir ajouté les variables:
1. Cliquer sur **Deployments** (en haut)
2. Trouver le dernier déploiement
3. Cliquer sur les **3 points** ⋯
4. Cliquer sur **Redeploy**
5. Confirmer le redéploiement

## 🎯 Vérification

Après le redéploiement (2-3 minutes):
1. Ouvrir l'app mobile: https://vhd-church-app.vercel.app
2. Se connecter avec: `chriskasongo@vhd.app` / `QualisApp2025`
3. Vérifier qu'il n'y a plus d'erreurs 401 dans la console

## 📋 Checklist

- [ ] Variable `NEXT_PUBLIC_API_URL` ajoutée sur Vercel
- [ ] Variable `DATABASE_URL` ajoutée sur Vercel
- [ ] Variable `JWT_SECRET` ajoutée sur Vercel
- [ ] Application redéployée
- [ ] Test de connexion mobile réussi
- [ ] Plus d'erreurs 401 dans la console

## 🔍 Diagnostic

Si les erreurs 401 persistent après:
1. Vider le cache du navigateur mobile
2. Supprimer `localStorage` (Inspecter > Application > Local Storage > Clear All)
3. Se reconnecter

## 📝 Note Technique

Les fichiers `.env.local` ne sont **PAS** déployés sur Vercel (ils sont dans `.gitignore`).
Les variables d'environnement doivent être configurées directement dans Vercel Dashboard.

`NEXT_PUBLIC_*` variables sont **publiques** et accessibles côté client (nécessaire pour l'API URL).
