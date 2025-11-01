package com.mychurchapp.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.RectF
import com.google.mlkit.vision.face.Face
import org.tensorflow.lite.Interpreter
import timber.log.Timber
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import kotlin.math.sqrt

/**
 * Extracteur de descripteurs de visages avec TensorFlow Lite
 * Utilise un modèle FaceNet pour générer des embeddings de 128 valeurs
 */
class FaceDescriptorExtractor(context: Context) {

    private var interpreter: Interpreter? = null
    private val inputSize = 160 // Taille d'entrée du modèle FaceNet (160x160)
    private val outputSize = 128 // Taille du vecteur d'embedding

    init {
        try {
            // Charge le modèle TensorFlow Lite depuis les assets
            val model = loadModelFile(context, "facenet.tflite")
            val options = Interpreter.Options().apply {
                setNumThreads(4) // Utilise 4 threads pour de meilleures performances
            }
            interpreter = Interpreter(model, options)
            Timber.d("Modèle FaceNet chargé avec succès")
        } catch (e: Exception) {
            Timber.e(e, "Erreur chargement modèle FaceNet")
        }
    }

    /**
     * Extrait le descripteur d'un visage détecté
     * @param bitmap Image complète
     * @param face Visage détecté par ML Kit
     * @return Liste de 128 valeurs float (normalized) ou null si erreur
     */
    fun extractDescriptor(bitmap: Bitmap, face: Face): List<Float>? {
        return try {
            // 1. Découpe le visage de l'image
            val faceBitmap = cropFace(bitmap, face.boundingBox)

            // 2. Redimensionne à 160x160
            val resizedBitmap = Bitmap.createScaledBitmap(
                faceBitmap, 
                inputSize, 
                inputSize, 
                true
            )

            // 3. Convertit en ByteBuffer
            val inputBuffer = bitmapToByteBuffer(resizedBitmap)

            // 4. Exécute l'inférence
            val outputArray = Array(1) { FloatArray(outputSize) }
            interpreter?.run(inputBuffer, outputArray)

            // 5. Normalise le vecteur (L2 normalization)
            val descriptor = outputArray[0].toList()
            normalize(descriptor)
        } catch (e: Exception) {
            Timber.e(e, "Erreur extraction descripteur")
            null
        }
    }

    /**
     * Découpe le visage de l'image complète
     */
    private fun cropFace(bitmap: Bitmap, boundingBox: android.graphics.Rect): Bitmap {
        // Agrandit légèrement la zone (10% de marge)
        val margin = 0.1f
        val width = boundingBox.width()
        val height = boundingBox.height()
        
        val left = (boundingBox.left - width * margin).toInt().coerceAtLeast(0)
        val top = (boundingBox.top - height * margin).toInt().coerceAtLeast(0)
        val right = (boundingBox.right + width * margin).toInt().coerceAtMost(bitmap.width)
        val bottom = (boundingBox.bottom + height * margin).toInt().coerceAtMost(bitmap.height)
        
        val cropWidth = right - left
        val cropHeight = bottom - top
        
        return Bitmap.createBitmap(bitmap, left, top, cropWidth, cropHeight)
    }

    /**
     * Convertit un bitmap en ByteBuffer pour TensorFlow Lite
     */
    private fun bitmapToByteBuffer(bitmap: Bitmap): ByteBuffer {
        val byteBuffer = ByteBuffer.allocateDirect(4 * inputSize * inputSize * 3)
        byteBuffer.order(ByteOrder.nativeOrder())

        val intValues = IntArray(inputSize * inputSize)
        bitmap.getPixels(intValues, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)

        var pixel = 0
        for (i in 0 until inputSize) {
            for (j in 0 until inputSize) {
                val value = intValues[pixel++]
                
                // Normalise les valeurs RGB entre -1 et 1 (selon FaceNet)
                byteBuffer.putFloat(((value shr 16 and 0xFF) - 127.5f) / 127.5f) // R
                byteBuffer.putFloat(((value shr 8 and 0xFF) - 127.5f) / 127.5f)  // G
                byteBuffer.putFloat(((value and 0xFF) - 127.5f) / 127.5f)        // B
            }
        }

        return byteBuffer
    }

    /**
     * Normalise un vecteur avec la norme L2
     * Nécessaire pour des comparaisons cohérentes
     */
    private fun normalize(descriptor: List<Float>): List<Float> {
        val norm = sqrt(descriptor.sumOf { (it * it).toDouble() }).toFloat()
        return if (norm > 0f) {
            descriptor.map { it / norm }
        } else {
            descriptor
        }
    }

    /**
     * Calcule la qualité d'un descripteur
     * Score basé sur la variance des valeurs (plus de variance = meilleure qualité)
     */
    fun calculateQuality(descriptor: List<Float>): Float {
        if (descriptor.isEmpty()) return 0f
        
        val mean = descriptor.average().toFloat()
        val variance = descriptor.map { (it - mean) * (it - mean) }.average().toFloat()
        
        // Normalise entre 0 et 1
        return (variance * 10f).coerceIn(0f, 1f)
    }

    /**
     * Charge le modèle TensorFlow Lite depuis les assets
     */
    private fun loadModelFile(context: Context, modelName: String): MappedByteBuffer {
        val fileDescriptor = context.assets.openFd(modelName)
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = fileDescriptor.startOffset
        val declaredLength = fileDescriptor.declaredLength
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
    }

    /**
     * Libère les ressources
     */
    fun close() {
        interpreter?.close()
        interpreter = null
    }
}

/**
 * Extension pour calculer la distance euclidienne entre deux descripteurs
 */
fun euclideanDistance(descriptor1: List<Float>, descriptor2: List<Float>): Float {
    if (descriptor1.size != descriptor2.size || descriptor1.size != 128) {
        throw IllegalArgumentException("Les descripteurs doivent avoir 128 valeurs")
    }
    
    var sum = 0.0
    for (i in descriptor1.indices) {
        val diff = descriptor1[i] - descriptor2[i]
        sum += diff * diff
    }
    
    return sqrt(sum).toFloat()
}

/**
 * Extension pour calculer la similarité (1 - distance normalisée)
 * Retourne un score entre 0 et 1 (1 = identique)
 */
fun calculateSimilarity(descriptor1: List<Float>, descriptor2: List<Float>): Float {
    val distance = euclideanDistance(descriptor1, descriptor2)
    // Distance max théorique pour des vecteurs normalisés L2 est ~2
    return (1f - (distance / 2f)).coerceIn(0f, 1f)
}
