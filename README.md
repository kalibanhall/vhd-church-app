# MyChurchApp

Application web de gestion d'église - MyChurchApp.

**Production:** [www.mychurchapp.com](https://www.mychurchapp.com)

---

## Presentation

MyChurchApp est une solution complete de gestion d'eglise permettant aux membres, pasteurs et administrateurs de gerer efficacement les activites de la communaute.

### Fonctionnalites principales

**Espace Membres**
- Prise de rendez-vous pastoraux
- Consultation des predications et enseignements
- Demandes de priere et partage de temoignages
- Contributions financieres securisees (CDF)
- Participation aux sondages communautaires

**Espace Pasteurs**
- Gestion centralisee des rendez-vous
- Suivi des demandes de priere
- Validation des temoignages
- Communication directe avec les membres

**Administration**
- Tableau de bord complet avec analytics
- Gestion des membres et evenements
- Systeme de notifications
- Rapports et statistiques

---

## Stack Technique

| Composant       | Technologie                          |
|-----------------|--------------------------------------|
| Frontend        | Next.js 15, React, TypeScript        |
| Styling         | Tailwind CSS                         |
| Backend         | API Routes Next.js                   |
| Base de donnees | PostgreSQL (Supabase) / SQLite (dev) |
| Hebergement     | Vercel                               |
| Authentification| JWT avec middleware custom           |
| UI Components   | Composants custom + Lucide React     |

---

## Installation locale

### Prerequis

- Node.js 18+
- npm ou yarn

### Etapes

```bash
# Cloner le repository
git clone https://github.com/kalibanhall/mychurchapp.git
cd mychurchapp

# Installer les dependances
npm install

# Configurer l'environnement
cp .env.example .env.local

# Lancer le serveur de developpement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

---

## Configuration

### Variables d'environnement

Creer un fichier `.env.local` avec les variables suivantes :

```env
# Base de donnees
DATABASE_URL="file:./database.db"

# Authentification
JWT_SECRET="votre-secret-jwt"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-nextauth"

# Supabase (production uniquement)
SUPABASE_URL="https://votre-projet.supabase.co"
SUPABASE_ANON_KEY="votre-anon-key"
```

---

## Deploiement

### Vercel (Recommande)

1. Connecter le repository GitHub a Vercel
2. Configurer les variables d'environnement de production
3. Le deploiement est automatique a chaque push sur `main`

### Variables de production

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="votre-secret-jwt-production"
NEXTAUTH_URL="https://www.mychurchapp.com"
NEXTAUTH_SECRET="votre-secret-nextauth-production"
SUPABASE_URL="https://votre-projet.supabase.co"
SUPABASE_ANON_KEY="votre-anon-key"
```

---

## Structure du projet

```
src/
├── app/                    # Pages et routes Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Authentification
│   ├── dashboard/         # Tableau de bord
│   └── ...
├── components/            # Composants React
│   ├── ui/               # Composants UI reutilisables
│   ├── admin/            # Composants administration
│   └── user/             # Composants utilisateur
├── contexts/             # Contextes React
├── lib/                  # Utilitaires et configurations
└── types/                # Types TypeScript
```

---

## Roles utilisateurs

| Role          | Acces                                    |
|---------------|------------------------------------------|
| FIDELE        | Fonctionnalites membres de base          |
| OUVRIER       | Acces etendu + gestion de service        |
| PASTOR        | Gestion rendez-vous + acces pastoral     |
| ADMIN         | Acces complet a toutes les fonctionnalites|

---

## Scripts disponibles

```bash
npm run dev      # Serveur de developpement
npm run build    # Build de production
npm run start    # Demarrer en production
npm run lint     # Verification du code
```

---

## Licence

Projet prive - MyChurchApp

---

## Auteur

Chris Ngozulu Kasongo - [@kalibanhall](https://github.com/kalibanhall)
