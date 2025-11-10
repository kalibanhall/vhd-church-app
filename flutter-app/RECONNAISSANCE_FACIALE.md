# 📸 Reconnaissance Faciale - VHD Church App

## 🎯 Fonctionnalité à Implémenter

La reconnaissance faciale permettra aux membres de s'enregistrer automatiquement aux événements en scannant leur visage.

---

## 📦 Dépendances Déjà Installées

✅ `google_ml_kit` - ML Kit de Google pour la détection de visages
✅ `camera` - Accès à la caméra de l'appareil
✅ `tflite_flutter` - TensorFlow Lite pour la reconnaissance

---

## 🏗️ Architecture Proposée

### 1. Modèle de Données

Créer une table `facial_recognition_data`:

```sql
CREATE TABLE facial_recognition_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  face_encoding BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### 2. Flux de Travail

```
1. Enregistrement
   ↓
2. Capture du visage avec la caméra
   ↓
3. Détection du visage avec ML Kit
   ↓
4. Extraction des caractéristiques (embeddings)
   ↓
5. Stockage dans PostgreSQL
   ↓
6. Confirmation

7. Check-in à un événement
   ↓
8. Scan du visage
   ↓
9. Comparaison avec les visages enregistrés
   ↓
10. Identification de la personne
   ↓
11. Enregistrement automatique de la présence
```

---

## 📁 Fichiers à Créer

### 1. Écran de Capture Faciale

`lib/presentation/screens/facial/facial_capture_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:google_ml_kit/google_ml_kit.dart';

class FacialCaptureScreen extends StatefulWidget {
  const FacialCaptureScreen({super.key});

  @override
  State<FacialCaptureScreen> createState() => _FacialCaptureScreenState();
}

class _FacialCaptureScreenState extends State<FacialCaptureScreen> {
  CameraController? _cameraController;
  final FaceDetector _faceDetector = GoogleMlKit.vision.faceDetector(
    FaceDetectorOptions(
      enableClassification: true,
      enableLandmarks: true,
      enableTracking: true,
    ),
  );

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    final frontCamera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
    );

    _cameraController = CameraController(
      frontCamera,
      ResolutionPreset.high,
      enableAudio: false,
    );

    await _cameraController!.initialize();
    if (mounted) setState(() {});
  }

  Future<void> _captureFace() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    try {
      final image = await _cameraController!.takePicture();
      final inputImage = InputImage.fromFilePath(image.path);
      final faces = await _faceDetector.processImage(inputImage);

      if (faces.isNotEmpty) {
        // Visage détecté
        // TODO: Extraire les caractéristiques et sauvegarder
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Visage capturé avec succès !')),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Aucun visage détecté')),
          );
        }
      }
    } catch (e) {
      debugPrint('Erreur lors de la capture: $e');
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _faceDetector.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Capture Faciale')),
      body: Stack(
        children: [
          CameraPreview(_cameraController!),
          Positioned(
            bottom: 32,
            left: 0,
            right: 0,
            child: Center(
              child: FloatingActionButton.large(
                onPressed: _captureFace,
                child: const Icon(Icons.camera),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

### 2. Service de Reconnaissance Faciale

`lib/data/services/facial_recognition_service.dart`

```dart
import 'package:vhd_church_app/core/config/supabase_config.dart';
import 'dart:typed_data';

class FacialRecognitionService {
  Future<void> saveFaceData({
    required String userId,
    required Uint8List faceEncoding,
  }) async {
    try {
      await SupabaseConfig.client.from('facial_recognition_data').insert({
        'user_id': userId,
        'face_encoding': faceEncoding,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
        'is_active': true,
      });
    } catch (e) {
      throw Exception('Erreur lors de la sauvegarde: $e');
    }
  }

  Future<Map<String, dynamic>?> identifyFace({
    required Uint8List faceEncoding,
  }) async {
    try {
      // TODO: Implémenter la comparaison des encodages
      // Pour l'instant, retourne null
      return null;
    } catch (e) {
      throw Exception('Erreur lors de l\'identification: $e');
    }
  }

  Future<void> checkInToEvent({
    required String userId,
    required String eventId,
  }) async {
    try {
      await SupabaseConfig.client.from('event_attendances').insert({
        'user_id': userId,
        'event_id': eventId,
        'attendance_date': DateTime.now().toIso8601String(),
        'check_in_time': DateTime.now().toIso8601String(),
        'status': 'PRESENT',
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Erreur lors du check-in: $e');
    }
  }
}
```

### 3. Écran de Check-in avec Reconnaissance Faciale

`lib/presentation/screens/facial/facial_checkin_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:vhd_church_app/data/services/facial_recognition_service.dart';

class FacialCheckInScreen extends StatefulWidget {
  final String eventId;
  
  const FacialCheckInScreen({
    super.key,
    required this.eventId,
  });

  @override
  State<FacialCheckInScreen> createState() => _FacialCheckInScreenState();
}

class _FacialCheckInScreenState extends State<FacialCheckInScreen> {
  final _service = FacialRecognitionService();
  bool _isProcessing = false;

  Future<void> _scanAndCheckIn() async {
    setState(() => _isProcessing = true);

    try {
      // TODO: Capturer le visage et identifier
      // TODO: Si identifié, faire le check-in
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Check-in réussi !')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Check-in Facial')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.face, size: 100, color: Colors.blue),
            const SizedBox(height: 24),
            const Text(
              'Positionnez votre visage\ndans le cadre',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 48),
            ElevatedButton.icon(
              onPressed: _isProcessing ? null : _scanAndCheckIn,
              icon: _isProcessing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.camera_alt),
              label: Text(_isProcessing ? 'Scan en cours...' : 'Scanner'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🔧 Configuration Requise

### 1. Permissions Supplémentaires

Déjà configurées dans `AndroidManifest.xml`:

```xml
✅ <uses-permission android:name="android.permission.CAMERA" />
✅ <uses-feature android:name="android.hardware.camera" />
```

### 2. Modèle TensorFlow Lite

Télécharger un modèle pré-entraîné:
- FaceNet: https://github.com/nyoki-mtl/keras-facenet
- MobileFaceNet: https://github.com/sirius-ai/MobileFaceNet_TF

Placer dans `assets/models/facenet.tflite`

### 3. Base de Données

Exécuter sur Supabase:

```sql
-- Table pour stocker les encodages faciaux
CREATE TABLE facial_recognition_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  face_encoding BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Index pour optimiser les recherches
CREATE INDEX idx_facial_user ON facial_recognition_data(user_id);
CREATE INDEX idx_facial_active ON facial_recognition_data(is_active);
```

---

## 📊 Algorithme de Comparaison

```dart
// Calculer la distance euclidienne entre deux embeddings
double euclideanDistance(List<double> a, List<double> b) {
  double sum = 0;
  for (int i = 0; i < a.length; i++) {
    sum += pow(a[i] - b[i], 2);
  }
  return sqrt(sum);
}

// Trouver la meilleure correspondance
Future<String?> findBestMatch(
  List<double> faceEncoding,
  double threshold = 0.6,
) async {
  // Récupérer tous les encodages depuis la BD
  final allEncodings = await SupabaseConfig.client
      .from('facial_recognition_data')
      .select()
      .eq('is_active', true);

  String? bestMatchUserId;
  double bestDistance = double.infinity;

  for (var data in allEncodings) {
    final storedEncoding = // Convertir BYTEA en List<double>
    final distance = euclideanDistance(faceEncoding, storedEncoding);

    if (distance < bestDistance && distance < threshold) {
      bestDistance = distance;
      bestMatchUserId = data['user_id'];
    }
  }

  return bestMatchUserId;
}
```

---

## 🚀 Implémentation Progressive

### Phase 1: Capture Simple
1. Ajouter le bouton "Enregistrer mon visage" dans le profil
2. Implémenter la capture avec la caméra
3. Détecter le visage avec ML Kit
4. Afficher la confirmation

### Phase 2: Stockage
1. Extraire les embeddings avec TensorFlow Lite
2. Sauvegarder dans PostgreSQL
3. Gérer plusieurs visages par utilisateur

### Phase 3: Reconnaissance
1. Implémenter l'algorithme de comparaison
2. Optimiser les performances
3. Gérer les faux positifs/négatifs

### Phase 4: Check-in
1. Ajouter le bouton "Check-in Facial" aux événements
2. Scanner et identifier
3. Enregistrer la présence automatiquement

---

## 🔐 Sécurité et Confidentialité

### Bonnes Pratiques

✅ Demander le consentement explicite
✅ Chiffrer les encodages dans la base de données
✅ Permettre la suppression des données
✅ Respecter le RGPD
✅ Ne pas stocker les photos, seulement les embeddings
✅ Logs d'audit pour toutes les opérations

---

## 📚 Ressources

- **ML Kit**: https://developers.google.com/ml-kit/vision/face-detection
- **TensorFlow Lite**: https://www.tensorflow.org/lite
- **FaceNet Paper**: https://arxiv.org/abs/1503.03832
- **Face Recognition Best Practices**: https://github.com/ageitgey/face_recognition

---

## ⚠️ Limitations

- Nécessite une bonne luminosité
- Peut être affecté par les masques/lunettes
- Performances dépendent du modèle TensorFlow utilisé
- Nécessite l'autorisation de la caméra

---

## 🎯 Avantages

✅ Check-in rapide aux événements
✅ Réduction des fraudes de présence
✅ Expérience utilisateur moderne
✅ Statistiques précises de participation
✅ Gain de temps pour les organisateurs

---

**Note**: Cette fonctionnalité est **préparée** mais nécessite une implémentation supplémentaire pour être complètement fonctionnelle.

---

**Auteur**: CHRIS NGOZULU KASONGO (KalibanHall)
