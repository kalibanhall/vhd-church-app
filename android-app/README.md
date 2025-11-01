# MyChurchApp - Application Android

## 📱 Vue d'ensemble

Application Android native pour MyChurchApp, partageant la même base de données PostgreSQL que l'application web Next.js. Les utilisateurs peuvent créer un compte sur le web et l'utiliser directement sur mobile.

## 🎯 Fonctionnalités (196 fonctionnalités - 16 modules)

### 1️⃣ Gestion des Membres (15 fonctionnalités)
- Inscription, profil et photo
- Historique de participation
- Gestion des familles
- Groupes et départements
- Suivi des présences
- Carte numérique du membre
- Annuaire interne
- Gestion des anniversaires
- Communications ciblées
- Statistiques de croissance
- Exports
- Notifications personnalisées
- Suivi nouveaux membres
- Tableau de présence individuel

### 2️⃣ Gestion Financière (12 fonctionnalités)
- Enregistrement dons et dîmes
- Projets et campagnes
- Reçus fiscaux automatiques
- Rapports mensuels/annuels
- Suivi budget
- Dépenses catégorisées
- Tableaux de bord financiers
- Historique transactions
- Prévisions
- Export Excel/CSV
- Alertes budget
- Graphiques flux

### 3️⃣ Événements & Rendez-vous (10 fonctionnalités)
- Création/gestion événements
- Inscriptions en ligne
- Calendrier synchronisé
- Réservations salles
- Rappels automatiques
- Check-in événementiel
- Statistiques participation
- Récurrences
- Liste participants
- Intégration calendrier

### 4️⃣ Prédications & Médias (14 fonctionnalités)
- Upload audio/vidéo
- Streaming intégré
- Téléchargement hors ligne
- Séries et thèmes
- Recherche avancée
- Partage réseaux sociaux
- Podcast RSS
- Sous-titres
- Statistiques d'écoute
- Playlists
- Gestion vignettes
- Traductions
- Archivage
- Classement par impact

### 5️⃣ Prières & Témoignages (8 fonctionnalités)
- Demandes de prière
- Mur communautaire
- Notifications
- Suivi prières exaucées
- Partage témoignages
- Modération
- Catégories
- Statistiques

### 6️⃣ Messagerie & Chat (12 fonctionnalités)
- Chat temps réel
- Messages privés
- Groupes thématiques
- Notifications push
- Historique
- Partage fichiers
- Émojis et réactions
- Statuts online/offline
- Recherche messages
- Modération
- Audio/vidéo
- Messagerie inter-départements

### 7️⃣ Tableau de Bord & Analytics (15 fonctionnalités)
- Dashboard admin
- KPIs temps réel
- Graphiques croissance
- Rapports dons/présences
- Analyse démographique
- Prévisions
- Comparaisons annuelles
- Heatmaps
- Exports PDF/Excel/CSV
- Rapports automatiques
- Alertes intelligentes
- Tableaux personnalisés
- Indicateurs ponctualité
- Segmentation groupes
- Statistiques engagement

### 8️⃣ Administration (18 fonctionnalités)
- Gestion utilisateurs/rôles
- Permissions détaillées
- Personnel pastoral
- Configuration église
- Personnalisation UI
- Sauvegardes
- Sécurité
- Logs audit
- Notifications
- SMTP
- Multilingue
- RGPD
- Support technique
- Documentation
- Performance
- Versions
- Historique
- Multi-sites

### 9️⃣ Mobile & PWA (10 fonctionnalités)
- Mode hors ligne
- Notifications push natives
- Interface optimisée
- Synchronisation auto
- Scan QR codes
- Géolocalisation
- Accès cultes online
- Caméra & galerie
- Installation home screen
- PWA complète

### 🔟 Sécurité & Authentification (8 fonctionnalités)
- JWT
- 2FA
- Chiffrement complet
- Gestion sessions
- Mots de passe forts
- Protection CSRF/XSS
- SSL/TLS
- Détection connexions suspectes

### 11️⃣ Rapports & Exports (12 fonctionnalités)
- Rapports membres/dons
- Rapports présence/événements
- CSV personnalisés
- Automatisés
- Comparaisons temporelles
- Statistiques téléchargements
- Suivi croissance
- Email rapports
- PDF formatés
- Synthèse
- Engagement
- Historique

### 12️⃣ Intégrations & API (16 fonctionnalités)
- API REST
- Webhooks
- PayPal/Stripe/M-Pesa/Orange Money
- OAuth Google/Facebook
- Zoom/YouTube Live
- Facebook Live
- SMS Gateway (Twilio)
- Mailchimp
- Google Calendar
- Import/Export
- Partage réseaux sociaux
- Documentation API
- Authentification externe
- Statistiques API
- CRM

### 13️⃣ Personnalisation & Branding (8 fonctionnalités)
- Thèmes couleurs
- Logo & bannières
- Domaines personnalisés
- Templates emails
- Pages personnalisées
- Widgets
- Polices
- Multimarque

### 14️⃣ Workflows & Automatisation (10 fonctionnalités)
- Rappels auto
- Emails bienvenue
- Suivi visiteurs
- Anniversaires
- Approbation
- Validation témoignages
- Rappels dons
- Rapports auto
- CRM via API
- Notifications personnalisées

### 15️⃣ Maintenance & Support (12 fonctionnalités)
- Monitoring
- Logs système
- Gestion erreurs
- Health checks
- Mises à jour
- Tickets
- Chat support
- Base connaissances
- Tutoriels vidéo
- FAQ
- Feedback
- Journal updates

### 16️⃣ Reconnaissance Faciale & Présence Intelligente (16 fonctionnalités)
- Capture faciale
- Validation sécurisée
- Multi-visages (famille)
- Suppression
- Check-in automatique
- Dashboard temps réel
- Multi-services
- Mode manuel
- Check-in vidéo online
- Statistiques hybrides
- Anti-fraude
- Certificats présence
- Chiffrement E2E
- Consentement explicite
- RGPD
- Détection anomalies

## 🏗️ Architecture Technique

### Stack Android
- **Langage**: Kotlin 1.9+
- **UI**: Jetpack Compose
- **Architecture**: MVVM + Clean Architecture
- **DI**: Hilt/Dagger
- **Async**: Coroutines + Flow
- **Navigation**: Jetpack Navigation Compose
- **Network**: Retrofit + OkHttp
- **Sérialisation**: Kotlinx Serialization / Moshi
- **Base locale**: Room (cache offline)
- **Images**: Coil
- **Permissions**: Accompanist Permissions
- **Notifications**: Firebase Cloud Messaging
- **Reconnaissance faciale**: ML Kit Face Detection + TensorFlow Lite
- **Caméra**: CameraX
- **Médias**: ExoPlayer
- **Paiements**: Stripe SDK, PayPal SDK
- **Analytics**: Firebase Analytics
- **Crash Reporting**: Firebase Crashlytics

### Architecture en couches
```
📱 Presentation Layer (Composables + ViewModels)
    ↓
💼 Domain Layer (UseCases + Repositories interfaces)
    ↓
📊 Data Layer (Repositories impl + API + Local DB)
```

### Synchronisation avec le backend
- **API Base URL**: Configurable (dev/prod)
- **Authentification**: JWT tokens (compatible avec Next.js API)
- **Refresh tokens**: Gestion automatique
- **Cache offline**: Room + WorkManager pour sync
- **Conflict resolution**: Last-write-wins par défaut

## 📁 Structure du projet

```
android-app/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mychurchapp/
│   │   │   │   ├── di/              # Dependency Injection
│   │   │   │   ├── data/            # Data layer
│   │   │   │   │   ├── api/         # Retrofit interfaces
│   │   │   │   │   ├── local/       # Room database
│   │   │   │   │   ├── models/      # DTOs & Entities
│   │   │   │   │   └── repository/  # Repository implementations
│   │   │   │   ├── domain/          # Domain layer
│   │   │   │   │   ├── models/      # Domain models
│   │   │   │   │   ├── repository/  # Repository interfaces
│   │   │   │   │   └── usecases/    # Business logic
│   │   │   │   ├── presentation/    # Presentation layer
│   │   │   │   │   ├── auth/        # Login, Register, etc.
│   │   │   │   │   ├── members/     # Module Membres
│   │   │   │   │   ├── donations/   # Module Finances
│   │   │   │   │   ├── events/      # Module Événements
│   │   │   │   │   ├── sermons/     # Module Prédications
│   │   │   │   │   ├── prayers/     # Module Prières
│   │   │   │   │   ├── chat/        # Module Messagerie
│   │   │   │   │   ├── dashboard/   # Module Analytics
│   │   │   │   │   ├── admin/       # Module Administration
│   │   │   │   │   ├── facial/      # Module Reconnaissance Faciale
│   │   │   │   │   └── common/      # Composants réutilisables
│   │   │   │   ├── utils/           # Utilities
│   │   │   │   └── MyChurchApp.kt   # Application class
│   │   │   ├── res/                 # Resources
│   │   │   └── AndroidManifest.xml
│   │   └── test/                    # Tests unitaires
│   ├── build.gradle.kts
│   └── proguard-rules.pro
├── gradle/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
└── README.md
```

## 🚀 Installation & Configuration

### Prérequis
- Android Studio Hedgehog (2023.1.1) ou supérieur
- JDK 17+
- Android SDK 34
- Compte Firebase (pour notifications)
- Clés API (Stripe, PayPal, etc.)

### Étapes d'installation

1. **Cloner le projet**
```bash
cd android-app
```

2. **Configurer les clés API**
Créer `local.properties` :
```properties
sdk.dir=C\:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk
api.base.url=https://your-api-domain.com/api
api.base.url.dev=http://localhost:3000/api
stripe.publishable.key=pk_test_xxxxx
paypal.client.id=xxxxx
google.maps.api.key=xxxxx
```

3. **Configurer Firebase**
- Télécharger `google-services.json` depuis Firebase Console
- Placer dans `app/google-services.json`

4. **Build le projet**
```bash
./gradlew assembleDebug
```

5. **Lancer sur émulateur/device**
```bash
./gradlew installDebug
```

## 🔐 Authentification

L'application utilise JWT tokens compatibles avec l'API Next.js :

1. Login → API `/api/auth/login` → Retourne `accessToken` + `refreshToken`
2. Stockage sécurisé dans EncryptedSharedPreferences
3. Interceptor Retrofit ajoute `Authorization: Bearer {token}` automatiquement
4. Refresh automatique si 401 Unauthorized

## 📡 API Endpoints utilisés

```kotlin
// Auth
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password

// Members
GET    /api/members
GET    /api/members/{id}
POST   /api/members
PUT    /api/members/{id}
DELETE /api/members/{id}

// Donations
GET    /api/donations
POST   /api/donations
GET    /api/donations/stats

// Events
GET    /api/events
POST   /api/events
GET    /api/events/{id}
POST   /api/events/{id}/attend

// Sermons
GET    /api/sermons
POST   /api/sermons
GET    /api/sermons/{id}
POST   /api/sermons/{id}/view

// Prayers
GET    /api/prayers
POST   /api/prayers
POST   /api/prayers/{id}/support

// Testimonies
GET    /api/testimonies
POST   /api/testimonies
POST   /api/testimonies/{id}/like
POST   /api/testimonies/{id}/comment

// Chat
GET    /api/chat/channels
GET    /api/chat/channels/{id}/messages
POST   /api/chat/channels/{id}/messages
WebSocket /api/chat/ws

// Dashboard
GET    /api/dashboard/stats
GET    /api/dashboard/analytics

// Admin
GET    /api/admin/users
PUT    /api/admin/users/{id}/role
GET    /api/admin/logs

// Facial Recognition
POST   /api/facial/register
POST   /api/facial/check-in
GET    /api/facial/attendance
```

## 🎨 Design System

- **Material Design 3** (Material You)
- **Thème personnalisable** par église
- **Mode sombre/clair**
- **Couleurs primaires**: Configurables
- **Typographie**: Roboto / Montserrat
- **Iconographie**: Material Icons + Custom

## 📱 Écrans principaux

1. **Splash Screen** → Vérification auth
2. **Onboarding** (première installation)
3. **Login/Register**
4. **Dashboard** (Home)
5. **Profil Membre**
6. **Liste Membres**
7. **Donations**
8. **Calendrier Événements**
9. **Liste Prédications**
10. **Lecteur Médias**
11. **Prières & Témoignages**
12. **Messagerie**
13. **Analytics Admin**
14. **Paramètres**
15. **Reconnaissance Faciale**

## 🔔 Notifications Push

- **Firebase Cloud Messaging**
- Types de notifications :
  - Nouveaux événements
  - Rappels rendez-vous
  - Nouvelles prédications
  - Demandes de prière
  - Messages chat
  - Anniversaires
  - Alertes admin

## 📴 Mode Hors Ligne

- **Stratégie de cache** :
  - Room DB pour données essentielles
  - WorkManager pour synchronisation différée
  - Détection réseau automatique
  - Queue de requêtes en attente

## 🧪 Tests

```bash
# Tests unitaires
./gradlew test

# Tests instrumentés
./gradlew connectedAndroidTest

# Tests UI
./gradlew connectedDebugAndroidTest
```

## 📦 Build & Release

### Version Debug
```bash
./gradlew assembleDebug
```

### Version Release (signée)
```bash
./gradlew bundleRelease
```

### Upload sur Play Store
1. Créer un App Bundle (`.aab`)
2. Upload via Play Console
3. Configuration listing
4. Soumission pour review

## 🌍 Multilingue

- Français (fr)
- Anglais (en)
- Portugais (pt)
- Swahili (sw)

Fichiers : `res/values-{locale}/strings.xml`

## 🛡️ Sécurité

- **Obfuscation** : ProGuard/R8
- **Certificate Pinning** : OkHttp
- **Root Detection** : SafetyNet API
- **Encrypted Storage** : EncryptedSharedPreferences
- **Biométrie** : BiometricPrompt API
- **HTTPS Only**
- **Input Validation**
- **SQL Injection Prevention** (Room)

## 📸 Reconnaissance Faciale

### Technologies
- **ML Kit Face Detection**
- **TensorFlow Lite** (modèle personnalisé)
- **CameraX** (capture)

### Workflow
1. Capture photo profil → Extraction embeddings
2. Stockage chiffré embeddings
3. Check-in → Capture temps réel
4. Comparaison embeddings
5. Validation + Enregistrement présence
6. Dashboard temps réel

### RGPD
- Consentement explicite
- Droit suppression
- Chiffrement E2E
- Audit trail
- Transparence algorithmes

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Copyright © 2025 MyChurchApp - Tous droits réservés

## 👨‍💻 Auteur

**CHRIS NGOZULU KASONGO (KalibanHall)**
- GitHub: [@KalibanHall](https://github.com/KalibanHall)

## 📞 Support

- Email: support@mychurchapp.com
- Documentation: https://docs.mychurchapp.com
- Communauté: https://community.mychurchapp.com

---

**🎯 Une seule plateforme. Toute votre église. Zéro complexité.**
