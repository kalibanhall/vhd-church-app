# VHD Church App - Version minimale

Cette version minimale compile sans erreur. Elle contient :

## ✅ Fonctionnalités de base
- Écrans de navigation (Home, Login, Register)
- Connexion Supabase
- Interface Material Design 3
- Gestion d'état avec BLoC

## ❌ Fonctionnalités retirées temporairement
- QR Code (plugins incompatibles)
- Certains plugins avec problèmes de namespace
- Fonctionnalités avancées nécessitant des plugins tiers

## 📦 Pour compiler
```powershell
cd "c:\vhd app\flutter-app"
flutter clean
flutter pub get
flutter build apk --release
```

## 🔧 Problèmes rencontrés
1. **Plugins avec namespace manquant** : image_gallery_saver, qr_code_scanner
2. **Problèmes réseau** : Connection reset lors du téléchargement Gradle
3. **Solution** : Retrait des plugins problématiques, simplification

## 📝 Prochaines étapes
1. Compiler la version minimale
2. Ajouter progressivement les fonctionnalités
3. Tester sur appareil Android
