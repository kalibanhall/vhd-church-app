# 🚀 Guide de Déploiement Backend sur Render

## ✅ Statut

- ✅ Backend local testé et fonctionnel sur http://localhost:3001
- ✅ Health check: http://localhost:3001/v1/health
- ✅ Compilation TypeScript réussie
- ⏳ Déploiement Render en attente

## 📋 Étapes de Déploiement

### 1. Pousser le code sur GitHub

```bash
cd "c:\vhd app"
git add .
git commit -m "Add Express backend API with TypeScript"
git push origin main
```

### 2. Créer un compte Render (si nécessaire)

1. Aller sur https://render.com
2. Cliquer sur **Get Started for Free**
3. Se connecter avec **GitHub**
4. Autoriser Render à accéder à votre compte GitHub

### 3. Créer le Web Service

1. **Dashboard Render** → **New +** → **Web Service**

2. **Connecter le repository**:
   - Chercher `kalibanhall/vhd-church-app`
   - Cliquer sur **Connect**

3. **Configuration du service**:
   ```
   Name:              vhd-church-api
   Region:            Frankfurt (EU Central)
   Branch:            main
   Root Directory:    api-backend
   Runtime:           Node
   Build Command:     npm install && npm run build
   Start Command:     npm start
   Instance Type:     Free
   ```

4. **Variables d'environnement** (cliquer sur **Advanced** puis **Add Environment Variable**):

   ```env
   NODE_ENV=production
   PORT=10000
   API_VERSION=v1
   
   # ⚠️ IMPORTANT: Copier depuis Supabase Dashboard
   DATABASE_URL=postgresql://postgres.lwmyferidfbzcnggddob:[VOTRE_MOT_DE_PASSE]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   
   SUPABASE_URL=https://lwmyferidfbzcnggddob.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bXlmZXJpZGZiemNuZ2dkZG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjAzNTgsImV4cCI6MjA3NjY5NjM1OH0.LPCWcEpvGMBr5_M7v2R42OmfzpCSM6ZkNTq5ZFA7B_0
   
   JWT_SECRET=vhd-church-app-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key
   JWT_EXPIRES_IN=7d
   
   ALLOWED_ORIGINS=https://vhd-church-app.vercel.app,http://localhost:3000
   
   CHURCH_NAME=VHD Church App
   CHURCH_EMAIL=contact@vhdchurchapp.com
   ```

5. Cliquer sur **Create Web Service**

### 4. Attendre le déploiement

- Render va installer les packages (~2-3 min)
- Compiler TypeScript (~1 min)
- Démarrer le serveur (~30 sec)
- **Total: ~5 minutes**

### 5. Vérifier le déploiement

Une fois déployé, Render vous donnera une URL comme:
```
https://vhd-church-api.onrender.com
```

Testez les endpoints:

1. **Root endpoint**:
   ```
   https://vhd-church-api.onrender.com/
   ```
   
   Devrait retourner:
   ```json
   {
     "name": "VHD Church API",
     "version": "1.0.0",
     "status": "active",
     "endpoints": {
       "health": "/health",
       "api": "/v1",
       "docs": "/docs"
     }
   }
   ```

2. **Health check**:
   ```
   https://vhd-church-api.onrender.com/v1/health
   ```
   
   Devrait retourner:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-11T...",
     "uptime": 123.456,
     "database": "connected"
   }
   ```

## 🔧 Configuration Frontend (Next.js)

### 1. Ajouter la variable d'environnement sur Vercel

**Vercel Dashboard** → **vhd-church-app** → **Settings** → **Environment Variables**

Ajouter:
```
NEXT_PUBLIC_API_URL=https://vhd-church-api.onrender.com/v1
```

### 2. Créer un client API dans Next.js

Créer `src/lib/api-client.ts`:

```typescript
// src/lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

export const apiClient = new ApiClient();

// Exemples d'utilisation
export const membersApi = {
  getAll: (token: string) => apiClient.get('/members/all', token),
  getById: (id: string, token: string) => apiClient.get(`/members/${id}`, token),
  create: (data: any, token: string) => apiClient.post('/members/create', data, token),
  update: (id: string, data: any, token: string) => apiClient.put(`/members/${id}`, data, token),
  delete: (id: string, token: string) => apiClient.delete(`/members/${id}`, token),
};
```

### 3. Utiliser le client API

```typescript
// Dans un composant
import { membersApi } from '@/lib/api-client';
import { createClient } from '@/lib/supabase/client';

const MembersPage = () => {
  const supabase = createClient();
  
  const loadMembers = async () => {
    // Récupérer le token JWT de Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      console.error('Not authenticated');
      return;
    }
    
    try {
      const members = await membersApi.getAll(token);
      console.log('Members:', members);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };
  
  // ...
};
```

## 🔒 Migration de l'authentification

### Supprimer les anciennes routes API

Supprimer ces fichiers:
```
src/app/api/auth/register/route.ts
src/app/api/auth/login/route.ts
```

### Utiliser uniquement Supabase Auth

L'authentification se fait maintenant en 2 étapes:

1. **Frontend**: Utiliser Supabase Auth pour login/register
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
   });
   ```

2. **Backend**: Le token JWT de Supabase est vérifié par le middleware
   ```typescript
   // Le backend vérifie automatiquement le token
   const members = await fetch('https://vhd-church-api.onrender.com/v1/members/all', {
     headers: {
       Authorization: `Bearer ${session.access_token}`
     }
   });
   ```

## 🐛 Dépannage

### Le serveur ne démarre pas

1. Vérifier les logs Render: **Dashboard** → **vhd-church-api** → **Logs**
2. Vérifier que toutes les variables d'environnement sont définies
3. Vérifier que `DATABASE_URL` est correct (avec mot de passe)

### Erreur "Database connection failed"

1. Vérifier que `DATABASE_URL` utilise le **Pooler** de Supabase (port 6543)
2. Vérifier que le mot de passe est correct
3. Tester la connexion depuis Supabase Dashboard

### CORS Errors

1. Vérifier que `ALLOWED_ORIGINS` contient l'URL Vercel exacte
2. Redéployer le backend après modification

### Cold Start (15min sleep)

Le plan gratuit Render "endort" le service après 15min d'inactivité.

**Solutions**:
- Accepter le délai de 30s lors du premier appel
- Passer au plan payant ($7/mois) pour un uptime 24/7
- Utiliser un service de ping automatique (comme UptimeRobot)

## 📊 Monitoring

### Logs en temps réel

```
Dashboard Render → vhd-church-api → Logs
```

### Metrics

```
Dashboard Render → vhd-church-api → Metrics
```

Vous verrez:
- CPU usage
- Memory usage
- Request count
- Response time

## 🎯 Prochaines Étapes

1. ✅ Pousser le code sur GitHub
2. ✅ Déployer sur Render
3. ✅ Tester les endpoints
4. ✅ Configurer NEXT_PUBLIC_API_URL sur Vercel
5. ✅ Créer le client API dans Next.js
6. ✅ Migrer progressivement les appels API
7. ✅ Supprimer les anciennes routes /api/auth/*
8. ✅ Tester l'application complète

---

**Auteur**: CHRIS NGOZULU KASONGO (KalibanHall)
**Date**: 11 novembre 2025
