# 🔥 Configuration Firebase pour MyChurchApp Android

## 🎯 Vue d'Ensemble

L'application Android utilise Firebase pour :
- ✅ **Firebase Cloud Messaging (FCM)** : Notifications push
- ✅ **Firebase Analytics** : Suivi de l'utilisation
- ✅ **Firebase Crashlytics** : Rapports de crash

---

## ⚠️ Problème Résolu

### Erreur Initiale
```
Execution failed for task ':app:processDebugGoogleServices'.
> File google-services.json is missing.
```

### Solution Appliquée
Un fichier `google-services.json` de développement a été créé pour permettre le build initial.

---

## 🔧 Configuration pour le Développement

### Option A : Utiliser le Fichier de Développement (Actuel)

Le fichier `google-services.json` actuel contient des valeurs factices qui permettent de compiler l'application. 

**Limitations** :
- ❌ Les notifications push ne fonctionneront pas
- ❌ Analytics ne remontera pas de données
- ❌ Crashlytics ne remontera pas les erreurs
- ✅ L'application se compile et s'exécute normalement

**Utilisation** : Parfait pour tester les fonctionnalités non-Firebase (reconnaissance faciale, UI, navigation, etc.)

### Option B : Configurer un Projet Firebase Réel

Pour avoir des notifications push fonctionnelles :

#### 1️⃣ Créer/Accéder au Projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur **"Add project"** ou sélectionner un projet existant
3. Nom suggéré : `MyChurchApp` ou `VHD-Church-App`

#### 2️⃣ Ajouter une Application Android

1. Dans Firebase Console, cliquer sur l'icône **Android** (</>) 
2. Remplir les informations :
   - **Package name** : `com.mychurchapp` ⚠️ IMPORTANT : doit correspondre exactement
   - **App nickname** : MyChurchApp (optionnel)
   - **Debug signing certificate SHA-1** : Optionnel pour le développement

#### 3️⃣ Télécharger google-services.json

1. Cliquer sur **"Download google-services.json"**
2. Copier le fichier téléchargé dans :
   ```
   c:\vhd app\android-app\app\google-services.json
   ```
3. ⚠️ **Remplacer** le fichier actuel (qui contient des valeurs factices)

#### 4️⃣ Activer les Services Firebase

Dans Firebase Console :

**Firebase Cloud Messaging (FCM)** :
- Pas de configuration spéciale requise
- Déjà activé par défaut

**Firebase Analytics** :
- Pas de configuration spéciale requise
- Déjà activé par défaut

**Firebase Crashlytics** :
1. Aller dans **Crashlytics** dans le menu latéral
2. Cliquer sur **"Enable Crashlytics"**
3. Suivre les instructions (déjà fait dans le code)

#### 5️⃣ Obtenir le Server Key (pour les notifications depuis le backend)

1. Dans Firebase Console, aller dans **Project Settings** (icône ⚙️)
2. Onglet **"Cloud Messaging"**
3. Copier le **"Server key"** ou créer une nouvelle clé API
4. Ajouter cette clé dans votre backend Next.js :
   ```bash
   # Dans .env.local
   FIREBASE_SERVER_KEY=YOUR_SERVER_KEY_HERE
   ```

---

## 📂 Structure des Fichiers

```
android-app/app/
├── google-services.json           # Configuration Firebase (factice pour dev)
├── google-services.json.template  # Template pour configurer Firebase
└── .gitignore                     # Ignore google-services.json (sécurité)
```

---

## 🔒 Sécurité

### ⚠️ IMPORTANT : Ne PAS Commiter le Fichier Réel

Le fichier `.gitignore` a été configuré pour exclure `google-services.json` :

```gitignore
# Firebase configuration (use template instead)
google-services.json
```

**Pourquoi ?**
- Le fichier contient des clés API
- Peut être exploité si exposé publiquement
- Chaque environnement (dev/staging/prod) doit avoir son propre fichier

### ✅ Bonnes Pratiques

1. **Développement Local** :
   - Utiliser le fichier factice OU votre propre projet Firebase de dev
   
2. **CI/CD** :
   - Stocker `google-services.json` comme secret dans GitHub Actions
   - Injecter le fichier pendant le build

3. **Production** :
   - Créer un projet Firebase dédié
   - Utiliser des restrictions d'API key
   - Activer App Check pour la sécurité

---

## 🧪 Tester les Notifications Push

### 1. Avec Firebase Console (Simple)

1. Firebase Console → **Cloud Messaging**
2. Cliquer sur **"Send your first message"**
3. Entrer un titre et un message
4. Cliquer sur **"Send test message"**
5. Entrer le FCM token de votre appareil (affiché dans les logs Android)
6. Tester !

### 2. Avec votre Backend Next.js

```typescript
// Dans votre API route Next.js
import admin from 'firebase-admin';

// Initialiser Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Envoyer une notification
await admin.messaging().send({
  token: userFcmToken,
  notification: {
    title: 'Nouveau sermon disponible',
    body: 'Regardez le dernier message du pasteur',
  },
  data: {
    type: 'sermon',
    sermonId: '123',
  },
});
```

### 3. Récupérer le FCM Token dans l'App

Le service `ChurchMessagingService` gère déjà cela :

```kotlin
// android-app/app/src/main/java/.../service/ChurchMessagingService.kt
override fun onNewToken(token: String) {
    // Token envoyé au backend automatiquement
    Log.d("FCM", "New token: $token")
}
```

Le token est affiché dans les logs Android (Logcat).

---

## 🚀 Synchroniser et Builder

Après avoir configuré Firebase (ou en utilisant le fichier factice) :

### Dans Android Studio :

1. **Sync Gradle** :
   ```
   File → Sync Project with Gradle Files
   ```

2. **Build APK** :
   ```
   Build → Build Bundle(s) / APK(s) → Build APK(s)
   ```

### Le build devrait maintenant réussir ! ✅

---

## 📊 Vérification

### Logs à Vérifier

Après avoir lancé l'app avec une vraie config Firebase :

```bash
adb logcat | grep -E "FCM|Firebase"
```

**Logs attendus** :
```
FirebaseApp: Firebase app initialized
FirebaseMessaging: Token: ey...
ChurchMessagingService: FCM Token registered successfully
```

### Dashboard Firebase

Dans Firebase Console, vous devriez voir :
- **Analytics** : Événements de l'app
- **Crashlytics** : Rapports de crash (si configuré)
- **Cloud Messaging** : Statistiques d'envoi

---

## 🔄 Migration vers Production

Quand vous passerez en production :

1. **Créer un nouveau projet Firebase** pour la production
2. **Télécharger le nouveau google-services.json**
3. **Configurer les build variants** :
   ```kotlin
   // Dans app/build.gradle.kts
   flavorDimensions += "environment"
   productFlavors {
       create("dev") {
           dimension = "environment"
           applicationIdSuffix = ".dev"
       }
       create("prod") {
           dimension = "environment"
       }
   }
   ```
4. **Utiliser des fichiers différents** :
   - `app/src/dev/google-services.json` (dev)
   - `app/src/prod/google-services.json` (production)

---

## 🆘 Dépannage

### Problème : "google-services.json is missing"
✅ **Résolu** - Fichier créé avec des valeurs factices

### Problème : "Default FirebaseApp failed to initialize"
**Cause** : Fichier `google-services.json` invalide  
**Solution** : Télécharger un vrai fichier depuis Firebase Console

### Problème : Notifications ne fonctionnent pas
**Cause** : Utilisation du fichier factice  
**Solution** : Configurer un vrai projet Firebase (voir Option B ci-dessus)

### Problème : "Package name mismatch"
**Cause** : Le package name dans Firebase ne correspond pas à `com.mychurchapp`  
**Solution** : Recréer l'app Android dans Firebase avec le bon package name

---

## 📚 Ressources

- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)

---

**Date de configuration** : 2025-11-02  
**Statut** : ✅ Fichier factice créé, build possible  
**Prochaine étape** : Build APK → Tests E2E
