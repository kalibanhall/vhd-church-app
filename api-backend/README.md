# MyChurchApp API Backend

API Backend pour l'application MyChurchApp, deployee sur Render.

## Stack Technique

| Composant       | Technologie        |
|-----------------|--------------------|
| Framework       | Express.js         |
| Language        | TypeScript         |
| Base de donnees | PostgreSQL         |
| Authentication  | JWT                |
| Deploiement     | Render             |

## Installation

```bash
cd api-backend
npm install
cp .env.example .env
npm run dev
```

## Variables d'environnement

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Scripts

```bash
npm run dev    # Developpement avec hot reload
npm run build  # Build TypeScript
npm start      # Production
```

## Deploiement Render

1. Creer un Web Service sur Render
2. Connecter le repository GitHub
3. Configurer:
   - Root Directory: `api-backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Ajouter les variables d'environnement
