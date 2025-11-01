# Reconnaissance Faciale - Setup TensorFlow Lite

## Modèle FaceNet Requis

Pour que la reconnaissance faciale fonctionne, vous devez ajouter le modèle TensorFlow Lite FaceNet dans les assets de l'application.

### Téléchargement du Modèle

1. **Option 1: Modèle officiel FaceNet**
   - Téléchargez depuis: https://github.com/sirius-ai/MobileFaceNet_TF
   - Fichier: `MobileFaceNet.tflite` (renommez-le en `facenet.tflite`)

2. **Option 2: Modèle face-api.js compatible**
   - Téléchargez depuis: https://github.com/justadudewhohacks/face-api.js-models
   - Convertissez le modèle au format .tflite si nécessaire

3. **Option 3: Entraînez votre propre modèle**
   - Utilisez TensorFlow pour entraîner un modèle FaceNet
   - Exportez au format TensorFlow Lite
   - Assurez-vous que l'output est de 128 valeurs float

### Installation

1. Créez le dossier assets dans votre projet Android:
   ```
   android-app/app/src/main/assets/
   ```

2. Copiez le fichier `facenet.tflite` dans ce dossier:
   ```
   android-app/app/src/main/assets/facenet.tflite
   ```

3. Le modèle sera automatiquement inclus dans l'APK

### Spécifications du Modèle

Le modèle doit respecter ces caractéristiques:

- **Input**: Tensor de taille `[1, 160, 160, 3]`
  - 1 image à la fois
  - 160x160 pixels
  - 3 canaux RGB
  - Valeurs normalisées entre -1 et 1

- **Output**: Tensor de taille `[1, 128]`
  - 128 valeurs float
  - Vecteur d'embedding normalisé (L2 norm)

### Vérification

Pour vérifier que le modèle est correctement chargé:

1. Lancez l'application en mode debug
2. Consultez les logs Timber:
   ```
   D/FaceDescriptorExtractor: Modèle FaceNet chargé avec succès
   ```

3. Si erreur:
   ```
   E/FaceDescriptorExtractor: Erreur chargement modèle FaceNet
   ```
   - Vérifiez que le fichier `facenet.tflite` existe dans `app/src/main/assets/`
   - Vérifiez que le nom du fichier est exact (sensible à la casse)
   - Vérifiez que le modèle est au format TensorFlow Lite (.tflite)

### Performance

- **CPU**: ~50-100ms par extraction (selon l'appareil)
- **GPU**: ~20-50ms avec délégation GPU (nécessite GPU delegate)

Pour améliorer les performances, vous pouvez activer la délégation GPU:

```kotlin
val options = Interpreter.Options().apply {
    setNumThreads(4)
    addDelegate(GpuDelegate()) // Nécessite org.tensorflow:tensorflow-lite-gpu
}
```

### Taille du Modèle

- **FaceNet standard**: ~3-4 MB
- **MobileFaceNet**: ~1-2 MB (recommandé pour mobile)

### Alternative Sans Modèle

Si vous ne pouvez pas utiliser TensorFlow Lite, vous pouvez:

1. Envoyer l'image au backend Next.js
2. Utiliser `face-api.js` côté serveur pour extraire le descripteur
3. Retourner le descripteur au client Android

Modifiez `FacialRecognitionViewModel.kt`:

```kotlin
fun processFaceWithBackend(bitmap: Bitmap) {
    // Upload bitmap to /api/facial-recognition/extract-descriptor
    // Backend extrait le descripteur avec face-api.js
    // Retourne le descripteur de 128 valeurs
}
```

## Problèmes Fréquents

### Erreur: "Failed to create interpreter"
- Le fichier .tflite est corrompu ou incompatible
- Téléchargez à nouveau le modèle

### Erreur: "Input shape mismatch"
- Le modèle n'attend pas 160x160
- Vérifiez les spécifications de votre modèle
- Ajustez `inputSize` dans `FaceDescriptorExtractor.kt`

### Erreur: "Output shape mismatch"
- Le modèle ne produit pas 128 valeurs
- Vérifiez les spécifications de votre modèle
- Ajustez `outputSize` dans `FaceDescriptorExtractor.kt`

### Performance Lente
- Réduisez le nombre de threads: `setNumThreads(2)`
- Utilisez un modèle plus léger (MobileFaceNet)
- Activez la délégation GPU
- Réduisez la résolution de l'image d'entrée

## Ressources

- [TensorFlow Lite Guide](https://www.tensorflow.org/lite/guide)
- [Face Recognition Guide](https://www.tensorflow.org/lite/examples/face_recognition/overview)
- [FaceNet Paper](https://arxiv.org/abs/1503.03832)
- [MobileFaceNet GitHub](https://github.com/sirius-ai/MobileFaceNet_TF)
