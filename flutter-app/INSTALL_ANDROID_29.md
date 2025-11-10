# Installation Android SDK Platform 29

## Erreur
```
Failed to install the following SDK components:
platforms;android-29 Android SDK Platform 29
```

## Solution rapide

### Option 1: Via Android Studio (Recommandé)
1. Ouvrez **Android Studio**
2. Allez dans **Tools > SDK Manager**
3. Onglet **SDK Platforms**
4. Cochez **Android 10.0 (Q) - API Level 29**
5. Cliquez **Apply** puis **OK**
6. Attendez la fin de l'installation
7. Relancez la compilation

### Option 2: Via ligne de commande
```powershell
cd "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin"
.\sdkmanager.bat "platforms;android-29"
```

## Après l'installation
```powershell
cd "c:\vhd app\flutter-app"
flutter clean
flutter build apk --release
```
