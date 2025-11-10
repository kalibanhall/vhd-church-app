# 🚀 Installation Rapide - VHD Church App

## ⚡ Installation en 5 Minutes

### 1️⃣ Vérifier les Prérequis

Assurez-vous d'avoir:
- [ ] Windows 10/11
- [ ] 10 GB d'espace disque libre
- [ ] Connexion Internet stable

### 2️⃣ Installer Flutter

```powershell
# Télécharger Flutter SDK
# URL: https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.16.0-stable.zip

# Extraire dans C:\flutter

# Ajouter au PATH (PowerShell Admin)
[System.Environment]::SetEnvironmentVariable('Path', $env:Path + ';C:\flutter\bin', [System.EnvironmentVariableTarget]::Machine)

# Redémarrer PowerShell et vérifier
flutter --version
```

### 3️⃣ Installer Android Studio

```powershell
# Télécharger Android Studio
# URL: https://developer.android.com/studio

# Installer avec les options par défaut
# Sélectionner "Standard" lors de la configuration initiale
```

### 4️⃣ Configurer Flutter

```powershell
# Accepter les licences Android
flutter doctor --android-licenses
# Tapez 'y' pour toutes les licences

# Vérifier la configuration
flutter doctor -v
```

### 5️⃣ Compiler l'Application

```powershell
# Aller dans le dossier du projet
cd "c:\vhd app\flutter-app"

# Installer les dépendances
flutter pub get

# Compiler l'APK
flutter build apk --release

# L'APK est dans: build\app\outputs\flutter-apk\app-release.apk
```

## 🎯 Installation sur Téléphone

### Option A: Via USB

1. Activer le **Mode Développeur** sur Android:
   - Aller dans Paramètres > À propos du téléphone
   - Taper 7 fois sur "Numéro de build"

2. Activer le **Débogage USB**:
   - Aller dans Paramètres > Options pour les développeurs
   - Activer "Débogage USB"

3. Connecter le téléphone et installer:
   ```powershell
   flutter install
   ```

### Option B: Via APK

1. Transférer `app-release.apk` sur votre téléphone
2. Ouvrir le fichier APK
3. Autoriser l'installation depuis des sources inconnues
4. Installer

## ✅ Vérification

L'application devrait:
- ✅ S'ouvrir sans erreur
- ✅ Afficher l'écran de splash
- ✅ Permettre la connexion/inscription
- ✅ Se connecter à la base de données Supabase

## 🆘 Problèmes Fréquents

### "Flutter command not found"
```powershell
# Vérifier le PATH
$env:Path
# Doit contenir C:\flutter\bin
```

### "Android licenses not accepted"
```powershell
flutter doctor --android-licenses
```

### "Gradle build failed"
```powershell
cd "c:\vhd app\flutter-app"
flutter clean
flutter pub get
flutter build apk
```

## 📞 Support

Si vous rencontrez des problèmes, consultez:
- `GUIDE_COMPILATION.md` pour plus de détails
- `PROJET_COMPLETE.md` pour la documentation complète
- `README.md` pour les informations générales

---

**Temps d'installation total**: 30-45 minutes (première fois)
**Temps de compilation**: 5-10 minutes
