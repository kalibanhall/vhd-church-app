# 📅 PLAN D'IMPLÉMENTATION DÉTAILLÉ - 4 SEMAINES CAPACITOR

**Date de début**: 18 novembre 2025  
**Date de fin**: 16 décembre 2025  
**Objectif**: Application Android native sur Google Play Store

---

## 🗓️ SEMAINE 1: PRÉPARATION & CONFIGURATION (18-24 nov)

### Jour 1 (Lundi 18 nov) - Setup Initial
**Durée**: 8h | **Responsable**: Lead Dev

#### Matin (4h)
- [ ] ✅ Installer Android Studio (si pas déjà fait)
- [ ] ✅ Configurer SDK Android (API 24-34)
- [ ] ✅ Créer compte Google Play Console ($25)
- [ ] ✅ Vérifier Capacitor 7.4.4 installé
- [ ] ✅ Backup complet du projet actuel

**Commandes**:
```bash
# Vérifier installations
node -v  # v18+
npm -v   # v9+
npx cap --version  # 7.4.4

# Initialiser Capacitor
npx cap init "VHD Church" "com.vhdchurch.app"
```

#### Après-midi (4h)
- [ ] ✅ Modifier `next.config.js` pour export statique
- [ ] ✅ Configurer `capacitor.config.ts`
- [ ] ✅ Tester build Next.js
- [ ] ✅ Ajouter plateforme Android

**Fichiers à modifier**:
```javascript
// next.config.js
module.exports = {
  output: 'export',
  distDir: 'out',
  images: { unoptimized: true },
  trailingSlash: true
}

// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.vhdchurch.app',
  appName: 'VHD Church',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
}
```

---

### Jour 2 (Mardi 19 nov) - Build Web & Android
**Durée**: 8h | **Responsable**: Lead Dev

#### Matin (4h)
- [ ] ✅ Build production Next.js
- [ ] ✅ Vérifier dossier `out/` généré
- [ ] ✅ Ajouter Android: `npx cap add android`
- [ ] ✅ Copier build: `npx cap copy android`

**Commandes**:
```bash
npm run build
npx cap add android
npx cap copy android
npx cap open android
```

#### Après-midi (4h)
- [ ] ✅ Ouvrir projet dans Android Studio
- [ ] ✅ Configurer Gradle (si erreurs)
- [ ] ✅ Premier build APK debug
- [ ] ✅ Tester sur émulateur

**Vérifications**:
- APK généré: `android/app/build/outputs/apk/debug/app-debug.apk`
- Taille APK: ~15-20 MB
- Lancement: < 3 secondes

---

### Jour 3 (Mercredi 20 nov) - Icônes & Splash Screens
**Durée**: 6h | **Responsable**: Designer + Dev

#### Matin (3h)
- [ ] 🎨 Créer icônes adaptatives Android
  - `icon-foreground.png` (432x432)
  - `icon-background.png` (432x432)
  - `ic_launcher.png` (512x512)
- [ ] 🎨 Générer toutes les tailles (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- [ ] ✅ Copier dans `android/app/src/main/res/mipmap-*/`

**Outils recommandés**:
- Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/
- Icon Kitchen: https://icon.kitchen/

#### Après-midi (3h)
- [ ] 🎨 Créer splash screen (1080x1920)
- [ ] ✅ Configurer splash dans `res/values/styles.xml`
- [ ] ✅ Tester sur émulateur
- [ ] ✅ Ajuster couleurs/durée

---

### Jour 4 (Jeudi 21 nov) - Permissions & Manifest
**Durée**: 6h | **Responsable**: Lead Dev

#### Matin (3h)
- [ ] ✅ Modifier `AndroidManifest.xml`
- [ ] ✅ Ajouter permissions requises
- [ ] ✅ Configurer orientation (portrait)
- [ ] ✅ Définir activité principale

**AndroidManifest.xml**:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.front" android:required="false" />
```

#### Après-midi (3h)
- [ ] ✅ Configurer FileProvider (pour upload photos)
- [ ] ✅ Tester permissions runtime
- [ ] ✅ Vérifier demandes permissions

---

### Jour 5 (Vendredi 22 nov) - Configuration Build
**Durée**: 6h | **Responsable**: Lead Dev

#### Matin (3h)
- [ ] ✅ Configurer `build.gradle` (app)
- [ ] ✅ Définir versionCode et versionName
- [ ] ✅ Configurer minSdk et targetSdk
- [ ] ✅ Optimiser ProGuard (si release)

**build.gradle**:
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.vhdchurch.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### Après-midi (3h)
- [ ] ✅ Test build release (non signé)
- [ ] ✅ Vérifier taille APK optimisé
- [ ] ✅ Review semaine 1
- [ ] ✅ Planifier semaine 2

**Livrables Semaine 1**:
- ✅ APK debug fonctionnel
- ✅ Icônes et splash configurés
- ✅ Permissions configurées
- ✅ Build system prêt

---

## 🔌 SEMAINE 2: INTÉGRATION PLUGINS NATIFS (25 nov - 1 déc)

### Jour 6 (Lundi 25 nov) - Plugin Storage
**Durée**: 8h | **Responsable**: Lead Dev

#### Matin (4h)
- [ ] ✅ Installer `@capacitor/preferences`
- [ ] ✅ Créer wrapper `src/lib/storage.ts`
- [ ] ✅ Remplacer `localStorage` dans AuthContext
- [ ] ✅ Tester authentification

**Code**:
```typescript
// src/lib/storage.ts
import { Preferences } from '@capacitor/preferences';

export const storage = {
  async set(key: string, value: string) {
    await Preferences.set({ key, value });
  },
  async get(key: string) {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async remove(key: string) {
    await Preferences.remove({ key });
  },
  async clear() {
    await Preferences.clear();
  }
};
```

#### Après-midi (4h)
- [ ] ✅ Modifier AuthContext pour utiliser storage natif
- [ ] ✅ Tester login/logout
- [ ] ✅ Vérifier persistance données
- [ ] ✅ Tests sur device réel

---

### Jour 7 (Mardi 26 nov) - Plugin Caméra
**Durée**: 8h | **Responsable**: Lead Dev

#### Matin (4h)
- [ ] ✅ Installer `@capacitor/camera`
- [ ] ✅ Créer wrapper `src/lib/camera.ts`
- [ ] ✅ Modifier upload photo profil
- [ ] ✅ Modifier reconnaissance faciale

**Code**:
```typescript
// src/lib/camera.ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function takePicture() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera
  });
  return `data:image/jpeg;base64,${image.base64String}`;
}

export async function pickFromGallery() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Base64,
    source: CameraSource.Photos
  });
  return `data:image/jpeg;base64,${image.base64String}`;
}
```

#### Après-midi (4h)
- [ ] ✅ Tester photo profil
- [ ] ✅ Tester reconnaissance faciale
- [ ] ✅ Vérifier permissions caméra
- [ ] ✅ Tests multi-devices

---

### Jour 8 (Mercredi 27 nov) - Plugin Notifications Push
**Durée**: 8h | **Responsable**: Lead Dev + Backend

#### Matin (4h)
- [ ] ✅ Installer `@capacitor/push-notifications`
- [ ] ✅ Configurer Firebase Cloud Messaging
- [ ] ✅ Télécharger `google-services.json`
- [ ] ✅ Placer dans `android/app/`

**Firebase Setup**:
1. Créer projet Firebase: https://console.firebase.google.com
2. Ajouter app Android (com.vhdchurch.app)
3. Télécharger google-services.json
4. Copier dans android/app/

#### Après-midi (4h)
- [ ] ✅ Créer wrapper `src/lib/notifications.ts`
- [ ] ✅ Implémenter permission request
- [ ] ✅ Implémenter token registration
- [ ] ✅ Tester notification test

**Code**:
```typescript
// src/lib/notifications.ts
import { PushNotifications } from '@capacitor/push-notifications';

export async function initPushNotifications() {
  let permStatus = await PushNotifications.checkPermissions();
  
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  
  if (permStatus.receive !== 'granted') {
    throw new Error('Permission notifications refusée');
  }
  
  await PushNotifications.register();
}

export async function getToken() {
  const { value } = await PushNotifications.getDeliveredNotifications();
  return value;
}
```

---

### Jour 9 (Jeudi 28 nov) - Plugins Share & Geolocation
**Durée**: 6h | **Responsable**: Lead Dev

#### Matin (3h)
- [ ] ✅ Installer `@capacitor/share`
- [ ] ✅ Ajouter boutons partage (événements, sermons)
- [ ] ✅ Tester partage WhatsApp, SMS, Email
- [ ] ✅ Installer `@capacitor/geolocation`

**Code**:
```typescript
// src/lib/share.ts
import { Share } from '@capacitor/share';

export async function shareEvent(event: any) {
  await Share.share({
    title: event.title,
    text: event.description,
    url: `https://vhdchurch.app/events/${event.id}`,
    dialogTitle: 'Partager cet événement'
  });
}
```

#### Après-midi (3h)
- [ ] ✅ Implémenter géolocalisation pour événements
- [ ] ✅ Afficher carte (Google Maps ou Leaflet)
- [ ] ✅ Demander permission localisation
- [ ] ✅ Tests sur device réel

---

### Jour 10 (Vendredi 29 nov) - Plugin Vidéo & Review
**Durée**: 8h | **Responsable**: Lead Dev

#### Matin (4h)
- [ ] ✅ Installer `capacitor-video-player`
- [ ] ✅ Modifier lecteur sermons
- [ ] ✅ Support lecture hors ligne
- [ ] ✅ Tests lecture vidéo

**Code**:
```typescript
// Composant SermonPlayer adapté
import { CapacitorVideoPlayer } from 'capacitor-video-player';

async function playVideo(url: string) {
  await CapacitorVideoPlayer.initPlayer({
    mode: 'fullscreen',
    url: url,
    playerId: 'sermon-player',
    componentTag: 'app'
  });
}
```

#### Après-midi (4h)
- [ ] ✅ Review tous les plugins
- [ ] ✅ Tests intégration complète
- [ ] ✅ Corriger bugs trouvés
- [ ] ✅ Préparer tests semaine 3

**Livrables Semaine 2**:
- ✅ 6 plugins natifs intégrés
- ✅ Storage, Caméra, Notifications, Share, Géolocalisation, Vidéo
- ✅ Tests unitaires passés
- ✅ APK avec fonctionnalités natives

---

## 🧪 SEMAINE 3: TESTS & OPTIMISATIONS (2-8 déc)

### Jour 11 (Lundi 2 déc) - Tests Fonctionnels
**Durée**: 8h | **Responsable**: QA + Dev

#### Matin (4h)
- [ ] ✅ Créer plan de tests (checklist)
- [ ] ✅ Tests authentification (login/logout/register)
- [ ] ✅ Tests navigation (toutes les pages)
- [ ] ✅ Tests création contenu (don, prière, témoignage)

#### Après-midi (4h)
- [ ] ✅ Tests upload média (photo, vidéo)
- [ ] ✅ Tests reconnaissance faciale
- [ ] ✅ Tests chat temps réel
- [ ] ✅ Tests hors ligne (mode airplane)

**Checklist Tests**:
```
Authentification:
□ Inscription nouvel utilisateur
□ Login existant
□ Logout
□ Photo profil
□ Modification profil

Donations:
□ Créer don M-Pesa
□ Historique dons
□ Statistiques

Événements:
□ Liste événements
□ Détails événement
□ Partage événement
□ Géolocalisation

Sermons:
□ Liste prédications
□ Lecture vidéo
□ Lecture audio
□ Recherche

etc.
```

---

### Jour 12 (Mardi 3 déc) - Tests Devices
**Durée**: 8h | **Responsable**: QA Team

#### Tests sur 5+ devices réels
- [ ] 📱 Samsung Galaxy (Android 12)
- [ ] 📱 Xiaomi (Android 13)
- [ ] 📱 Google Pixel (Android 14)
- [ ] 📱 Tecno/Infinix (Android 11)
- [ ] 📱 Huawei (Android 10 - sans GMS)

#### Pour chaque device
- [ ] ✅ Installation APK
- [ ] ✅ Permissions accordées
- [ ] ✅ Toutes fonctionnalités testées
- [ ] ✅ Performance mesurée (RAM, CPU, batterie)
- [ ] ✅ Screenshots bugs

---

### Jour 13 (Mercredi 4 déc) - Optimisations Performance
**Durée**: 8h | **Responsable**: Lead Dev

#### Matin (4h)
- [ ] ⚡ Analyser bundle APK (apkanalyzer)
- [ ] ⚡ Activer ProGuard/R8 (minification)
- [ ] ⚡ Optimiser images (WebP)
- [ ] ⚡ Lazy loading composants

**build.gradle optimisations**:
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

#### Après-midi (4h)
- [ ] ⚡ Cache API responses
- [ ] ⚡ Précharger données critiques
- [ ] ⚡ Optimiser requêtes SQL
- [ ] ⚡ Mesurer amélioration perf

**Objectifs**:
- Temps chargement < 2s
- RAM usage < 150 MB
- APK size < 20 MB
- Smooth 60 FPS

---

### Jour 14 (Jeudi 5 déc) - Corrections Bugs
**Durée**: 8h | **Responsable**: Dev Team

#### Matin (4h)
- [ ] 🐛 Fixer bugs P0 (bloquants)
- [ ] 🐛 Fixer bugs P1 (majeurs)
- [ ] ✅ Re-tester après fixes
- [ ] ✅ Mise à jour checklist

#### Après-midi (4h)
- [ ] 🐛 Fixer bugs P2 (mineurs)
- [ ] 📝 Documenter bugs connus non fixés (P3)
- [ ] ✅ Build APK corrigé
- [ ] ✅ Tests régression

---

### Jour 15 (Vendredi 6 déc) - UI/UX Mobile
**Durée**: 6h | **Responsable**: Designer + Dev

#### Matin (3h)
- [ ] 🎨 Ajuster espacements pour mobile
- [ ] 🎨 Tailles boutons (min 48dp)
- [ ] 🎨 Contraste texte (accessibilité)
- [ ] 🎨 Touch targets (44x44 minimum)

#### Après-midi (3h)
- [ ] 🎨 Tester orientation landscape
- [ ] 🎨 Dark mode (si implémenté)
- [ ] 🎨 Animations fluides
- [ ] ✅ Review final design

**Livrables Semaine 3**:
- ✅ APK testé sur 5+ devices
- ✅ Performance optimisée
- ✅ Bugs majeurs corrigés
- ✅ UI/UX mobile finalisée

---

## 🚀 SEMAINE 4: PUBLICATION (9-16 déc)

### Jour 16 (Lundi 9 déc) - Keystore & Signature
**Durée**: 4h | **Responsable**: Lead Dev

#### Matin (2h)
- [ ] 🔐 Générer keystore production
- [ ] 🔐 Sauvegarder keystore (3 copies)
- [ ] 🔐 Documenter mots de passe

**Commandes**:
```bash
# Générer keystore
keytool -genkey -v -keystore vhd-church-release.keystore \
  -alias vhd-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Sauvegarder:
# 1. Google Drive (chiffré)
# 2. USB externe
# 3. Gestionnaire de mots de passe
```

#### Après-midi (2h)
- [ ] 🔐 Configurer `android/app/build.gradle` avec keystore
- [ ] ✅ Build AAB signé
- [ ] ✅ Vérifier signature

**build.gradle**:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("vhd-church-release.keystore")
            storePassword "***"
            keyAlias "vhd-release"
            keyPassword "***"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

### Jour 17 (Mardi 10 déc) - Google Play Listing
**Durée**: 8h | **Responsable**: Marketing + Dev

#### Matin (4h)
- [ ] 📝 Rédiger description courte (80 caractères)
- [ ] 📝 Rédiger description longue (4000 caractères)
- [ ] 📝 Traduire en FR/EN
- [ ] 🎨 Créer bannière promo (1024x500)

**Description exemple**:
```
Titre: VHD Church - Gestion d'Église
Description courte: Gérez votre église: dons, événements, sermons, prières et plus encore!

Description longue:
VHD Church est l'application complète de gestion d'église pour la communauté des Vaillants Hommes de David.

🙏 FONCTIONNALITÉS:
• Dons en ligne (M-Pesa, Orange, Airtel Money)
• Calendrier événements & cultes
• Bibliothèque sermons vidéo/audio
• Prières & témoignages
• Chat communautaire
• Rendez-vous pastoraux
• Reconnaissance faciale (présences)
• Notifications temps réel

💰 100% GRATUIT - Aucun achat intégré
🔒 SÉCURISÉ - Authentification JWT
📱 HORS LIGNE - Fonctionne sans internet
```

#### Après-midi (4h)
- [ ] 📸 Screenshots (min 2, max 8)
  - Dashboard
  - Liste événements
  - Lecture sermon
  - Chat
  - Profil
- [ ] 🎥 Vidéo promo (optionnel, 30s-2min)
- [ ] ✅ Upload assets sur Play Console

---

### Jour 18 (Mercredi 11 déc) - Configuration Play Console
**Durée**: 6h | **Responsable**: Lead Dev

#### Matin (3h)
- [ ] 📋 Créer nouvelle app sur Play Console
- [ ] 📋 Remplir informations app
- [ ] 📋 Configurer pays de distribution (RDC, Afrique)
- [ ] 📋 Définir catégorie (Lifestyle)

#### Après-midi (3h)
- [ ] 📋 Politique de confidentialité (URL)
- [ ] 📋 Coordonnées contact
- [ ] 📋 Questionnaire contenu
- [ ] 📋 Classification d'âge (PEGI/ESRB)

---

### Jour 19 (Jeudi 12 déc) - Upload & Review
**Durée**: 4h | **Responsable**: Lead Dev

#### Matin (2h)
- [ ] 📤 Upload AAB sur Play Console
- [ ] 📤 Remplir notes de version
- [ ] 📤 Définir déploiement (Production)
- [ ] ✅ Soumettre pour review

**Notes de version**:
```
Version 1.0.0 (Build 1)
🎉 Première version de VHD Church App!

✨ Fonctionnalités:
• Authentification sécurisée
• Gestion des dons (M-Pesa, Orange, Airtel)
• Calendrier événements
• Bibliothèque sermons
• Prières et témoignages
• Chat communautaire
• Reconnaissance faciale
• Mode hors ligne

🐛 Bugs connus:
Aucun

📧 Support: chriskasongo@vhd.app
```

#### Après-midi (2h)
- [ ] ✅ Vérifier état review (Pending)
- [ ] 📝 Documenter process
- [ ] 🎉 Attendre validation (1-3 jours)

---

### Jour 20 (Vendredi 13 déc) - Veille & Corrections
**Durée**: Selon besoins | **Responsable**: Lead Dev

- [ ] 👀 Surveiller statut review
- [ ] 📧 Répondre questions Google (si besoin)
- [ ] 🐛 Corriger problèmes signalés
- [ ] 📝 Préparer plan post-lancement

---

### Jours 21-22 (Sam-Dim 14-15 déc) - Weekend
**Repos** - Google review en cours ⏳

---

### Jour 23 (Lundi 16 déc) - LANCEMENT! 🎉
**Durée**: Toute la journée | **Responsable**: Toute l'équipe

#### Si approuvé
- [ ] 🎉 Vérifier app en ligne sur Play Store
- [ ] 📱 Télécharger depuis Play Store
- [ ] ✅ Tests finaux
- [ ] 📣 Annonce officielle (réseaux sociaux, église)
- [ ] 📧 Email membres de l'église
- [ ] 🎊 Célébration équipe!

#### Si rejeté
- [ ] 📖 Lire raisons rejet
- [ ] 🔧 Corriger problèmes
- [ ] 📤 Re-soumettre
- [ ] ⏳ Attendre nouvelle review (24-48h)

**Livrables Semaine 4**:
- ✅ APK/AAB signé
- ✅ Play Store listing complet
- ✅ App publiée sur Google Play
- ✅ Lien public: https://play.google.com/store/apps/details?id=com.vhdchurch.app

---

## 📊 RÉCAPITULATIF 4 SEMAINES

| Semaine | Focus | Tâches | Livrables |
|---------|-------|--------|-----------|
| **S1** | Préparation | Setup Android, Build, Icônes, Permissions | APK debug |
| **S2** | Plugins | 6 plugins natifs (Storage, Caméra, Notifs, etc.) | APK avec features natives |
| **S3** | Tests | Tests devices, Optimisation, Corrections bugs | APK optimisé testé |
| **S4** | Publication | Keystore, Play Console, Review, Lancement | App sur Play Store ✅ |

---

## 👥 ÉQUIPE REQUISE

**Minimum** (1 personne):
- 1 Développeur Full-Stack (Frontend + Android)
- Durée: 160h (4 sem x 40h)

**Recommandé** (3 personnes):
- 1 Lead Developer (Android + Capacitor)
- 1 Frontend Developer (adaptations UI)
- 1 QA Tester (tests devices)
- Durée totale: ~120h par personne

**Optionnel**:
- 1 Designer (icônes, splash, screenshots)
- 1 Rédacteur (description Play Store)

---

## 💰 COÛTS DÉTAILLÉS

### Coûts Uniques
| Item | Prix | Obligatoire |
|------|------|-------------|
| Compte Google Play Console | $25 | ✅ Oui |
| **TOTAL** | **$25** | |

### Coûts Mensuels (optionnels)
| Service | Prix/mois | Nécessaire? |
|---------|-----------|-------------|
| Firebase (gratuit tier) | $0 | ✅ Oui (notifications) |
| Supabase (déjà payé) | $0 | ✅ Déjà actif |
| Vercel (déjà payé) | $0 | ✅ Déjà actif |
| **TOTAL** | **$0/mois** | |

### Coûts de Développement
| Rôle | Tarif/h | Heures | Total |
|------|---------|--------|-------|
| Dev solo | $0 (interne) | 160h | $0 |
| **OU** Freelance | $30-50 | 160h | $4,800-8,000 |

**TOTAL MINIMUM SI DEV INTERNE: $25 USD** ✅

---

## 🔄 SUIVI POST-LANCEMENT

### Semaine 5 (17-23 déc)
- [ ] 📊 Monitoring Play Console
- [ ] 📈 Analytics (téléchargements, crashes)
- [ ] 📧 Support utilisateurs
- [ ] 🐛 Hotfixes si nécessaire

### Mois 2 (Janvier 2026)
- [ ] 📊 Analyser feedback utilisateurs
- [ ] ⭐ Répondre avis Play Store
- [ ] 🔄 Planifier v1.1.0
- [ ] ✨ Ajouter fonctionnalités P1

---

## ✅ CHECKLIST FINALE AVANT LANCEMENT

**Technique**:
- [ ] ✅ APK signé et testé
- [ ] ✅ Taille < 25 MB
- [ ] ✅ Support Android 7+ (API 24)
- [ ] ✅ Permissions justifiées
- [ ] ✅ Crash rate < 1%
- [ ] ✅ Mode offline fonctionnel

**Marketing**:
- [ ] ✅ Description FR + EN
- [ ] ✅ 4+ screenshots
- [ ] ✅ Icône haute qualité
- [ ] ✅ Bannière promo

**Légal**:
- [ ] ✅ Politique confidentialité
- [ ] ✅ Conditions d'utilisation
- [ ] ✅ Contact support
- [ ] ✅ Classification d'âge

---

**DATE CIBLE LANCEMENT: 16 DÉCEMBRE 2025** 🎯

**PRÊT À COMMENCER?** 🚀
