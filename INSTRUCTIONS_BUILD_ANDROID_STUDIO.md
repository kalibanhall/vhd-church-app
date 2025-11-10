# 📱 Instructions Build APK avec Android Studio

## Étape 1 : Ouvrir le Projet

1. **Lancez Android Studio**
2. **File > Open** (ou Ctrl+O)
3. Naviguez vers : `c:\vhd app\android-app`
4. Cliquez sur **OK**

## Étape 2 : Synchronisation Gradle (Automatique)

Android Studio va automatiquement :
- ✅ Détecter que le Gradle wrapper est manquant
- ✅ Créer `gradlew.bat` et `gradlew`
- ✅ Télécharger Gradle 8.2
- ✅ Télécharger toutes les dépendances (Android, Kotlin, TensorFlow Lite, etc.)
- ✅ Résoudre les problèmes SSL automatiquement

**Temps estimé : 2-5 minutes** (première synchronisation)

### 🔍 Pendant la Synchronisation

Vous verrez en bas de l'écran :
```
Gradle sync in progress...
```

Attendez que le message devienne :
```
Gradle sync finished in XXs
```

## Étape 3 : Vérification (Optionnel)

Si vous voulez vérifier que tout est OK :

1. **Ouvrez le terminal dans Android Studio** : View > Tool Windows > Terminal
2. Exécutez :
   ```bash
   .\gradlew.bat tasks
   ```
3. Vous devriez voir la liste des tâches Gradle disponibles

## Étape 4 : Builder l'APK Debug

### Option A : Interface Graphique (FACILE)

1. **Menu** : Build > Build Bundle(s) / APK(s) > **Build APK(s)**
2. Attendez la compilation (2-5 minutes)
3. Une notification apparaît : **locate** ou **analyze APK**
4. Cliquez sur **locate** pour voir l'APK

**Emplacement de l'APK :**
```
c:\vhd app\android-app\app\build\outputs\apk\debug\app-debug.apk
```

### Option B : Ligne de Commande (dans le terminal Android Studio)

```bash
.\gradlew.bat assembleDebug
```

## Étape 5 : Vérifier l'APK

Une fois buildé, vérifiez que le modèle TensorFlow Lite est inclus :

```bash
# Dans le terminal Android Studio
cd app\build\outputs\apk\debug
jar -tf app-debug.apk | findstr facenet
```

Vous devriez voir :
```
assets/facenet.tflite
```

## 🎯 Étapes Suivantes

Après le build réussi :

1. **Installer l'APK sur un appareil/émulateur :**
   ```bash
   adb install app-debug.apk
   ```

2. **Tester la reconnaissance faciale :**
   - Ouvrez l'app
   - Connectez-vous en tant qu'admin
   - Naviguez vers Admin > Reconnaissance Faciale
   - Testez la caméra et la détection de visage

3. **Tests End-to-End :**
   - Voir `BUILD_GUIDE.md` pour les tests complets

## 🔧 Problèmes Potentiels

### Si Gradle Sync échoue

**Erreur de mémoire :**
- File > Settings > Build, Execution, Deployment > Compiler
- VM Options : `-Xmx4096m`

**Erreur de version Java :**
- Assurez-vous d'avoir JDK 17
- File > Project Structure > SDK Location > JDK location

### Si le Build échoue

**Nettoyez le projet :**
- Build > Clean Project
- Puis Build > Rebuild Project

**Ou en ligne de commande :**
```bash
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

## 📊 Métriques Attendues

- **Taille APK Debug** : 25-35 MB
- **Temps de build** : 2-5 minutes (première fois), ~1 minute ensuite
- **minSdk** : 24 (Android 7.0)
- **targetSdk** : 34 (Android 14)

## ✅ Checklist

- [ ] Android Studio ouvert
- [ ] Projet `android-app` ouvert
- [ ] Gradle sync terminé avec succès
- [ ] Build APK lancé (Build > Build APK)
- [ ] APK généré dans `app/build/outputs/apk/debug/`
- [ ] Fichier `facenet.tflite` présent dans l'APK
- [ ] APK installé sur appareil/émulateur
- [ ] Application testée et fonctionnelle

---

**Note :** Android Studio gère automatiquement les problèmes SSL/TLS que vous aviez en ligne de commande. C'est pourquoi c'est la méthode recommandée ! 🚀
