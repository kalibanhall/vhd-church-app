# Guide de Compilation - VHD Church App Flutter

## 📋 Prérequis

### 1. Installation de Flutter

```powershell
# Télécharger Flutter SDK
# Aller sur https://flutter.dev/docs/get-started/install/windows
# Extraire dans C:\flutter

# Ajouter au PATH
$env:Path += ";C:\flutter\bin"

# Vérifier l'installation
flutter doctor
```

### 2. Installation d'Android Studio

1. Télécharger Android Studio: https://developer.android.com/studio
2. Installer avec SDK Android
3. Installer les outils de ligne de commande Android

### 3. Configuration

```powershell
# Accepter les licences Android
flutter doctor --android-licenses

# Vérifier la configuration
flutter doctor -v
```

## 🚀 Compilation

### Étape 1: Aller dans le dossier du projet

```powershell
cd "c:\vhd app\flutter-app"
```

### Étape 2: Installer les dépendances

```powershell
flutter pub get
```

### Étape 3: Vérifier la configuration

```powershell
flutter doctor
```

### Étape 4: Compiler l'application

#### Version Debug (pour les tests)

```powershell
flutter build apk --debug
```

L'APK sera généré dans: `build\app\outputs\flutter-apk\app-debug.apk`

#### Version Release (pour la production)

```powershell
flutter build apk --release
```

L'APK sera généré dans: `build\app\outputs\flutter-apk\app-release.apk`

#### App Bundle (pour Google Play Store)

```powershell
flutter build appbundle --release
```

Le bundle sera généré dans: `build\app\outputs\bundle\release\app-release.aab`

### Étape 5: Installer sur un appareil

#### Via USB (Mode développeur activé)

```powershell
# Lister les appareils connectés
flutter devices

# Installer l'application
flutter install
```

#### Via Fichier APK

1. Transférer le fichier APK sur votre téléphone
2. Ouvrir le fichier APK sur le téléphone
3. Autoriser l'installation depuis des sources inconnues
4. Installer l'application

## 🧪 Tests

### Lancer l'application en mode développement

```powershell
# Sur un émulateur Android
flutter run

# Sur un appareil physique
flutter run -d <device_id>
```

### Tests unitaires

```powershell
flutter test
```

## ⚙️ Configuration Supabase

Le fichier `.env` contient déjà la configuration Supabase:

```env
SUPABASE_URL=https://lwmyferidfbzcnggddob.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 Résolution de Problèmes

### Erreur: "Flutter SDK not found"

```powershell
# Définir la variable d'environnement
$env:FLUTTER_ROOT = "C:\flutter"
```

### Erreur: "Android licenses not accepted"

```powershell
flutter doctor --android-licenses
# Accepter toutes les licences en tapant 'y'
```

### Erreur de compilation Gradle

```powershell
# Nettoyer le projet
flutter clean

# Réinstaller les dépendances
flutter pub get

# Compiler à nouveau
flutter build apk
```

### Erreur de mémoire insuffisante

Modifier `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4G
```

## 📱 Fonctionnalités Implémentées

✅ Authentification (Login/Register avec Supabase)
✅ Dashboard avec statistiques
✅ Gestion des événements
✅ Sermons et prédications
✅ Profil utilisateur
✅ Navigation bottom bar
✅ Thème personnalisé
✅ Connexion à la base de données PostgreSQL Supabase
✅ Architecture Clean Architecture
✅ Gestion d'état avec BLoC

## 📦 Structure du Projet

```
flutter-app/
├── lib/
│   ├── core/                   # Configuration & utils
│   │   ├── config/
│   │   ├── constants/
│   │   └── theme/
│   ├── domain/                 # Entités métier
│   │   └── entities/
│   ├── data/                   # Données (à implémenter)
│   │   ├── datasources/
│   │   ├── models/
│   │   └── repositories/
│   └── presentation/           # UI
│       └── screens/
├── android/                    # Configuration Android
├── assets/                     # Resources
└── pubspec.yaml               # Dépendances
```

## 🔐 Sécurité

- Les credentials Supabase sont stockés dans `.env`
- Connexion sécurisée HTTPS
- Authentification JWT via Supabase Auth
- Validation des formulaires côté client

## 📝 Notes Importantes

1. **Première compilation**: La première compilation peut prendre 10-15 minutes
2. **Taille de l'APK**: ~50-60 MB pour la version release
3. **Version Android minimale**: Android 6.0 (API 23)
4. **Version Android cible**: Android 14 (API 34)

## 🆘 Support

Pour toute question ou problème:
- GitHub: [@KalibanHall](https://github.com/KalibanHall)
- Email: Voir la documentation du projet

---

**Auteur**: CHRIS NGOZULU KASONGO (KalibanHall)
**Version**: 1.0.0
**Date**: Novembre 2025
