# 📱 Guide de Build - Church Management Android App

## 🎯 Prérequis

### Logiciels Requis
- ✅ Android Studio (dernière version)
- ✅ JDK 17 ou supérieur
- ✅ Android SDK 34
- ✅ Gradle 8.x (inclus dans le wrapper)

### Vérifications
```bash
# Java version
java -version  # Doit afficher version 17+

# Android SDK
echo $ANDROID_HOME  # Doit pointer vers le SDK Android
```

## 🔨 Build Debug (Développement)

### 1. Préparer l'environnement

```bash
cd android-app

# Nettoyer les builds précédents
./gradlew clean

# Vérifier la configuration
./gradlew tasks
```

### 2. Build Debug APK

```bash
# Build l'APK de debug
./gradlew assembleDebug

# L'APK sera généré dans:
# app/build/outputs/apk/debug/app-debug.apk
```

### 3. Installer sur un appareil/émulateur

```bash
# Lister les appareils connectés
adb devices

# Installer l'APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Ou directement
./gradlew installDebug
```

## 🚀 Build Release (Production)

### 1. Créer le Keystore (première fois uniquement)

```bash
# Générer le keystore
keytool -genkey -v -keystore church-app.keystore \
  -alias church-app-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Sauvegarder le mot de passe dans un endroit sécurisé!
```

### 2. Configurer signing (app/build.gradle.kts)

```kotlin
android {
    signingConfigs {
        create("release") {
            storeFile = file("../church-app.keystore")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "church-app-key"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            // ... reste de la config
        }
    }
}
```

### 3. Variables d'environnement

```bash
# Windows PowerShell
$env:KEYSTORE_PASSWORD="votre_mot_de_passe"
$env:KEY_PASSWORD="votre_mot_de_passe_cle"

# Linux/Mac
export KEYSTORE_PASSWORD="votre_mot_de_passe"
export KEY_PASSWORD="votre_mot_de_passe_cle"
```

### 4. Build Release APK

```bash
# Build l'APK de release
./gradlew assembleRelease

# L'APK sera généré dans:
# app/build/outputs/apk/release/app-release.apk
```

### 5. Générer un Bundle (pour Google Play)

```bash
# Générer le bundle AAB
./gradlew bundleRelease

# Le bundle sera généré dans:
# app/build/outputs/bundle/release/app-release.aab
```

## ✅ Vérifications Post-Build

### 1. Vérifier le contenu de l'APK

```bash
# Lister le contenu
unzip -l app/build/outputs/apk/debug/app-debug.apk

# Vérifier que facenet.tflite est inclus
unzip -l app/build/outputs/apk/debug/app-debug.apk | grep facenet
# Devrait afficher: 293390  assets/facenet.tflite
```

### 2. Analyser l'APK

```bash
# Taille de l'APK
ls -lh app/build/outputs/apk/debug/app-debug.apk

# Analyse détaillée (dans Android Studio)
# Build > Analyze APK...
```

### 3. Tester l'application

```bash
# Lancer l'app sur l'émulateur
adb shell am start -n com.mychurchapp/.MainActivity

# Vérifier les logs
adb logcat | grep -E "ChurchApp|TensorFlow|FacialRecognition"
```

## 🐛 Troubleshooting

### Problème: "SDK location not found"

```bash
# Créer local.properties
echo "sdk.dir=C:\\Users\\VotreNom\\AppData\\Local\\Android\\Sdk" > local.properties
```

### Problème: "Execution failed for task ':app:lintVitalRelease'"

```bash
# Désactiver temporairement lint (app/build.gradle.kts)
android {
    lintOptions {
        checkReleaseBuilds = false
        abortOnError = false
    }
}
```

### Problème: "TensorFlow Lite model not found"

```bash
# Vérifier que le fichier existe
ls -l app/src/main/assets/facenet.tflite

# Re-télécharger si nécessaire
curl -L "https://github.com/sirius-ai/MobileFaceNet_TF/raw/master/MobileFaceNet.tflite" \
  -o app/src/main/assets/facenet.tflite
```

### Problème: OutOfMemoryError

```bash
# Augmenter la mémoire Gradle (gradle.properties)
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

## 📦 Optimisations Build

### 1. Enable R8 (Minification)

```kotlin
// app/build.gradle.kts
android {
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
}
```

### 2. ProGuard Rules (proguard-rules.pro)

```proguard
# TensorFlow Lite
-keep class org.tensorflow.lite.** { *; }
-keep interface org.tensorflow.lite.** { *; }

# Retrofit
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Kotlin Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
```

### 3. Splits par ABI (réduit la taille)

```kotlin
// app/build.gradle.kts
android {
    splits {
        abi {
            isEnable = true
            reset()
            include("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
            isUniversalApk = false
        }
    }
}
```

## 📊 Métriques de Build

### Tailles Attendues

| Type | Taille Attendue | Notes |
|------|----------------|-------|
| Debug APK | ~25-35 MB | Inclut TFLite (293 KB), Room, Retrofit, Compose |
| Release APK (non-minified) | ~23-30 MB | Sans ProGuard/R8 |
| Release APK (minified) | ~18-25 MB | Avec ProGuard/R8 |
| AAB Bundle | ~20-28 MB | Format optimisé pour Play Store |

### Temps de Build

- **Clean Build**: 2-5 minutes (première fois)
- **Incremental Build**: 30-60 secondes
- **Release Build**: 3-6 minutes (avec optimisations)

## 🎯 Checklist Finale

Avant de publier sur le Play Store:

- [ ] ✅ Version code incrémenté (build.gradle.kts)
- [ ] ✅ Version name mise à jour (ex: 1.0.0 → 1.1.0)
- [ ] ✅ ProGuard activé et testé
- [ ] ✅ APK signé avec keystore de production
- [ ] ✅ Tests effectués sur plusieurs appareils
- [ ] ✅ TensorFlow Lite model vérifié dans l'APK
- [ ] ✅ Permissions minimales dans AndroidManifest.xml
- [ ] ✅ API URL configurée pour production (.env)
- [ ] ✅ Logs de debug supprimés
- [ ] ✅ Screenshots et description préparés

## 🔗 Ressources

- [Android Studio Download](https://developer.android.com/studio)
- [Gradle Build Tool](https://gradle.org/)
- [ProGuard Rules](https://www.guardsquare.com/manual/configuration/usage)
- [Play Console](https://play.google.com/console)

---

**Build Status**: Ready for production ✅
