# Configuration des Variables d'Environnement sur Vercel

## 🚨 IMPORTANT - Variables Requises

L'application nécessite les variables d'environnement Supabase pour fonctionner correctement (reconnaissance faciale, récupération de mot de passe, etc.).

## 📝 Instructions de Configuration

### 1. Accéder aux Paramètres Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `vhd-church-app`
3. Cliquez sur **Settings** (Paramètres)
4. Cliquez sur **Environment Variables** dans le menu latéral

### 2. Ajouter les Variables d'Environnement

Ajoutez chacune de ces variables en cliquant sur **Add New** :

#### ✅ Variables OBLIGATOIRES

| Nom de la Variable | Valeur | Environnement |
|-------------------|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lwmyferidfbzcnggddob.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bXlmZXJpZGZiemNuZ2dkZG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MTMyNjYsImV4cCI6MjA0NTE4OTI2Nn0.HiyTcsEqUjUqJ0xzJWJZu-mLy8PBGw6Zfv2tPkcGDUQ` | Production, Preview, Development |
| `DATABASE_URL` | `postgresql://postgres.lwmyferidfbzcnggddob:VhdChurch2025!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Production, Preview, Development |
| `JWT_SECRET` | `vhd-church-app-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `vhd-nextauth-secret-production-2025` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://vhd-church-app.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://vhd-church-app-git-main-kalibanhall.vercel.app` | Preview |

#### 📋 Variables de Configuration

| Nom de la Variable | Valeur | Environnement |
|-------------------|--------|---------------|
| `NODE_ENV` | `production` | Production, Preview |
| `NEXT_PUBLIC_APP_NAME` | `My Church App` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.3` | Production, Preview, Development |
| `JWT_EXPIRES_IN` | `7d` | Production, Preview, Development |

#### ⚙️ Variables de l'Église

| Nom de la Variable | Valeur | Environnement |
|-------------------|--------|---------------|
| `CHURCH_NAME` | `My Church App` | Production, Preview, Development |
| `CHURCH_ADDRESS` | `Avenue Kalemie 45, Limete, Kinshasa` | Production, Preview, Development |
| `CHURCH_PHONE` | `+243 81 234 56 78` | Production, Preview, Development |
| `CHURCH_EMAIL` | `contact@mychurchapp.cd` | Production, Preview, Development |

### 3. Redéployer l'Application

Après avoir ajouté toutes les variables :

1. Retournez à l'onglet **Deployments**
2. Cliquez sur les trois points (⋮) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Attendez que le déploiement se termine

### 4. Vérification

Une fois redéployé, testez ces fonctionnalités :

- ✅ **Page de connexion** - `/auth`
- ✅ **Mot de passe oublié** - `/forgot-password`
- ✅ **Réinitialisation** - `/reset-password`
- ✅ **Reconnaissance faciale** - `/facial-enrollment` et `/facial-attendance`

## 🔧 Alternative : Configuration via CLI Vercel

Si vous préférez utiliser la ligne de commande :

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Ajouter les variables (une par une)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add DATABASE_URL production
# ... etc

# Redéployer
vercel --prod
```

## 📚 Documentation

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Dashboard](https://supabase.com/dashboard/project/lwmyferidfbzcnggddob/settings/api)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## ⚠️ Sécurité

- ✅ Les variables `NEXT_PUBLIC_*` sont exposées côté client (normales)
- ✅ Les autres variables sont sécurisées côté serveur
- ⚠️ Ne jamais committer le fichier `.env` dans Git
- ⚠️ Les clés API dans `.env.example` sont des exemples publics

## 🆘 Support

Si vous rencontrez des erreurs après configuration :

1. Vérifiez que toutes les variables sont présentes
2. Assurez-vous qu'il n'y a pas d'espaces avant/après les valeurs
3. Redéployez complètement le projet
4. Consultez les logs Vercel pour plus de détails

---

**Dernière mise à jour** : Novembre 2025
