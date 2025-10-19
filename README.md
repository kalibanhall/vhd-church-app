# Minist�re Vaillants Hommes de David 1.0.3

Application de gestion moderne pour Minist�re Vaillants Hommes de David

## 🚀 Fonctionnalités

### ✅ Partie Utilisateurs
- 🏠 Tableau de bord personnel avec statistiques et activités récentes
- 📖 Gestion des prédications avec recherche et filtrage
- 💰 Système de dons sécurisé avec différents types et méthodes de paiement
- 📅 Prise de rendez-vous avec les pasteurs
- 🙏 Intentions de prière publiques et privées
- ✨ Témoignages avec système de likes et commentaires
- � Chat en temps réel avec canaux thématiques et réactions
- �👤 Profil utilisateur avec carte de membre numérique

### ✅ Partie Administration
- 📊 Tableau de bord admin avec statistiques complètes
- 👥 Gestion des membres avec recherche et filtres avancés
- ⚠️ Système d'alertes pour les absences prolongées
- 🔍 Interface de modération pour les témoignages

### ✅ Design et UX
- 📱 Design responsive adapté à tous les appareils
- 🎨 Interface moderne avec palette de couleurs spirituelle
- 🧭 Navigation intuitive avec sidebar et header
- ✨ Animations fluides et micro-interactions
- ♿ Accessibilité respectée

## 🛠️ Stack Technique

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Base de données:** MySQL avec Prisma ORM
- **Authentification:** JWT, bcryptjs
- **Icônes:** Lucide React
- **Formulaires:** React Hook Form, Zod

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd "Minist�re Vaillants Hommes de David 1.0.3"
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de la base de données**
```bash
# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer votre DATABASE_URL dans .env.local
DATABASE_URL="mysql://username:password@localhost:3306/church_db"

# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la base de données
npm run db:push
```

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
src/
├── app/                    # App Router de Next.js
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/
│   ├── layout/            # Composants de layout
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── user/              # Pages utilisateur
│   │   ├── HomePage.tsx
│   │   ├── SermonsPage.tsx
│   │   ├── DonationsPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── PrayersPage.tsx
│   │   ├── TestimoniesPage.tsx
│   │   ├── ChatPage.tsx
│   │   └── ProfilePage.tsx
│   ├── admin/             # Pages administrateur
│   │   ├── AdminDashboard.tsx
│   │   └── MembersManagement.tsx
│   ├── ui/                # Composants UI réutilisables
│   └── Dashboard.tsx      # Composant principal
├── lib/
│   ├── prisma.ts          # Configuration Prisma
│   ├── utils.ts           # Utilitaires
│   └── mockData.ts        # Données de test
├── types/
│   └── index.ts           # Types TypeScript
└── prisma/
    └── schema.prisma      # Schéma de base de données
```

## 🗄️ Base de Données

Le schéma de base de données inclut :

- **Users** - Gestion des membres, pasteurs, admins
- **Donations** - Système complet de dons (dîmes, offrandes, libéralités)
- **Events** - Événements et cultes
- **Attendances** - Gestion des présences (avec reconnaissance faciale)
- **Sermons** - Prédications audio/vidéo
- **Appointments** - Rendez-vous pastoraux
- **Prayers** - Intentions de prière
- **Testimonies** - Témoignages avec modération
- **Chat** - Discussion en temps réel avec canaux thématiques
- **Notifications** - Système de notifications

## 📱 Fonctionnalités Avancées

### 💬 Système de Chat
- **Canaux thématiques** : Général, Prières, Annonces, Jeunes, Responsables
- **Messages en temps réel** avec statuts en ligne
- **Réactions aux messages** (👍, ❤️, 🙏, etc.)
- **Réponses aux messages** et mentions d&apos;utilisateurs
- **Partage de fichiers** et images
- **Notifications** de nouveaux messages
- **Modération avancée** pour les canaux d&apos;annonces
- **Historique des conversations** avec recherche
- **Statuts de présence** : En ligne, Absent, Occupé, Hors ligne

### Reconnaissance Faciale
- Enregistrement des présences automatique
- Détection des visiteurs inconnus
- Seuil de confiance configurable

### Système de Dons
- Dîmes périodiques (hebdomadaire, mensuelle)
- Offrandes par culte
- Libéralités pour projets spécifiques
- Rapports financiers détaillés

### Gestion des Événements
- Événements récurrents
- Rappels automatiques
- QR codes pour check-in rapide

## 🎨 Personnalisation

### Couleurs de l'Église
Les couleurs principales peuvent être modifiées dans `tailwind.config.js` et `globals.css` :

```css
:root {
  --primary: 221.2 83.2% 53.3%;    /* Bleu église */
  --secondary: 210 40% 96%;        /* Gris clair */
  --accent: 210 40% 96%;           /* Accent */
}
```

### Logo et Branding
- Remplacer le logo dans `/public/logo.png`
- Modifier le nom dans `layout.tsx`
- Personnaliser les couleurs du gradient dans `globals.css`

## 🔧 Scripts Disponibles

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Build pour la production
npm run start        # Démarrer en mode production
npm run lint         # Vérifier le code
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser le schéma vers la DB
npm run db:studio    # Ouvrir Prisma Studio
```

## 🔐 Sécurité

- Authentification JWT sécurisée
- Hashage des mots de passe avec bcryptjs
- Validation des données avec Zod
- Protection CSRF intégrée
- Logs d'audit pour toutes les actions

## 📖 Documentation API

L'API REST suit les conventions RESTful :

```
GET    /api/users              # Liste des utilisateurs
POST   /api/users              # Créer un utilisateur
GET    /api/users/:id          # Détails d'un utilisateur
PUT    /api/users/:id          # Modifier un utilisateur
DELETE /api/users/:id          # Supprimer un utilisateur

GET    /api/donations          # Liste des dons
POST   /api/donations          # Enregistrer un don
GET    /api/donations/reports  # Rapports financiers

GET    /api/events             # Liste des événements
POST   /api/events             # Créer un événement
GET    /api/events/:id/attendances # Présences

# ... autres endpoints
```

## 🌍 Internationalisation

L'application est actuellement en français mais peut être étendue :

- Messages d'interface dans `src/lib/i18n/`
- Formats de date/heure localisés
- Support multi-devises pour les dons

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t church-app .
docker run -p 3000:3000 church-app
```

### Variables d'environnement
```env
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="your-secret"
JWT_SECRET="your-jwt-secret"
CLOUDINARY_URL="cloudinary://..."
STRIPE_SECRET_KEY="sk_..."
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou support :

- Email: kasongongozulu@gmail.com
- Tél: +243 821594233
- Discord: 

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Minist�re Vaillants Hommes de David pour la confiance
- Communauté Next.js pour l'excellent framework
- Équipe Prisma pour l'ORM fantastique
- Tous les contributeurs du projet

---

**Fait avec ❤️ pour Minist�re Vaillants Hommes de David**
