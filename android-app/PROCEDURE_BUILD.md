# 🚀 PROCÉDURE DE BUILD - ÉTAPES IMMÉDIATES

## ✅ Corrections Appliquées

1. **Kotlin mis à jour** : 1.9.20 → 2.0.21
2. **Compose Compiler** : Synchronisé avec Kotlin 2.0.21
3. **Gradle Wrapper** : Fichiers créés pour version 8.2

---

## 📋 PROCHAINES ÉTAPES

### Étape 1 : Fermer Android Studio
Si Android Studio est ouvert, **fermez-le complètement**.

### Étape 2 : Télécharger Gradle Wrapper JAR

**Ouvrez PowerShell** dans le dossier `android-app` et exécutez :

```powershell
cd "c:\vhd app\android-app"

# Télécharger le wrapper JAR
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar" -OutFile "gradle\wrapper\gradle-wrapper.jar"
```

**OU** téléchargez manuellement :
- URL : https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar
- Enregistrez dans : `c:\vhd app\android-app\gradle\wrapper\gradle-wrapper.jar`

### Étape 3 : Ouvrir Android Studio

1. **Lancez Android Studio**
2. **File > Open**
3. Naviguez vers : `c:\vhd app\android-app`
4. Cliquez **OK**

### Étape 4 : Synchronisation Gradle

Android Studio va automatiquement :
- ✅ Détecter les fichiers wrapper
- ✅ Télécharger Gradle 8.2
- ✅ Synchroniser les dépendances
- ✅ Construire le projet

**Attendez le message** :
```
✅ Gradle sync finished
```

### Étape 5 : Build APK

**Après synchronisation réussie** :

**Option A - Interface** :
1. Menu : **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Attendez la compilation (2-5 min)
3. Cliquez sur **locate** pour voir l'APK

**Option B - Terminal Android Studio** :
```bash
.\gradlew.bat assembleDebug
```

---

## 🐛 Si Erreurs Persistent

### Erreur : "Gradle wrapper JAR not found"

**Solution** : Téléchargez manuellement le JAR
```powershell
# Dans PowerShell
cd "c:\vhd app\android-app"
New-Item -ItemType Directory -Path "gradle\wrapper" -Force
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar" -OutFile "gradle\wrapper\gradle-wrapper.jar"
```

### Erreur : SSL/TLS lors de la sync

**Solution** : Android Studio va contourner automatiquement. Si problème persiste :
1. File > Settings > Build Tools > Gradle
2. Gradle JDK : Sélectionnez **Android Studio JDK** (17 ou 21)

### Erreur : Incompatibilité versions

**Vérifiez** :
- Kotlin : **2.0.21** ✅ (mis à jour)
- Gradle : **8.2** ✅ (wrapper configuré)
- AGP : **8.2.0** ✅ (déjà correct)

---

## 📦 Résultat Attendu

**Après build réussi** :

```
APK Location:
c:\vhd app\android-app\app\build\outputs\apk\debug\app-debug.apk

Taille : ~25-35 MB
Contient : facenet.tflite (293 KB)
```

---

## ✅ Vérification Post-Build

```powershell
# Vérifier que TensorFlow Lite est inclus
cd "c:\vhd app\android-app\app\build\outputs\apk\debug"
jar -tf app-debug.apk | findstr facenet

# Doit afficher :
# assets/facenet.tflite
```

---

## 🎯 Installation & Test

```bash
# Installer sur émulateur/appareil
adb install app-debug.apk

# Voir les logs en temps réel
adb logcat | findstr -i "church facial tensorflow"
```

---

**🚀 COMMENCEZ PAR L'ÉTAPE 2 : Téléchargez le gradle-wrapper.jar**
