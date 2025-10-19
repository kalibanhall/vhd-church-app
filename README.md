# VHD Church App - Application de Gestion d'Église

> Une solution complète pour la gestion moderne du Ministère des Vaillants Hommes de David

**🌐 Application en ligne :** [www.vhd.app](https://www.vhd.app)  
**👨‍💻 Développée par :** Chris Ngozulu Kasongo ([@kalibanhall](https://github.com/kalibanhall))  
**🔗 Code source :** [GitHub Repository](https://github.com/kalibanhall/vhd-church-app)

---

## 🎯 Le Projet

Cette application web est née d'un besoin réel : moderniser la gestion administrative et spirituelle de notre église. 

En tant que développeur passionné par l'innovation technologique au service de la communauté, j'ai conçu cette solution pour :
- Simplifier la prise de rendez-vous avec les pasteurs
- Digitaliser le suivi des membres et de leurs besoins spirituels  
- Faciliter la communication interne et le partage de témoignages
- Moderniser la gestion des dons et contributions

**📱 Accessible partout :** L'application est déployée sur [www.vhd.app](https://www.vhd.app) et fonctionne sur tous les appareils.

## 🔨 Ce que j'ai construit

### Pour les Membres
**Interface intuitive** pour les activités quotidiennes de l'église :
- Prise de rendez-vous pastoraux en quelques clics
- Consultation des prédications et enseignements
- Participation aux sondages communautaires
- Demandes de prière et partage de témoignages
- Contributions financières sécurisées (en CDF)

### Pour les Pasteurs  
**Outils dédiés** pour l'accompagnement pastoral :
- Gestion centralisée des rendez-vous
- Suivi des demandes de prière
- Interface de validation des témoignages
- Communication directe avec les membres

### Pour l'Administration
**Tableau de bord complet** avec :
- Vue d'ensemble des activités
- Gestion des membres et événements
- Analytics et rapports
- Système de notifications

## 🚀 Architecture & Infrastructure

### Stack Technique
```
Frontend       │ Next.js 15 + React + TypeScript
Styling        │ Tailwind CSS (design system custom)
Backend        │ API Routes Next.js + Prisma ORM  
Base de données│ SQLite (dev) → PostgreSQL (production)
Hébergement    │ Vercel (www.vhd.app)
Auth           │ JWT avec middleware custom
UI             │ Composants maison + Lucide React
```

### Gestion Multi-Environnements
L'application s'adapte automatiquement à son environnement :

**🛠️ Développement (Local)**
- Base de données SQLite locale
- Hot reload avec Next.js dev server
- Logs détaillés pour le debugging

**🚀 Production (www.vhd.app)**  
- Base de données PostgreSQL (Supabase)
- Déploiement automatique via GitHub → Vercel
- Optimisations de performance activées
- Monitoring et analytics intégrés

### Migration Automatique
Le script `setup-environment.js` détecte automatiquement l'environnement et :
- Applique le bon schéma de base de données
- Valide les variables d'environnement  
- Configure les optimisations appropriées

**Pourquoi ces choix ?**
- **Next.js 15** : Performance, SEO, et déploiement simplifié
- **TypeScript** : Robustesse du code et meilleure maintenabilité
- **Prisma** : ORM moderne avec excellent DevX
- **Tailwind** : Rapidité de développement avec design cohérent

## ⚡ Démarrage

### 🌐 Version Production (Recommandée)
L'application est déjà en ligne et prête à utiliser :  
**👉 [www.vhd.app](https://www.vhd.app)**

### 🛠️ Développement Local

Pour contribuer au projet ou personnaliser l'application :

```bash
# Cloner le projet
git clone https://github.com/kalibanhall/vhd-church-app.git
cd vhd-church-app

# Installer les dépendances
npm install

# Configuration automatique de l'environnement
node setup-environment.js

# Configuration de la base de données
npx prisma generate
npx prisma db push

# Lancer en développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### � Migration vers Production

Pour déployer votre propre instance :

1. **Fork le repository** sur GitHub
2. **Créer un projet Supabase** pour la base PostgreSQL
3. **Déployer sur Vercel** avec les variables d'environnement
4. **Configurer le domaine** personnalisé

## 🔐 Variables d'Environnement

### Développement Local (.env.local)
```bash
DATABASE_URL="file:./database.db"
JWT_SECRET="votre-secret-jwt-securise-local"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-nextauth-local"
```

### Production (Vercel/Supabase)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="votre-secret-jwt-production-32-chars-minimum"
NEXTAUTH_URL="https://www.vhd.app"
NEXTAUTH_SECRET="votre-secret-nextauth-production"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

3. **Configuration de la base de données**
```bash
# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer votre DATABASE_URL dans .env.local
DATABASE_URL="mysql://username:password@localhost:3306/church_db"
## 💡 Fonctionnalités Clés

### 🔐 Authentification & Rôles
Système d'authentification robuste avec trois niveaux d'accès :
- **Fidèles** : Accès aux fonctionnalités membres
- **Pasteurs** : Gestion des rendez-vous + fonctionnalités membres  
- **Administrateurs** : Accès complet à la gestion

### 📱 Interface Responsive
Conçue mobile-first, l'application s'adapte parfaitement :
- Smartphones (320px+)
- Tablettes (768px+)
- Desktop (1024px+)

### ⚡ Performance
- Server-Side Rendering avec Next.js
- Optimisation automatique des images
- Code splitting et lazy loading
- Cache intelligent des données

### 🔔 Notifications en Temps Réel
Système de notifications push intégré au navigateur pour :
- Nouvelles demandes de rendez-vous
- Réponses aux prières
- Événements importants

## 🎨 Choix de Design

L'interface privilégie la **simplicité** et l'**accessibilité** :

- **Palette de couleurs apaisante** (bleus, blancs)
- **Typographie claire** et lisible
- **Navigation intuitive** avec sidebar contextuelle
- **Feedback utilisateur** pour chaque action

## 🗄️ Base de Données

Architecture optimisée avec Prisma :

```prisma
// Exemples de modèles principaux
model User {
  id              String    @id @default(cuid())
  firstName       String
  lastName        String  
  email           String    @unique
  role            String    @default("FIDELE")
  // Relations
  appointments    Appointment[]
  prayers         Prayer[]
  testimonies     Testimony[]
}

model Appointment {
  id              String    @id @default(cuid())
  appointmentDate DateTime
  startTime       DateTime
  endTime         DateTime
  status          String    @default("SCHEDULED")
  // Relations  
  user            User      @relation(fields: [userId], references: [id])
  pastor          User      @relation("PastorAppointments", fields: [pastorId], references: [id])
}
```

## 🚧 Défis Techniques Relevés

### 1. Gestion des Rendez-vous
**Problème** : Éviter les conflits d'horaires entre pasteurs et membres  
**Solution** : Système de créneaux avec validation côté serveur et interface temps réel

### 2. Notifications Cross-Platform  
**Problème** : Notifications fiables sur tous les appareils  
**Solution** : API Notifications Web + fallback SMS pour les appareils non compatibles

### 3. Performance Base de Données
**Problème** : Requêtes optimisées pour de gros volumes de données  
**Solution** : Index stratégiques + pagination côté serveur + cache Redis (production)

## 🔄 CI/CD et Déploiement

Pipeline de déploiement automatisé :

```bash
Git Push → GitHub Actions → Build → Tests → Deploy Vercel
```

- **Tests automatisés** à chaque push
- **Preview deployments** pour les pull requests  
- **Rollback automatique** en cas d'erreur
- **Monitoring** avec Vercel Analytics

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
## 🏗️ Évolutions Futures

Roadmap des prochaines fonctionnalités :

### Version 1.1
- [ ] App mobile native (React Native)
- [ ] Système de messagerie directe
- [ ] Calendrier d'événements interactif
- [ ] Intégration paiement mobile (M-Pesa, Airtel Money)

### Version 1.2  
- [ ] Multi-langues (Français, Lingala, Kikongo)
- [ ] Mode hors-ligne avec synchronisation
- [ ] Analytics avancées pour les pasteurs
- [ ] API publique pour intégrations tierces

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Règles de Contribution
- Code en **TypeScript** uniquement
- **Tests** requis pour les nouvelles fonctionnalités  
- **Documentation** mise à jour
- Respect des **conventions** de nommage

## 📞 Contact & Support

**Développeur Principal :** Chris Ngozulu Kasongo  
**GitHub :** [@kalibanhall](https://github.com/kalibanhall)  
**Email :** [Votre email de contact]

### 🐛 Signaler un Bug
Utilisez les [GitHub Issues](https://github.com/kalibanhall/vhd-church-app/issues) avec le template de bug report.

### � Demande de Fonctionnalité
Ouvrez une issue avec le label `enhancement` et décrivez votre besoin.

## 📄 Licence

Ce projet est développé pour le Ministère des Vaillants Hommes de David.  
Utilisation commerciale non autorisée sans accord préalable.

---

## 🙏 Remerciements

Merci à tous les membres du ministère qui ont testé l'application et fourni des retours précieux.

**Que cette technologie serve à l'édification de notre communauté spirituelle !**

---

*Développé avec passion par [Chris Ngozulu Kasongo](https://github.com/kalibanhall) - Octobre 2025*
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
