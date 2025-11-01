# 🚀 Guide de Développement - MyChurchApp Android

## 📋 Vue d'ensemble

Application Android native pour la gestion d'église développée avec **Kotlin**, **Jetpack Compose**, et **Clean Architecture**.

## ✅ Statut d'implémentation

### Architecture ✅ **COMPLETÉ**
- [x] Structure MVVM + Clean Architecture (Presentation → Domain → Data)
- [x] Configuration Hilt pour injection de dépendances
- [x] Gradle multi-modules
- [x] Configuration Android (minSdk 24, targetSdk 34)

### Couche Data ✅ **COMPLETÉ**
- [x] **11 modèles de données** correspondant au schéma PostgreSQL
- [x] **9 interfaces API Retrofit** pour tous les modules
- [x] **NetworkModule** avec intercepteur JWT
- [x] **TokenManager** pour stockage sécurisé (EncryptedSharedPreferences)
- [x] **12 implémentations de repositories** (Auth, Members, Donations, Events, Sermons, Appointments, Prayers, Testimonies, Chat, Dashboard, Notifications, Profile)

### Couche Domain ✅ **COMPLETÉ**
- [x] **12 interfaces de repositories**
- [x] **Use Cases** pour l'authentification (Login, Register, ForgotPassword, Logout)
- [x] Validation des données d'entrée
- [x] Gestion d'erreurs avec Resource<T>

### Couche Presentation ✅ **COMPLETÉ (Partiel)**
- [x] **6 ViewModels** : Auth, Dashboard, Members, Donations, Notifications, Profile
- [x] **4 écrans Compose** : Login, Dashboard, Members, Donations
- [x] **Navigation** avec NavController et routes typées
- [x] **Thème Material 3** avec Dark Mode
- [x] SwipeRefresh pour toutes les listes

### Modules en cours 🔄
- [ ] **6 ViewModels restants** : Events, Sermons, Appointments, Prayers, Testimonies, Chat
- [ ] **8 écrans restants** : Events, Sermons, Appointments, Prayers, Testimonies, Chat, Profile, Settings
- [ ] BottomNavigationBar
- [ ] Drawer Navigation

### Fonctionnalités avancées ⏳
- [ ] **Reconnaissance faciale** (ML Kit + TensorFlow Lite)
- [ ] **Push notifications** (Firebase Cloud Messaging)
- [ ] **Mode offline** (Room Database)
- [ ] **Synchronisation** (WorkManager)
- [ ] **ExoPlayer** pour les prédications audio/vidéo
- [ ] **CameraX** pour capture photo/vidéo
- [ ] **WebSocket** pour le chat en temps réel

---

## 🏗️ Architecture de l'application

```
app/
├── data/
│   ├── api/                    # 9 interfaces Retrofit ✅
│   │   ├── AuthApiService.kt
│   │   ├── MembersApiService.kt
│   │   ├── DonationsApiService.kt
│   │   ├── EventsApiService.kt
│   │   ├── SermonsApiService.kt
│   │   ├── AppointmentsApiService.kt
│   │   ├── PrayersTestimoniesApiService.kt
│   │   ├── ChatApiService.kt
│   │   └── AnalyticsNotificationsApiService.kt
│   │
│   ├── models/                 # 11 modèles DTOs ✅
│   │   ├── User.kt
│   │   ├── Donation.kt
│   │   ├── Event.kt
│   │   ├── Sermon.kt
│   │   ├── Appointment.kt
│   │   ├── Prayer.kt
│   │   ├── Testimony.kt
│   │   ├── Chat.kt
│   │   ├── Notification.kt
│   │   ├── Analytics.kt
│   │   └── ApiModels.kt
│   │
│   ├── local/                  # Stockage local ✅
│   │   └── TokenManager.kt
│   │
│   └── repository/             # 12 repositories impl ✅
│       ├── AuthRepositoryImpl.kt
│       ├── RepositoriesImpl.kt (Members, Donations)
│       ├── RepositoriesImpl2.kt (Dashboard, Notifications, Profile)
│       └── RepositoriesImpl3.kt (Events, Sermons, Appointments, Prayers, Testimonies, Chat)
│
├── domain/
│   ├── repository/             # 12 interfaces ✅
│   │   ├── AuthRepository.kt
│   │   └── Repositories.kt (11 autres)
│   │
│   └── usecases/               # Use cases ✅
│       └── AuthUseCases.kt
│
├── presentation/
│   ├── auth/                   # Auth module ✅
│   │   ├── AuthViewModel.kt
│   │   └── LoginScreen.kt
│   │
│   ├── dashboard/              # Dashboard module ✅
│   │   ├── DashboardViewModel.kt
│   │   └── DashboardScreen.kt
│   │
│   ├── members/                # Members module ✅
│   │   ├── MembersViewModel.kt
│   │   └── MembersScreen.kt
│   │
│   ├── donations/              # Donations module ✅
│   │   ├── DonationsViewModel.kt
│   │   └── DonationsScreen.kt
│   │
│   ├── notifications/          # Notifications module ✅
│   │   └── NotificationsViewModel.kt
│   │
│   ├── profile/                # Profile module ✅
│   │   └── ProfileViewModel.kt
│   │
│   ├── navigation/             # Navigation ✅
│   │   └── Navigation.kt
│   │
│   ├── theme/                  # Material 3 ✅
│   │   ├── Color.kt
│   │   ├── Theme.kt
│   │   └── Type.kt
│   │
│   └── MainActivity.kt         # Entry point ✅
│
├── di/                         # Dependency Injection ✅
│   ├── NetworkModule.kt
│   └── RepositoryModule.kt
│
├── utils/                      # Utilitaires ✅
│   └── Resource.kt
│
└── MyChurchApp.kt             # Application class ✅
```

---

## 🔧 Configuration du projet

### 1. Prérequis

```bash
- Android Studio Hedgehog | 2023.1.1+
- JDK 17
- Android SDK 34
- Kotlin 1.9+
- Gradle 8.2+
```

### 2. Configuration de l'API

Créer `local.properties` à la racine :

```properties
api.base.url=https://votre-api.com
api.base.url.dev=http://10.0.2.2:3000
```

### 3. Firebase Setup

1. Télécharger `google-services.json` depuis Firebase Console
2. Placer dans `app/`
3. Activer Authentication, Cloud Messaging, Crashlytics

### 4. Build & Run

```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Run tests
./gradlew test
```

---

## 🔐 Authentification & Sécurité

### JWT Token Flow

```kotlin
// 1. Login
val token = authRepository.login(email, password)

// 2. Stockage sécurisé
tokenManager.saveAccessToken(token.accessToken)
tokenManager.saveRefreshToken(token.refreshToken)

// 3. Injection automatique dans headers
OkHttpClient.Builder()
    .addInterceptor { chain ->
        val token = tokenManager.getAccessToken()
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()
        chain.proceed(request)
    }
```

### EncryptedSharedPreferences

Toutes les données sensibles (tokens, infos utilisateur) sont chiffrées avec **AES-256**.

---

## 📱 Patterns utilisés

### MVVM + Clean Architecture

```kotlin
// ViewModel (Presentation)
class MembersViewModel @Inject constructor(
    private val repository: MembersRepository
) : ViewModel() {
    
    private val _members = MutableStateFlow<Resource<List<User>>?>(null)
    val members: StateFlow<Resource<List<User>>?> = _members.asStateFlow()
    
    fun loadMembers() {
        viewModelScope.launch {
            repository.getMembers().collect { resource ->
                _members.value = resource
            }
        }
    }
}

// Repository (Domain Interface)
interface MembersRepository {
    suspend fun getMembers(): Flow<Resource<List<User>>>
}

// Repository Implementation (Data)
class MembersRepositoryImpl @Inject constructor(
    private val api: MembersApiService
) : MembersRepository {
    override suspend fun getMembers() = flow {
        emit(Resource.Loading())
        try {
            val response = api.getMembers()
            emit(Resource.Success(response.data))
        } catch (e: Exception) {
            emit(Resource.Error(e.message))
        }
    }
}
```

### Resource Pattern

```kotlin
sealed class Resource<T>(val data: T? = null, val message: String? = null) {
    class Success<T>(data: T) : Resource<T>(data)
    class Error<T>(message: String, data: T? = null) : Resource<T>(data, message)
    class Loading<T> : Resource<T>()
}
```

### Compose UI Pattern

```kotlin
@Composable
fun MembersScreen(viewModel: MembersViewModel = hiltViewModel()) {
    val members by viewModel.members.collectAsState()
    
    when (val state = members) {
        is Resource.Loading -> LoadingView()
        is Resource.Success -> MembersList(state.data)
        is Resource.Error -> ErrorView(state.message)
        null -> EmptyView()
    }
}
```

---

## 🎨 Composants Compose

### Material 3 Components utilisés

```kotlin
- Scaffold (structure de base)
- TopAppBar (barre supérieure)
- FloatingActionButton (actions principales)
- Card (conteneurs de contenu)
- LazyColumn/LazyVerticalGrid (listes)
- TextField/OutlinedTextField (saisie)
- Button/IconButton (actions)
- AlertDialog (dialogues)
- CircularProgressIndicator (chargement)
- SwipeRefresh (rafraîchissement)
```

### Navigation

```kotlin
// Définition des routes
sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Members : Screen("members")
    // ...
}

// Navigation
navController.navigate(Screen.Members.route)
navController.popBackStack()
```

---

## 🔄 État d'avancement des modules

| Module | Repository | ViewModel | UI Screen | État |
|--------|-----------|-----------|-----------|------|
| **Auth** | ✅ | ✅ | ✅ | **Complet** |
| **Dashboard** | ✅ | ✅ | ✅ | **Complet** |
| **Members** | ✅ | ✅ | ✅ | **Complet** |
| **Donations** | ✅ | ✅ | ✅ | **Complet** |
| **Events** | ✅ | ⏳ | ⏳ | En cours |
| **Sermons** | ✅ | ⏳ | ⏳ | En cours |
| **Appointments** | ✅ | ⏳ | ⏳ | En cours |
| **Prayers** | ✅ | ⏳ | ⏳ | En cours |
| **Testimonies** | ✅ | ⏳ | ⏳ | En cours |
| **Chat** | ✅ | ⏳ | ⏳ | En cours |
| **Profile** | ✅ | ✅ | ⏳ | En cours |
| **Notifications** | ✅ | ✅ | ⏳ | En cours |

---

## 🚧 Prochaines étapes

### Phase 1 - Compléter les ViewModels (en cours)
```kotlin
- [ ] EventsViewModel
- [ ] SermonsViewModel
- [ ] AppointmentsViewModel
- [ ] PrayersViewModel
- [ ] TestimoniesViewModel
- [ ] ChatViewModel
```

### Phase 2 - Créer tous les écrans Compose
```kotlin
- [ ] EventsScreen + EventDetailsScreen
- [ ] SermonsScreen + SermonPlayerScreen
- [ ] AppointmentsScreen + CreateAppointmentScreen
- [ ] PrayersScreen + PrayerDetailsScreen
- [ ] TestimoniesScreen + CreateTestimonyScreen
- [ ] ChatScreen + ChannelScreen
- [ ] ProfileScreen
- [ ] SettingsScreen
```

### Phase 3 - Navigation complète
```kotlin
- [ ] BottomNavigationBar (5 onglets principaux)
- [ ] Drawer Navigation (menu latéral)
- [ ] Deep Links
- [ ] Arguments navigation
```

### Phase 4 - Fonctionnalités avancées
```kotlin
- [ ] Reconnaissance faciale (ML Kit + TensorFlow)
- [ ] Push notifications (FCM)
- [ ] Mode offline (Room)
- [ ] Synchronisation (WorkManager)
- [ ] ExoPlayer (audio/vidéo)
- [ ] CameraX (photos)
- [ ] WebSocket (chat temps réel)
```

---

## 📦 Dépendances principales

```kotlin
// Jetpack Compose
implementation("androidx.compose.ui:ui:1.5.4")
implementation("androidx.compose.material3:material3:1.1.2")

// Hilt DI
implementation("com.google.dagger:hilt-android:2.48")

// Retrofit + OkHttp
implementation("com.squareup.retrofit2:retrofit:2.9.0")
implementation("com.squareup.okhttp3:okhttp:4.12.0")

// Room Database
implementation("androidx.room:room-runtime:2.6.1")

// Firebase
implementation("com.google.firebase:firebase-messaging-ktx")

// ML Kit
implementation("com.google.mlkit:face-detection:16.1.5")
```

---

## 🧪 Tests

```kotlin
// Unit Tests
@Test
fun `login with valid credentials should return success`() = runTest {
    val result = authRepository.login("test@test.com", "password")
    assertTrue(result is Resource.Success)
}

// UI Tests
@Test
fun `dashboard should display stats`() {
    composeTestRule.setContent {
        DashboardScreen()
    }
    composeTestRule.onNodeWithText("Membres totaux").assertIsDisplayed()
}
```

---

## 📝 Notes importantes

1. **Base de données partagée** : L'application Android utilise la **même base PostgreSQL** que l'application web Next.js
2. **Authentification unique** : Un compte créé sur le web fonctionne sur mobile (JWT tokens)
3. **Pas de Prisma** : Connexion directe à PostgreSQL via API REST
4. **Architecture modulaire** : Chaque module est indépendant et réutilisable
5. **Material Design 3** : Interface moderne avec Dark Mode

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 📞 Support

Pour toute question ou problème, ouvrir une issue sur GitHub.

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0-alpha  
**Statut** : En développement actif
