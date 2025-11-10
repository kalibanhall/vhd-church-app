# VHD Church App - Application Flutter

## 📱 Application Mobile de Gestion d'Église

Application Flutter Android/iOS pour le Ministère des Vaillants Hommes de David, partageant la même base de données PostgreSQL Supabase que l'application web Next.js.

## 🎯 Fonctionnalités Principales

### 1. Authentification & Sécurité
- ✅ Connexion/Inscription avec Supabase Auth
- ✅ Reconnaissance faciale (ML Kit + TensorFlow Lite)
- ✅ Gestion des rôles (FIDELE, OUVRIER, PASTEUR, ADMIN)
- ✅ Stockage sécurisé des credentials

### 2. Gestion des Membres
- ✅ Profil utilisateur complet
- ✅ Annuaire des membres
- ✅ Historique de participation
- ✅ Carte de membre numérique
- ✅ Gestion des familles

### 3. Dons & Finances
- ✅ Enregistrement des dons
- ✅ Types de dons (offrandes, dîmes, projets)
- ✅ Méthodes de paiement multiples
- ✅ Historique des transactions
- ✅ Reçus numériques
- ✅ Projets de donation

### 4. Événements & Cultes
- ✅ Calendrier des événements
- ✅ Inscription aux événements
- ✅ Check-in avec reconnaissance faciale
- ✅ Gestion des présences
- ✅ Rappels automatiques

### 5. Sermons & Prédications
- ✅ Lecture audio/vidéo
- ✅ Téléchargement hors ligne
- ✅ Recherche par titre/pasteur/date
- ✅ Partage sur réseaux sociaux
- ✅ Versets bibliques associés

### 6. Rendez-vous avec Pasteurs
- ✅ Prise de rendez-vous
- ✅ Disponibilité des pasteurs
- ✅ Gestion des créneaux horaires
- ✅ Notifications de rappel
- ✅ Historique des rendez-vous

### 7. Prières & Témoignages
- ✅ Demandes de prière
- ✅ Soutien aux prières
- ✅ Partage de témoignages
- ✅ Modération (admin)
- ✅ Likes et commentaires

### 8. Chat & Messagerie
- ✅ Chat en temps réel (Stream Chat)
- ✅ Messages privés
- ✅ Groupes thématiques
- ✅ Partage de fichiers/médias
- ✅ Notifications push

### 9. Notifications
- ✅ Notifications push (Firebase)
- ✅ Notifications locales
- ✅ Rappels d'événements
- ✅ Alertes personnalisées
- ✅ Notifications d'anniversaires

### 10. Dashboard & Analytics
- ✅ Statistiques personnalisées
- ✅ Graphiques interactifs
- ✅ Rapports de présence
- ✅ Rapports financiers
- ✅ KPIs en temps réel

## 🏗️ Architecture

### Clean Architecture (3 Couches)

```
lib/
├── core/                   # Configuration & utilitaires
│   ├── config/
│   ├── constants/
│   ├── theme/
│   ├── utils/
│   └── errors/
├── data/                   # Couche de données
│   ├── datasources/
│   ├── models/
│   └── repositories/
├── domain/                 # Logique métier
│   ├── entities/
│   ├── repositories/
│   └── usecases/
└── presentation/           # UI & État
    ├── screens/
    ├── widgets/
    └── bloc/
```

### Stack Technique

- **Framework**: Flutter 3.x
- **Langage**: Dart 3.x
- **State Management**: BLoC/Cubit
- **Navigation**: GoRouter
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage + Hive (local)
- **Notifications**: Firebase Cloud Messaging
- **Chat**: Stream Chat Flutter
- **Reconnaissance Faciale**: ML Kit + TensorFlow Lite
- **Charts**: FL Chart + Syncfusion

## 📦 Installation

### Prérequis

- Flutter SDK ≥ 3.0.0
- Dart SDK ≥ 3.0.0
- Android Studio / Xcode
- Git

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/kalibanhall/vhd-church-app.git
cd vhd-church-app/flutter-app

# 2. Installer les dépendances
flutter pub get

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials Supabase

# 4. Générer les fichiers
flutter pub run build_runner build --delete-conflicting-outputs

# 5. Lancer l'application
flutter run
```

## ⚙️ Configuration

### Supabase

Créer un fichier `.env` à la racine avec:

```env
SUPABASE_URL=https://lwmyferidfbzcnggddob.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Firebase (Notifications)

1. Créer un projet Firebase
2. Télécharger `google-services.json` (Android)
3. Télécharger `GoogleService-Info.plist` (iOS)
4. Placer dans les dossiers respectifs

### Stream Chat (Messagerie)

```env
STREAM_API_KEY=your_stream_api_key
```

## 🚀 Build & Déploiement

### Android

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# App Bundle (Google Play)
flutter build appbundle --release
```

### iOS

```bash
# Debug
flutter build ios --debug

# Release
flutter build ios --release
```

## 🧪 Tests

```bash
# Tests unitaires
flutter test

# Tests d'intégration
flutter test integration_test/

# Coverage
flutter test --coverage
```

## 📱 Screenshots

_(À ajouter)_

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Copyright © 2025 CHRIS NGOZULU KASONGO (KalibanHall)

## 👨‍💻 Auteur

**CHRIS NGOZULU KASONGO (KalibanHall)**
- GitHub: [@KalibanHall](https://github.com/KalibanHall)
- Version: 1.0.0
- Date: Novembre 2025

## 📞 Support

Pour toute question ou problème, ouvrir une issue sur GitHub.

---

**Ministère des Vaillants Hommes de David** - Application Mobile
