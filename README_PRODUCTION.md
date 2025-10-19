# 🏛️ Ministère des Vaillants Hommes de David

## 📋 Application de Gestion d'Église Complète

**Auteur:** CHRIS NGOZULU KASONGO (KalibanHall)  
**GitHub:** [https://github.com/KalibanHall](https://github.com/KalibanHall)  
**Version:** 1.0.3  
**Date:** Octobre 2025

---

## 🎯 Description

Application web moderne et complète pour la gestion d'une église, développée avec les dernières technologies web. Cette solution offre un système complet de gestion des membres, des activités pastorales, et de la communication au sein de la communauté.

## 🚀 Fonctionnalités Principales

### 👥 Gestion des Membres
- Inscription et profils des membres
- Système de rôles (Admin, Pasteur, Fidèle, Ouvrier)
- Gestion des informations personnelles et spirituelles

### 📅 Système de Rendez-vous Pastoraux
- Prise de rendez-vous en ligne avec les pasteurs
- Gestion des disponibilités pastorales
- Notifications automatiques
- Interface dédiée pour les pasteurs

### 🎤 Prédications et Sermons
- Bibliothèque de prédications
- Upload et gestion des contenus multimédias
- Organisation par date et thème

### 💬 Témoignages
- Soumission de témoignages par les membres
- Système de validation par les administrateurs
- Commentaires et interactions

### 📊 Sondages et Enquêtes
- Création de sondages personnalisés
- Participation des membres
- Analyse des résultats en temps réel

### 🔔 Notifications
- Système de notifications en temps réel
- Support des notifications push du navigateur
- Redirections intelligentes selon le rôle

### 💬 Chat et Communications
- Système de messagerie interne
- Discussions de groupe
- Communications directes

### 💰 Gestion des Dons
- Suivi des contributions financières
- Rapports et statistiques
- Support de la devise locale (CDF)

### 🙏 Demandes de Prière
- Soumission de demandes de prière
- Support communautaire
- Suivi des réponses

## 🛠️ Technologies Utilisées

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS
- **Base de données:** SQLite avec Prisma ORM
- **Authentification:** JWT avec système de rôles
- **Icons:** Lucide React
- **Notifications:** API Notifications du navigateur

## 📦 Installation et Configuration

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Base de données SQLite

### Installation

1. **Cloner le projet**
```bash
git clone [votre-repo]
cd vhd-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env.local
```

4. **Configuration de la base de données**
```bash
npx prisma generate
npx prisma db push
```

5. **Démarrage en développement**
```bash
npm run dev
```

## 🌐 Déploiement en Production

### Variables d'environnement
```env
DATABASE_URL="file:./database.db"
JWT_SECRET="votre-secret-jwt-securise"
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="votre-secret-nextauth"
```

### Construction
```bash
npm run build
npm start
```

### Optimisations de production
- Compression des assets activée
- Minification du code
- Optimisation des images automatique
- Cache des ressources statiques

## 👨‍💼 Rôles et Permissions

### 🔧 Administrateur (ADMIN)
- Accès complet à toutes les fonctionnalités
- Gestion des membres et utilisateurs
- Configuration du système
- Analytics et rapports

### ⛪ Pasteur (PASTOR)
- Gestion des rendez-vous pastoraux
- Accès aux demandes de prière
- Validation des témoignages
- Communication avec les membres

### 🙏 Fidèle (FIDELE)
- Accès aux fonctionnalités membres
- Prise de rendez-vous
- Participation aux sondages
- Soumission de témoignages

### 🔨 Ouvrier (OUVRIER)
- Accès étendu aux fonctionnalités
- Support aux activités d'église
- Assistance administrative

## 🔐 Sécurité

- Authentification JWT sécurisée
- Validation des données côté serveur
- Protection CSRF
- Sanitisation des entrées utilisateur
- Gestion des permissions par rôle

## 📱 Responsive Design

Application entièrement responsive avec support:
- 📱 Mobile (iOS/Android)
- 📟 Tablette (iPad/Android)
- 💻 Desktop (Windows/Mac/Linux)
- 🖥️ Large screens (4K/Ultra-wide)

## 🎨 Interface Utilisateur

- Design moderne et intuitif
- Thème sombre/clair
- Animations fluides
- Accessibilité WCAG 2.1
- Support RTL pour l'internationalisation

## 📊 Analytics et Rapports

- Statistiques d'utilisation
- Rapports de participation
- Métriques des dons
- Analyse des sondages
- Tableaux de bord personnalisés

## 🔄 Mises à jour et Maintenance

- Système de mise à jour automatique
- Sauvegarde automatique des données
- Logs détaillés pour le debugging
- Monitoring des performances

## 📞 Support et Contact

**Développeur:** CHRIS NGOZULU KASONGO  
**Alias:** KalibanHall  
**GitHub:** [https://github.com/KalibanHall](https://github.com/KalibanHall)  
**Email:** [Votre email de contact]

## 📄 Licence

Ce projet est développé par CHRIS NGOZULU KASONGO (KalibanHall) pour le Ministère des Vaillants Hommes de David.

---

## 🎉 Remerciements

Merci à tous les membres du Ministère des Vaillants Hommes de David pour leur confiance et leur collaboration dans le développement de cette application.

**Que Dieu bénisse notre ministère et cette technologie au service de Son royaume ! 🙏**

---

*Développé avec ❤️ par CHRIS NGOZULU KASONGO (KalibanHall) - Octobre 2025*