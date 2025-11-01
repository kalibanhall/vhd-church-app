# 🛠️ Guide de Build - MyChurchApp Android

## 📋 Prérequis système

### Logiciels requis

```bash
✅ Android Studio Hedgehog (2023.1.1) ou supérieur
✅ JDK 17 (recommandé: OpenJDK ou Oracle JDK)
✅ Android SDK 34 (API 34)
✅ Gradle 8.2+
✅ Kotlin 1.9+
✅ Git
```

### Vérification de l'installation

```bash
# Vérifier Java
java -version
# Doit afficher: openjdk version "17.x.x" ou java version "17.x.x"

# Vérifier Android SDK
echo $ANDROID_HOME
# Doit pointer vers le SDK Android

# Vérifier Gradle
./gradlew --version
```

---

## 🚀 Installation & Configuration

### 1. Cloner le repository

```bash
git clone https://github.com/votre-org/vhd-church-app.git
cd vhd-church-app/android-app
```

### 2. Configuration de l'API

Créer le fichier `local.properties` à la racine du projet :

```properties
# SDK Android
sdk.dir=/path/to/your/Android/sdk

# API Endpoints
api.base.url=https://votre-api-production.com
api.base.url.dev=http://10.0.2.2:3000

# Note: 10.0.2.2 est l'alias localhost pour l'émulateur Android
# Pour un appareil physique, utiliser l'IP de votre machine (ex: 192.168.1.100:3000)
```

### 3. Configuration Firebase

1. **Créer un projet Firebase**
   - Aller sur https://console.firebase.google.com
   - Créer un nouveau projet
   - Activer : Authentication, Cloud Messaging, Crashlytics

2. **Télécharger google-services.json**
   - Dans Firebase Console → Project Settings → Your apps
   - Télécharger `google-services.json`
   - Placer dans `android-app/app/`

3. **Vérifier la configuration**
   ```kotlin
   // Le fichier doit contenir:
   {
     "project_info": {
       "project_id": "votre-projet-id",
       ...
     },
     "client": [...]
   }
   ```

### 4. Synchroniser Gradle

```bash
# Dans Android Studio
File → Sync Project with Gradle Files

# Ou en ligne de commande
./gradlew sync
```

---

## 🔨 Compilation

### Build Debug (Développement)

```bash
# Compiler l'APK debug
./gradlew assembleDebug

# APK généré dans:
# app/build/outputs/apk/debug/app-debug.apk

# Installer directement sur un appareil connecté
./gradlew installDebug
```

### Build Release (Production)

#### 1. Créer un Keystore

```bash
keytool -genkey -v -keystore mychurchapp-release.keystore \
  -alias mychurchapp -keyalg RSA -keysize 2048 -validity 10000

# Répondre aux questions:
# - Nom et prénom
# - Organisation
# - Ville, État, Pays
# - Mot de passe du keystore
# - Mot de passe de la clé
```

#### 2. Configurer le signing

Créer/éditer `android-app/keystore.properties` :

```properties
storeFile=../mychurchapp-release.keystore
storePassword=VotreMotDePasseKeystore
keyAlias=mychurchapp
keyPassword=VotreMotDePasseCle
```

**⚠️ NE JAMAIS COMMIT ce fichier dans Git!**

Ajouter à `.gitignore` :
```
keystore.properties
*.keystore
*.jks
```

#### 3. Modifier app/build.gradle.kts

```kotlin
android {
    // ...
    
    signingConfigs {
        create("release") {
            val keystorePropertiesFile = rootProject.file("keystore.properties")
            if (keystorePropertiesFile.exists()) {
                val keystoreProperties = Properties()
                keystoreProperties.load(FileInputStream(keystorePropertiesFile))
                
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            // ...
        }
    }
}
```

#### 4. Compiler le Release

```bash
# APK signé
./gradlew assembleRelease

# Généré dans:
# app/build/outputs/apk/release/app-release.apk

# AAB (Android App Bundle) pour Google Play
./gradlew bundleRelease

# Généré dans:
# app/build/outputs/bundle/release/app-release.aab
```

---

## 🧪 Tests

### Tests Unitaires

```bash
# Exécuter tous les tests unitaires
./gradlew test

# Exécuter les tests d'un module spécifique
./gradlew :app:test

# Avec rapport détaillé
./gradlew test --info

# Rapport HTML généré dans:
# app/build/reports/tests/testDebugUnitTest/index.html
```

### Tests d'Instrumentation (UI Tests)

```bash
# Connecter un appareil Android ou démarrer un émulateur

# Exécuter tous les tests d'instrumentation
./gradlew connectedAndroidTest

# Tests spécifiques
./gradlew :app:connectedAndroidTest

# Rapport dans:
# app/build/reports/androidTests/connected/index.html
```

### Couverture de code

```bash
# Générer le rapport de couverture
./gradlew jacocoTestReport

# Rapport dans:
# app/build/reports/jacoco/jacocoTestReport/html/index.html
```

---

## 📱 Exécution sur appareil

### Émulateur Android

1. **Créer un AVD (Android Virtual Device)**
   ```bash
   # Dans Android Studio
   Tools → Device Manager → Create Device
   
   # Choisir:
   - Phone: Pixel 6
   - API Level: 34 (Android 14)
   - RAM: 2048 MB minimum
   ```

2. **Démarrer l'émulateur**
   ```bash
   # Via Android Studio
   Run → Run 'app'
   
   # Ou ligne de commande
   ./gradlew installDebug
   adb shell am start -n com.mychurchapp.debug/.presentation.MainActivity
   ```

### Appareil physique

1. **Activer le mode développeur**
   - Paramètres → À propos du téléphone
   - Taper 7 fois sur "Numéro de build"
   
2. **Activer le débogage USB**
   - Paramètres → Options pour développeurs
   - Activer "Débogage USB"

3. **Connecter et vérifier**
   ```bash
   adb devices
   # Doit afficher votre appareil
   ```

4. **Installer l'app**
   ```bash
   ./gradlew installDebug
   ```

---

## 🔍 Débogage

### Logs ADB

```bash
# Voir tous les logs
adb logcat

# Filtrer par application
adb logcat | grep com.mychurchapp

# Filtrer par tag
adb logcat -s MyChurchApp

# Nettoyer les logs
adb logcat -c
```

### Debug en temps réel

```bash
# Dans Android Studio
Run → Debug 'app'

# Breakpoints
- Cliquer dans la marge gauche de l'éditeur
- Run → View Breakpoints (Ctrl+Shift+F8)
```

### Profiler

```bash
# Dans Android Studio
View → Tool Windows → Profiler

# Monitorer:
- CPU usage
- Memory allocation
- Network activity
- Energy consumption
```

---

## 📦 Dépendances

### Mettre à jour les dépendances

```bash
# Vérifier les versions obsolètes
./gradlew dependencyUpdates

# Mettre à jour dans build.gradle.kts
# Puis synchroniser
./gradlew sync
```

### Ajouter une nouvelle dépendance

```kotlin
// Dans app/build.gradle.kts
dependencies {
    implementation("com.example:library:1.0.0")
}
```

```bash
# Synchroniser
./gradlew sync
```

---

## 🛠️ Commandes utiles

### Nettoyage

```bash
# Nettoyer le build
./gradlew clean

# Nettoyer le cache Gradle
./gradlew cleanBuildCache

# Nettoyer complètement
rm -rf .gradle build app/build
```

### Build complet

```bash
# Clean + Build + Tests
./gradlew clean build test

# Build toutes les variantes
./gradlew assemble
```

### Lint & Vérifications

```bash
# Analyse statique du code
./gradlew lint

# Rapport dans:
# app/build/reports/lint-results.html

# Vérifier le formatage Kotlin
./gradlew ktlintCheck

# Corriger automatiquement
./gradlew ktlintFormat
```

---

## 🚨 Résolution de problèmes

### Problème: "SDK location not found"

```bash
# Solution: Créer local.properties
echo "sdk.dir=/path/to/android/sdk" > local.properties
```

### Problème: "Dependency resolution failed"

```bash
# Solution: Nettoyer et réessayer
./gradlew clean
./gradlew build --refresh-dependencies
```

### Problème: "Manifest merger failed"

```bash
# Solution: Ajouter dans AndroidManifest.xml
<application
    tools:replace="android:theme,android:label"
    ...>
```

### Problème: "Execution failed for task ':app:processDebugResources'"

```bash
# Solution: Invalider les caches
# Dans Android Studio:
File → Invalidate Caches / Restart
```

### Problème: "Unable to resolve dependency"

```bash
# Solution: Vérifier les repositories dans settings.gradle.kts
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
```

---

## 📊 Métriques de build

### Build Times (approximatifs)

```
Clean Build: ~2-3 minutes
Incremental Build: ~30-60 secondes
Tests unitaires: ~1 minute
Tests d'instrumentation: ~5-10 minutes
```

### Taille de l'APK

```
Debug APK: ~15-20 MB
Release APK (non optimisé): ~12-15 MB
Release APK (optimisé avec R8): ~8-10 MB
AAB (App Bundle): ~6-8 MB
```

---

## 🔐 Sécurité

### Fichiers à ne JAMAIS commit

```
local.properties
keystore.properties
*.keystore
*.jks
google-services.json (si contient des secrets)
firebase-adminsdk-*.json
```

### ProGuard/R8

```kotlin
// Activer dans build.gradle.kts
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

---

## 📝 Checklist avant release

- [ ] Tester sur plusieurs appareils (différentes tailles d'écran)
- [ ] Tester en mode offline
- [ ] Vérifier les permissions
- [ ] Optimiser les images
- [ ] Activer R8/ProGuard
- [ ] Mettre à jour versionCode et versionName
- [ ] Tester le processus de mise à jour
- [ ] Vérifier les crashlytics
- [ ] Tester les notifications push
- [ ] Vérifier la compatibilité Dark Mode
- [ ] Générer le changelog
- [ ] Créer les screenshots pour le Play Store
- [ ] Préparer la description de l'app

---

## 🎯 Configuration CI/CD

### GitHub Actions (exemple)

```yaml
name: Android CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Grant execute permission for gradlew
      run: chmod +x gradlew
      working-directory: android-app
    
    - name: Build with Gradle
      run: ./gradlew build
      working-directory: android-app
    
    - name: Run tests
      run: ./gradlew test
      working-directory: android-app
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android-app/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📞 Support

Pour toute question sur le build :
- Ouvrir une issue GitHub
- Consulter la documentation Android
- Vérifier Stack Overflow

---

**Dernière mise à jour** : Janvier 2025  
**Version du guide** : 1.0.0
