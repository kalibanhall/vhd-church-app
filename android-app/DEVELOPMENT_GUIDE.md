# MyChurchApp Android - Guide de Développement Complet

## ✅ État actuel du projet

### Ce qui a été créé

#### 1. Configuration du projet (✅ Complété)
- `settings.gradle.kts` - Configuration Gradle
- `build.gradle.kts` (root) - Plugins et dépendances globales
- `app/build.gradle.kts` - Configuration de l'application
- `gradle.properties` - Propriétés Gradle
- `AndroidManifest.xml` - Manifest avec toutes les permissions nécessaires

#### 2. Modèles de données (✅ Complété)
Tous les modèles correspondent EXACTEMENT au schéma PostgreSQL utilisé par l'application web :

- ✅ `User.kt` - Modèle utilisateur (15 fonctionnalités gestion membres)
- ✅ `Donation.kt` - Modèle dons et projets (12 fonctionnalités finances)
- ✅ `Event.kt` - Modèle événements et présences (10 fonctionnalités)
- ✅ `Sermon.kt` - Modèle prédications (14 fonctionnalités)
- ✅ `Appointment.kt` - Modèle rendez-vous (inclus dans événements)
- ✅ `Prayer.kt` - Modèle prières (8 fonctionnalités)
- ✅ `Testimony.kt` - Modèle témoignages (8 fonctionnalités)
- ✅ `Chat.kt` - Modèle messagerie (12 fonctionnalités)
- ✅ `Notification.kt` - Modèle notifications
- ✅ `Analytics.kt` - Modèles analytics et rapports (15 fonctionnalités)
- ✅ `ApiModels.kt` - Modèles requêtes/réponses API

#### 3. Interfaces API Retrofit (✅ Complété)
Toutes les interfaces correspondent aux endpoints Next.js/PostgreSQL existants :

- ✅ `AuthApiService.kt` - Authentification (login, register, refresh, etc.)
- ✅ `MembersApiService.kt` - Gestion membres
- ✅ `DonationsApiService.kt` - Gestion finances et projets
- ✅ `EventsApiService.kt` - Gestion événements
- ✅ `SermonsApiService.kt` - Gestion prédications/médias
- ✅ `AppointmentsApiService.kt` - Gestion rendez-vous
- ✅ `PrayersTestimoniesApiService.kt` - Prières et témoignages
- ✅ `ChatApiService.kt` - Messagerie en temps réel
- ✅ `AnalyticsNotificationsApiService.kt` - Analytics, rapports, notifications, profil

### Ce qui reste à faire

#### 1. Configuration Dependency Injection (Hilt)
```kotlin
// À créer : app/src/main/java/com/mychurchapp/di/

- NetworkModule.kt       // Configuration Retrofit, OkHttp, Moshi
- DatabaseModule.kt      // Configuration Room (cache offline)
- RepositoryModule.kt    // Injection des repositories
- UseCaseModule.kt       // Injection des use cases
```

#### 2. Implémentation Data Layer
```kotlin
// À créer : app/src/main/java/com/mychurchapp/data/

- local/
  - AppDatabase.kt                 // Room Database
  - dao/*.kt                       // DAOs pour cache offline
  - entities/*.kt                  // Entities Room
  
- repository/
  - AuthRepository.kt
  - MembersRepository.kt
  - DonationsRepository.kt
  - EventsRepository.kt
  - SermonsRepository.kt
  - AppointmentsRepository.kt
  - PrayersRepository.kt
  - TestimoniesRepository.kt
  - ChatRepository.kt
  - NotificationsRepository.kt
  
- interceptors/
  - AuthInterceptor.kt             // Ajout token JWT
  - ErrorInterceptor.kt            // Gestion erreurs HTTP
```

#### 3. Implémentation Domain Layer
```kotlin
// À créer : app/src/main/java/com/mychurchapp/domain/

- usecases/
  - auth/
    - LoginUseCase.kt
    - RegisterUseCase.kt
    - LogoutUseCase.kt
  - members/
    - GetMembersUseCase.kt
    - SearchMembersUseCase.kt
  - donations/
    - CreateDonationUseCase.kt
    - GetDonationsUseCase.kt
  - events/
    - GetEventsUseCase.kt
    - RegisterAttendanceUseCase.kt
  - sermons/
    - GetSermonsUseCase.kt
    - PlaySermonUseCase.kt
  - prayers/
    - GetPrayersUseCase.kt
    - CreatePrayerUseCase.kt
  - testimonies/
    - GetTestimoniesUseCase.kt
    - LikeTestimonyUseCase.kt
  - chat/
    - GetChannelsUseCase.kt
    - SendMessageUseCase.kt
  - facial/
    - RegisterFaceUseCase.kt
    - CheckInWithFaceUseCase.kt
```

#### 4. Implémentation Presentation Layer (Jetpack Compose)
```kotlin
// À créer : app/src/main/java/com/mychurchapp/presentation/

- MainActivity.kt
- navigation/
  - NavGraph.kt
  - Screens.kt
  
- auth/
  - LoginScreen.kt
  - RegisterScreen.kt
  - LoginViewModel.kt
  
- dashboard/
  - DashboardScreen.kt
  - DashboardViewModel.kt
  
- members/
  - MembersListScreen.kt
  - MemberDetailScreen.kt
  - MembersViewModel.kt
  
- donations/
  - DonationsScreen.kt
  - CreateDonationScreen.kt
  - DonationsViewModel.kt
  
- events/
  - EventsScreen.kt
  - EventDetailScreen.kt
  - EventsViewModel.kt
  
- sermons/
  - SermonsListScreen.kt
  - SermonPlayerScreen.kt
  - SermonsViewModel.kt
  
- prayers/
  - PrayersScreen.kt
  - CreatePrayerScreen.kt
  - PrayersViewModel.kt
  
- testimonies/
  - TestimoniesScreen.kt
  - TestimonyDetailScreen.kt
  - TestimoniesViewModel.kt
  
- chat/
  - ChannelsListScreen.kt
  - ChatScreen.kt
  - ChatViewModel.kt
  
- appointments/
  - AppointmentsScreen.kt
  - CreateAppointmentScreen.kt
  - AppointmentsViewModel.kt
  
- facial/
  - FaceRegistrationScreen.kt
  - FaceCheckInScreen.kt
  - FacialViewModel.kt
  
- profile/
  - ProfileScreen.kt
  - EditProfileScreen.kt
  - ProfileViewModel.kt
  
- admin/
  - AdminDashboardScreen.kt
  - AdminViewModel.kt
  
- common/
  - components/
    - LoadingIndicator.kt
    - ErrorMessage.kt
    - EmptyState.kt
    - AppTopBar.kt
    - BottomNavigationBar.kt
```

#### 5. Services et Workers
```kotlin
// À créer : app/src/main/java/com/mychurchapp/

- MyChurchApp.kt                          // Application class
- services/
  - MyFirebaseMessagingService.kt        // FCM
- workers/
  - SyncWorker.kt                        // Sync offline data
  - NotificationWorker.kt                // Schedule notifications
```

#### 6. Ressources
```xml
<!-- À créer : app/src/main/res/ -->

- values/
  - strings.xml          // Textes (FR, EN, PT, SW)
  - colors.xml           // Couleurs thème
  - themes.xml           // Material Design 3
  - dimens.xml           // Dimensions
  
- drawable/
  - ic_*.xml             // Icônes
  
- mipmap/
  - ic_launcher.png      // Logo app
  
- xml/
  - network_security_config.xml
  - file_paths.xml
  - backup_rules.xml
  - data_extraction_rules.xml
```

#### 7. Configuration Firebase
```
- Créer projet Firebase
- Télécharger google-services.json
- Configurer FCM
- Configurer Analytics
- Configurer Crashlytics
```

---

## 🚀 Prochaines étapes prioritaires

### Étape 1 : Configuration réseau (URGENT)
Créer `NetworkModule.kt` pour configurer Retrofit avec :
- Base URL (dev/prod)
- Moshi converter
- Auth interceptor (JWT)
- Logging interceptor
- Timeout configuration

### Étape 2 : Authentification (URGENT)
Implémenter le flow complet :
1. `AuthRepository` - Appels API login/register
2. `AuthInterceptor` - Ajout automatique du token JWT
3. `TokenManager` - Stockage sécurisé (EncryptedSharedPreferences)
4. `LoginScreen` + `LoginViewModel`
5. `RegisterScreen` + `RegisterViewModel`

### Étape 3 : Navigation
Configurer Jetpack Navigation avec :
- Splash screen
- Auth flow (login/register)
- Main flow (dashboard, modules)
- Deep links

### Étape 4 : Dashboard principal
Écran d'accueil avec :
- Statistiques rapides
- Événements à venir
- Dernières prédications
- Notifications récentes
- Navigation vers tous les modules

### Étape 5 : Modules prioritaires
Implémenter dans l'ordre :
1. ✅ Membres (liste, recherche, profil)
2. ✅ Événements (liste, détails, inscription)
3. ✅ Prédications (liste, lecteur audio/vidéo)
4. ✅ Dons (création, historique)
5. ✅ Prières & Témoignages
6. ✅ Messagerie
7. ✅ Rendez-vous
8. ✅ Reconnaissance faciale

---

## 📋 Checklist de développement

### Configuration de base
- [x] Gradle configuration
- [x] Dependencies
- [x] Modèles de données
- [x] Interfaces API
- [x] AndroidManifest
- [ ] NetworkModule (Hilt)
- [ ] DatabaseModule (Room)
- [ ] Application class

### Authentification
- [ ] AuthRepository
- [ ] AuthInterceptor
- [ ] TokenManager
- [ ] LoginViewModel
- [ ] LoginScreen
- [ ] RegisterScreen

### Navigation
- [ ] NavGraph
- [ ] Screens sealed class
- [ ] MainActivity
- [ ] Splash screen

### Modules UI (Jetpack Compose)
- [ ] Dashboard
- [ ] Membres
- [ ] Dons
- [ ] Événements
- [ ] Prédications
- [ ] Prières
- [ ] Témoignages
- [ ] Chat
- [ ] Rendez-vous
- [ ] Reconnaissance faciale
- [ ] Profil
- [ ] Admin

### Services
- [ ] Firebase FCM
- [ ] WorkManager sync
- [ ] Notifications

### Tests
- [ ] Unit tests (UseCases)
- [ ] Integration tests (Repositories)
- [ ] UI tests (Screens)

### Documentation
- [ ] Code documentation
- [ ] API documentation
- [ ] User guide

---

## 🔑 Points clés à retenir

### ✅ Compatibilité avec le backend
- **Base de données** : PostgreSQL (PAS Prisma)
- **API** : Next.js REST endpoints
- **Auth** : JWT tokens (accessToken + refreshToken)
- **Synchronisation** : Même compte web et mobile

### ✅ Architecture
- **Pattern** : MVVM + Clean Architecture
- **DI** : Hilt
- **UI** : Jetpack Compose (Material 3)
- **Async** : Coroutines + Flow
- **Network** : Retrofit + Moshi
- **Cache** : Room (offline-first)

### ✅ Fonctionnalités (196 au total)
Tous les 16 modules sont couverts par les modèles et API créés.

---

## 📞 Support technique

Pour toute question sur l'implémentation :
1. Vérifier ce document
2. Consulter le README.md principal
3. Examiner les types TypeScript dans `src/types/index.ts`
4. Vérifier les routes API dans `src/app/api/`

---

**Auteur** : CHRIS NGOZULU KASONGO (KalibanHall)  
**Date** : Novembre 2025  
**Version** : 1.0.0
