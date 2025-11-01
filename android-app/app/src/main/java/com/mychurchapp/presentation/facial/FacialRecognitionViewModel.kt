package com.mychurchapp.presentation.facial

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.mychurchapp.data.repository.FacialRecognitionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

@HiltViewModel
class FacialRecognitionViewModel @Inject constructor(
    private val repository: FacialRecognitionRepository
) : ViewModel() {

    // États UI
    private val _uiState = MutableStateFlow(FacialRecognitionUiState())
    val uiState: StateFlow<FacialRecognitionUiState> = _uiState.asStateFlow()

    // Détecteur ML Kit
    private val faceDetector = FaceDetection.getClient(
        FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
            .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .setMinFaceSize(0.15f)
            .enableTracking()
            .build()
    )

    /**
     * Détecte un visage dans une image
     */
    fun detectFace(bitmap: Bitmap) {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isProcessing = true) }

                val image = InputImage.fromBitmap(bitmap, 0)
                faceDetector.process(image)
                    .addOnSuccessListener { faces ->
                        if (faces.isNotEmpty()) {
                            val face = faces[0]
                            _uiState.update { 
                                it.copy(
                                    faceDetected = true,
                                    faceConfidence = face.trackingId?.toFloat() ?: 0.8f,
                                    statusMessage = "Visage détecté - Appuyez pour vérifier"
                                )
                            }
                        } else {
                            _uiState.update { 
                                it.copy(
                                    faceDetected = false,
                                    statusMessage = "Aucun visage détecté"
                                )
                            }
                        }
                    }
                    .addOnFailureListener { e ->
                        Timber.e(e, "Erreur détection visage")
                        _uiState.update { 
                            it.copy(
                                faceDetected = false,
                                errorMessage = "Erreur détection: ${e.message}",
                                statusMessage = "Erreur détection"
                            )
                        }
                    }
                    .addOnCompleteListener {
                        _uiState.update { it.copy(isProcessing = false) }
                    }
            } catch (e: Exception) {
                Timber.e(e, "Erreur process detectFace")
                _uiState.update { 
                    it.copy(
                        isProcessing = false,
                        errorMessage = "Erreur: ${e.message}"
                    )
                }
            }
        }
    }

    /**
     * Vérifie un visage contre la base de données
     * Note: Nécessite TensorFlow Lite pour extraire le descripteur
     */
    fun verifyFace(
        descriptor: List<Float>,
        sessionId: String? = null,
        bitmap: Bitmap
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isProcessing = true, statusMessage = "Vérification...") }

            repository.verifyFace(descriptor, sessionId)
                .collect { result ->
                    result.onSuccess { response ->
                        if (response.match != null && response.match.confidence >= 0.6f) {
                            // Visage reconnu
                            _uiState.update { 
                                it.copy(
                                    isProcessing = false,
                                    checkInResult = CheckInResult.Success(
                                        userName = response.match.user_name,
                                        confidence = response.match.confidence,
                                        photoUrl = null
                                    ),
                                    statusMessage = "✓ Reconnu: ${response.match.user_name}"
                                )
                            }
                            
                            // Auto check-in si session active
                            if (sessionId != null) {
                                performCheckIn(
                                    sessionId = sessionId,
                                    userId = response.match.user_id,
                                    confidenceScore = response.match.confidence,
                                    matchedDescriptorId = response.match.descriptor_id
                                )
                            }
                        } else {
                            // Visage non reconnu
                            _uiState.update { 
                                it.copy(
                                    isProcessing = false,
                                    checkInResult = CheckInResult.Failure("Visage non reconnu"),
                                    statusMessage = "✗ Visage non reconnu"
                                )
                            }
                        }
                    }.onFailure { error ->
                        Timber.e(error, "Erreur vérification")
                        _uiState.update { 
                            it.copy(
                                isProcessing = false,
                                errorMessage = error.message ?: "Erreur vérification",
                                checkInResult = CheckInResult.Failure(error.message ?: "Erreur"),
                                statusMessage = "✗ Erreur vérification"
                            )
                        }
                    }
                }
        }
    }

    /**
     * Enregistre le check-in
     */
    private fun performCheckIn(
        sessionId: String,
        userId: String,
        confidenceScore: Float,
        matchedDescriptorId: String? = null,
        photoUrl: String? = null
    ) {
        viewModelScope.launch {
            repository.checkIn(
                sessionId = sessionId,
                userId = userId,
                checkInMethod = "FACIAL_RECOGNITION",
                confidenceScore = confidenceScore,
                matchedDescriptorId = matchedDescriptorId,
                photoUrl = photoUrl,
                deviceInfo = mapOf(
                    "deviceModel" to android.os.Build.MODEL,
                    "androidVersion" to android.os.Build.VERSION.RELEASE
                )
            ).collect { result ->
                result.onSuccess { checkIn ->
                    Timber.d("Check-in réussi: ${checkIn.id}")
                    _uiState.update { 
                        it.copy(
                            statusMessage = "✓ Présence enregistrée"
                        )
                    }
                }.onFailure { error ->
                    Timber.e(error, "Erreur check-in")
                    // Ne pas écraser le succès de reconnaissance
                    if (_uiState.value.checkInResult is CheckInResult.Success) {
                        _uiState.update { 
                            it.copy(
                                statusMessage = "⚠ Reconnu mais erreur d'enregistrement"
                            )
                        }
                    }
                }
            }
        }
    }

    /**
     * Téléverse un descripteur pour un utilisateur
     */
    fun uploadDescriptor(
        userId: String,
        descriptor: List<Float>,
        photoUrl: String?,
        qualityScore: Float,
        isPrimary: Boolean = false
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isProcessing = true) }

            repository.uploadDescriptor(
                userId = userId,
                descriptor = descriptor,
                photoUrl = photoUrl,
                qualityScore = qualityScore,
                isPrimary = isPrimary
            ).collect { result ->
                result.onSuccess { faceDescriptor ->
                    Timber.d("Descripteur uploadé: ${faceDescriptor.id}")
                    _uiState.update { 
                        it.copy(
                            isProcessing = false,
                            statusMessage = "✓ Visage enregistré"
                        )
                    }
                }.onFailure { error ->
                    Timber.e(error, "Erreur upload descripteur")
                    _uiState.update { 
                        it.copy(
                            isProcessing = false,
                            errorMessage = error.message ?: "Erreur upload"
                        )
                    }
                }
            }
        }
    }

    /**
     * Réinitialise l'état
     */
    fun resetState() {
        _uiState.update { 
            FacialRecognitionUiState(
                statusMessage = "Positionnez votre visage"
            )
        }
    }

    /**
     * Efface l'erreur
     */
    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    override fun onCleared() {
        super.onCleared()
        faceDetector.close()
    }
}

/**
 * État UI pour la reconnaissance faciale
 */
data class FacialRecognitionUiState(
    val isProcessing: Boolean = false,
    val faceDetected: Boolean = false,
    val faceConfidence: Float = 0f,
    val statusMessage: String = "Positionnez votre visage",
    val errorMessage: String? = null,
    val checkInResult: CheckInResult? = null
)

/**
 * Résultat du check-in
 */
sealed class CheckInResult {
    data class Success(
        val userName: String,
        val confidence: Float,
        val photoUrl: String?
    ) : CheckInResult()

    data class Failure(
        val message: String
    ) : CheckInResult()
}
