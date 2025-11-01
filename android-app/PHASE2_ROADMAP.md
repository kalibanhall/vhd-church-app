# 🎯 PHASE 2 - Plan d'action pour compléter MyChurchApp Android

## 📋 Vue d'ensemble

**Phase 1 complétée** : Architecture + ViewModels + 4 écrans (80% du backend)  
**Phase 2 à venir** : UI Screens + Fonctionnalités avancées (20% restant)

---

## 🎨 ÉTAPE 1: Créer les écrans UI manquants (Priorité HAUTE)

### A. Écrans de base (8 écrans)

#### 1. EventsScreen.kt
```kotlin
Fonctionnalités:
- Liste des événements (LazyColumn)
- Filtres (à venir, passés, tous)
- Carte d'événement (titre, date, lieu, participants)
- Bouton "S'inscrire"
- Navigation vers EventDetailsScreen

Composants:
- SwipeRefresh
- Card pour chaque événement
- FloatingActionButton (créer événement - admin uniquement)
```

#### 2. EventDetailsScreen.kt
```kotlin
Fonctionnalités:
- Détails complets de l'événement
- Liste des participants
- Bouton d'inscription
- Carte Google Maps du lieu
- Partager l'événement

Composants:
- LazyColumn
- Image de l'événement (Coil)
- Bouton d'action principal
- Liste des inscrits
```

#### 3. SermonsScreen.kt
```kotlin
Fonctionnalités:
- Liste des prédications (audio/vidéo)
- Filtres par date, pasteur, série
- Icônes audio/vidéo
- Bouton télécharger (offline)
- Player mini en bas de l'écran

Composants:
- LazyColumn
- Mini player (persistent)
- Download progress indicator
```

#### 4. SermonPlayerScreen.kt
```kotlin
Fonctionnalités:
- Lecteur audio/vidéo (ExoPlayer)
- Contrôles: play/pause, avance/recul, vitesse
- Progression
- Notes du sermon
- Partager

Composants:
- ExoPlayer composable
- Slider pour progression
- Boutons de contrôle
- Transcription (si disponible)
```

#### 5. AppointmentsScreen.kt
```kotlin
Fonctionnalités:
- Liste des rendez-vous (mes RDV)
- Filtres: en attente, confirmés, passés
- Bouton "Nouveau RDV"
- Statuts visuels (EN_ATTENTE, CONFIRME, ANNULE)

Composants:
- LazyColumn
- Cards avec timeline
- FloatingActionButton
```

#### 6. CreateAppointmentScreen.kt
```kotlin
Fonctionnalités:
- Sélection du pasteur
- Calendrier (DatePicker)
- Sélection de l'heure
- Motif (dropdown)
- Description (TextField multiline)
- Bouton "Demander RDV"

Composants:
- OutlinedTextField
- DatePicker dialog
- TimePicker dialog
- ExposedDropdownMenu
```

#### 7. PrayersScreen.kt
```kotlin
Fonctionnalités:
- Liste des demandes de prières
- Filtres: mes prières, toutes, par catégorie
- Bouton "Nouvelle prière"
- Bouton "Je prie pour..." (support)
- Badge "Exaucée" si répondue
- Option anonyme

Composants:
- LazyColumn
- Cards avec badge de catégorie
- Support count badge
- FloatingActionButton
```

#### 8. PrayerDetailsScreen.kt
```kotlin
Fonctionnalités:
- Détails de la prière
- Liste des supporters
- Bouton "Je prie pour..."
- Commentaires de support
- Marquer comme "Exaucée" (créateur uniquement)
- Témoignage de réponse

Composants:
- LazyColumn
- Support list
- TextField pour témoignage
```

#### 9. TestimoniesScreen.kt
```kotlin
Fonctionnalités:
- Liste des témoignages (approuvés)
- Filtres par catégorie
- Likes
- Bouton "Nouveau témoignage"
- Modération (admin)

Composants:
- LazyColumn
- Cards avec like button
- FloatingActionButton
```

#### 10. CreateTestimonyScreen.kt
```kotlin
Fonctionnalités:
- Titre (TextField)
- Contenu (TextField multiline)
- Catégorie (dropdown)
- Option anonyme (Switch)
- Aperçu
- Bouton "Soumettre"

Composants:
- OutlinedTextField (titre)
- OutlinedTextField (contenu, 500 chars max)
- ExposedDropdownMenu (catégorie)
- Switch (anonyme)
```

#### 11. ChatScreen.kt
```kotlin
Fonctionnalités:
- Liste des canaux de discussion
- Badge unread count
- Dernier message preview
- Navigation vers ChannelScreen

Composants:
- LazyColumn
- Card pour chaque canal
- Badge notification
```

#### 12. ChannelScreen.kt
```kotlin
Fonctionnalités:
- Liste des messages (inversée)
- Input message en bas
- Réactions (emojis)
- Pièces jointes (images)
- Typing indicator
- WebSocket pour temps réel

Composants:
- LazyColumn (reversed)
- Message bubbles (moi vs autres)
- TextField en bas (sticky)
- Image preview dialog
```

#### 13. ProfileScreen.kt
```kotlin
Fonctionnalités:
- Photo de profil (upload avec ML Kit face detection)
- Informations personnelles
- Statistiques (présences, dons, etc.)
- Bouton "Modifier"
- Déconnexion

Composants:
- AsyncImage (Coil)
- Cards d'infos
- Bouton photo (CameraX)
```

#### 14. SettingsScreen.kt
```kotlin
Fonctionnalités:
- Notifications (on/off)
- Dark mode (toggle)
- Langue (français/anglais)
- Cache (clear)
- À propos
- Version de l'app

Composants:
- Preference items
- Switch components
- AlertDialog (confirm clear cache)
```

### Ordre de développement recommandé:
```
1. ProfileScreen (réutilise ProfileViewModel ✓)
2. EventsScreen (réutilise EventsViewModel ✓)
3. SermonsScreen (réutilise SermonsViewModel ✓)
4. AppointmentsScreen + Create (réutilise AppointmentsViewModel ✓)
5. PrayersScreen + Details (réutilise PrayersViewModel ✓)
6. TestimoniesScreen + Create (réutilise TestimoniesViewModel ✓)
7. ChatScreen + Channel (réutilise ChatViewModel ✓)
8. SettingsScreen (simple, pas de ViewModel)
```

---

## 🧭 ÉTAPE 2: Navigation complète

### A. Bottom Navigation Bar
```kotlin
// 5 onglets principaux
sealed class BottomNavItem(val route: String, val icon: ImageVector, val label: String) {
    object Dashboard : BottomNavItem("dashboard", Icons.Default.Home, "Accueil")
    object Members : BottomNavItem("members", Icons.Default.People, "Membres")
    object Events : BottomNavItem("events", Icons.Default.Event, "Événements")
    object Chat : BottomNavItem("chat", Icons.Default.Chat, "Chat")
    object Profile : BottomNavItem("profile", Icons.Default.Person, "Profil")
}
```

### B. Drawer Navigation
```kotlin
// Menu latéral avec:
- Dashboard
- Membres
- Dons
- Événements
- Prédications
- Rendez-vous
- Prières
- Témoignages
- Chat
- Notifications
- Profil
- Paramètres
- Déconnexion
```

### C. Intégrer dans MainActivity
```kotlin
Scaffold(
    topBar = { TopAppBar(...) },
    bottomBar = { BottomNavigationBar(...) },
    drawerContent = { DrawerContent(...) }
) {
    NavHost(...)
}
```

---

## 🚀 ÉTAPE 3: Fonctionnalités avancées

### A. Reconnaissance faciale (ML Kit + TensorFlow Lite)
```kotlin
Fichiers à créer:
- presentation/profile/FaceDetectionViewModel.kt
- presentation/profile/CameraScreen.kt
- data/ml/FaceRecognitionHelper.kt

Fonctionnalités:
- Détection de visage en temps réel
- Extraction de features
- Comparaison avec photos existantes
- Enregistrement sécurisé
- RGPD compliance (consentement)
```

### B. Push Notifications (Firebase Cloud Messaging)
```kotlin
Fichiers à créer:
- data/firebase/MyFirebaseMessagingService.kt
- domain/usecases/NotificationUseCases.kt

Fonctionnalités:
- Recevoir notifications push
- Notifications locales
- Channels par type (prières, événements, etc.)
- Actions rapides (répondre, marquer lu)
- Badge count sur icône
```

### C. Mode Offline (Room Database)
```kotlin
Fichiers à créer:
- data/local/AppDatabase.kt
- data/local/dao/*.kt (pour chaque entité)
- data/repository/*CachedRepository.kt

Fonctionnalités:
- Cache de toutes les données
- Synchronisation bidirectionnelle
- Indicateur offline/online
- Queue d'actions offline
- Conflict resolution
```

### D. Synchronisation (WorkManager)
```kotlin
Fichiers à créer:
- data/workers/SyncWorker.kt
- data/workers/PeriodicSyncWorker.kt

Fonctionnalités:
- Sync automatique toutes les 15 min
- Sync forcé sur changement de connectivité
- Upload des actions offline
- Progress notification
```

### E. ExoPlayer (Prédications)
```kotlin
Fichiers à créer:
- presentation/sermons/player/ExoPlayerController.kt
- presentation/sermons/player/PlayerViewModel.kt

Fonctionnalités:
- Streaming audio/vidéo
- Contrôles avancés (vitesse, chapitres)
- Picture-in-Picture
- Notification de lecture
- Téléchargement progressif
```

### F. CameraX (Photos)
```kotlin
Fichiers à créer:
- presentation/common/CameraScreen.kt
- data/media/ImageProcessor.kt

Fonctionnalités:
- Capture photo/vidéo
- Flash, zoom, focus
- Galerie preview
- Compression automatique
- Upload vers serveur
```

### G. WebSocket (Chat temps réel)
```kotlin
Fichiers à créer:
- data/websocket/ChatWebSocketClient.kt
- data/websocket/WebSocketManager.kt

Fonctionnalités:
- Connection persistante
- Reconnection automatique
- Typing indicators
- Message delivery status (envoyé, reçu, lu)
- Réactions en temps réel
```

---

## 🧪 ÉTAPE 4: Tests

### A. Tests Unitaires
```kotlin
Fichiers à créer:
- test/viewmodels/*ViewModelTest.kt
- test/repositories/*RepositoryTest.kt
- test/usecases/*UseCaseTest.kt

Frameworks:
- JUnit 4
- MockK (mocking)
- Turbine (Flow testing)
- Coroutines Test

Couverture cible: 80%+
```

### B. Tests d'Instrumentation
```kotlin
Fichiers à créer:
- androidTest/ui/*ScreenTest.kt
- androidTest/navigation/NavigationTest.kt

Frameworks:
- Espresso
- Compose Testing
- Hilt Testing

Tests:
- Navigation entre écrans
- Formulaires
- Liste avec pagination
- SwipeRefresh
```

### C. Tests d'Intégration
```kotlin
Fichiers à créer:
- androidTest/integration/ApiIntegrationTest.kt

Tests:
- API calls réels
- Database operations
- Cache invalidation
```

---

## 📦 ÉTAPE 5: Optimisations

### A. Performance
```
- R8/ProGuard optimization
- Image compression (Coil)
- LazyColumn pagination
- Database indexing
- Network request batching
```

### B. UX
```
- Skeleton loading
- Error retry strategies
- Empty states
- Success animations (Lottie)
- Haptic feedback
```

### C. Accessibility
```
- Content descriptions
- Screen reader support
- Font scaling
- High contrast mode
```

---

## 📱 ÉTAPE 6: Préparation Play Store

### A. Assets
```
- Icône app (512x512)
- Feature graphic (1024x500)
- Screenshots (phone + tablet)
- Video preview (optionnel)
```

### B. Métadonnées
```
- Titre (30 chars max)
- Description courte (80 chars)
- Description complète (4000 chars)
- Catégorie: Lifestyle
- Rating: Everyone
```

### C. Build Release
```bash
# Créer keystore
keytool -genkey -v -keystore release.keystore

# Build AAB
./gradlew bundleRelease

# Test avant upload
bundletool build-apks --bundle=app-release.aab

# Upload sur Play Console
```

---

## ⏱️ Estimation de temps

```
Écran UI (simple):        2-3 heures
Écran UI (complexe):      4-6 heures
Navigation complète:      4-6 heures
Feature avancée:          8-16 heures
Tests (par module):       4-8 heures
Optimisations:            8-16 heures
Play Store setup:         4-6 heures

TOTAL ESTIMÉ Phase 2:     80-120 heures (2-3 semaines full-time)
```

---

## 🎯 Priorités

### 🔴 Haute (must-have)
1. Créer tous les écrans UI
2. Navigation complète (Bottom + Drawer)
3. Push notifications (FCM)
4. Tests de base

### 🟡 Moyenne (should-have)
5. Mode offline (Room)
6. ExoPlayer (prédications)
7. CameraX (photos)
8. WebSocket (chat)

### 🟢 Basse (nice-to-have)
9. Reconnaissance faciale (ML Kit)
10. Optimisations avancées
11. Animations sophistiquées

---

## 📝 Checklist avant release

- [ ] Tous les écrans UI créés
- [ ] Navigation complète
- [ ] Tests unitaires (80%+ coverage)
- [ ] Tests d'instrumentation
- [ ] Mode offline fonctionnel
- [ ] Push notifications configurées
- [ ] Aucun crash sur Crashlytics
- [ ] Performance optimisée (60fps)
- [ ] Accessibility validée
- [ ] RGPD compliant
- [ ] Politique de confidentialité
- [ ] Conditions d'utilisation
- [ ] Play Store assets prêts
- [ ] Beta testing (100+ users)

---

## 🚀 Démarrer Phase 2

### Commande rapide pour commencer:
```bash
cd "c:\vhd app\android-app"

# Créer le premier écran manquant (ProfileScreen)
# app/src/main/java/com/mychurchapp/presentation/profile/ProfileScreen.kt
```

### Template de base pour un écran:
```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MonEcranScreen(
    onNavigateBack: () -> Unit,
    viewModel: MonEcranViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mon Écran") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (val s = state) {
            is Resource.Success -> {
                // Contenu
            }
            is Resource.Error -> ErrorView(s.message)
            is Resource.Loading -> LoadingView()
            null -> LoadingView()
        }
    }
}
```

---

**Prêt pour la Phase 2!** 🚀
