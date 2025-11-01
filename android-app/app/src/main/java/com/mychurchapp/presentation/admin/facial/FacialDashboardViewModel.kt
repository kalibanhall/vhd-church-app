package com.mychurchapp.presentation.admin.facial

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.api.*
import com.mychurchapp.data.repository.FacialRecognitionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import timber.log.Timber
import java.time.LocalDate
import java.time.LocalTime
import javax.inject.Inject

@HiltViewModel
class FacialDashboardViewModel @Inject constructor(
    private val repository: FacialRecognitionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(FacialDashboardUiState())
    val uiState: StateFlow<FacialDashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    /**
     * Charge toutes les données du dashboard
     */
    fun loadDashboardData() {
        loadActiveSessions()
        loadStatistics()
        loadCameras()
    }

    /**
     * Charge les sessions actives
     */
    private fun loadActiveSessions() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            repository.getSessions(status = "ACTIVE", limit = 10)
                .collect { result ->
                    result.onSuccess { sessions ->
                        _uiState.update { 
                            it.copy(
                                activeSessions = sessions,
                                isLoading = false
                            )
                        }
                        
                        // Charge les check-ins récents pour chaque session
                        sessions.forEach { session ->
                            loadRecentCheckIns(session.id)
                        }
                    }.onFailure { error ->
                        Timber.e(error, "Erreur chargement sessions")
                        _uiState.update { 
                            it.copy(
                                isLoading = false,
                                errorMessage = error.message
                            )
                        }
                    }
                }
        }
    }

    /**
     * Charge les check-ins récents pour une session
     */
    private fun loadRecentCheckIns(sessionId: String) {
        viewModelScope.launch {
            repository.getCheckIns(sessionId)
                .collect { result ->
                    result.onSuccess { checkIns ->
                        _uiState.update { state ->
                            val updatedCheckIns = state.recentCheckIns.toMutableMap()
                            updatedCheckIns[sessionId] = checkIns.take(10)
                            state.copy(recentCheckIns = updatedCheckIns)
                        }
                    }.onFailure { error ->
                        Timber.e(error, "Erreur chargement check-ins: $sessionId")
                    }
                }
        }
    }

    /**
     * Charge les statistiques
     */
    private fun loadStatistics() {
        viewModelScope.launch {
            repository.getStats(period = 30)
                .collect { result ->
                    result.onSuccess { stats ->
                        _uiState.update { it.copy(statistics = stats) }
                    }.onFailure { error ->
                        Timber.e(error, "Erreur chargement statistiques")
                    }
                }
        }
    }

    /**
     * Charge les caméras
     */
    private fun loadCameras() {
        viewModelScope.launch {
            repository.getCameras(activeOnly = null)
                .collect { result ->
                    result.onSuccess { cameras ->
                        _uiState.update { it.copy(cameras = cameras) }
                    }.onFailure { error ->
                        Timber.e(error, "Erreur chargement caméras")
                    }
                }
        }
    }

    /**
     * Crée une nouvelle session
     */
    fun createSession(
        sessionName: String,
        sessionType: String,
        sessionDate: LocalDate,
        startTime: LocalTime,
        endTime: LocalTime?,
        location: String?,
        expectedAttendees: Int,
        createdBy: String,
        eventId: String? = null,
        notes: String? = null
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isCreatingSession = true) }

            repository.createSession(
                sessionName = sessionName,
                sessionType = sessionType,
                sessionDate = sessionDate.toString(),
                startTime = startTime.toString(),
                endTime = endTime?.toString(),
                location = location,
                expectedAttendees = expectedAttendees,
                faceRecognitionEnabled = true,
                qrCodeEnabled = true,
                createdBy = createdBy,
                eventId = eventId,
                notes = notes
            ).collect { result ->
                result.onSuccess { session ->
                    Timber.d("Session créée: ${session.id}")
                    _uiState.update { 
                        it.copy(
                            isCreatingSession = false,
                            showCreateDialog = false
                        )
                    }
                    // Recharge les sessions
                    loadActiveSessions()
                }.onFailure { error ->
                    Timber.e(error, "Erreur création session")
                    _uiState.update { 
                        it.copy(
                            isCreatingSession = false,
                            errorMessage = error.message
                        )
                    }
                }
            }
        }
    }

    /**
     * Arrête une session
     */
    fun stopSession(sessionId: String) {
        viewModelScope.launch {
            repository.updateSession(
                sessionId = sessionId,
                updates = mapOf(
                    "status" to "COMPLETED",
                    "end_time" to LocalTime.now().toString()
                )
            ).collect { result ->
                result.onSuccess { session ->
                    Timber.d("Session arrêtée: ${session.id}")
                    loadActiveSessions()
                }.onFailure { error ->
                    Timber.e(error, "Erreur arrêt session")
                    _uiState.update { 
                        it.copy(errorMessage = error.message)
                    }
                }
            }
        }
    }

    /**
     * Ping une caméra
     */
    fun pingCamera(cameraId: String) {
        viewModelScope.launch {
            repository.pingCamera(cameraId)
                .collect { result ->
                    result.onSuccess {
                        Timber.d("Caméra pingée: $cameraId")
                        loadCameras()
                    }.onFailure { error ->
                        Timber.e(error, "Erreur ping caméra")
                    }
                }
        }
    }

    /**
     * Crée une caméra
     */
    fun createCamera(
        cameraName: String,
        cameraLocation: String?,
        cameraType: String,
        deviceId: String?,
        assignedTo: String?
    ) {
        viewModelScope.launch {
            repository.createCamera(
                cameraName = cameraName,
                cameraLocation = cameraLocation,
                cameraType = cameraType,
                deviceId = deviceId,
                assignedTo = assignedTo
            ).collect { result ->
                result.onSuccess { camera ->
                    Timber.d("Caméra créée: ${camera.id}")
                    loadCameras()
                }.onFailure { error ->
                    Timber.e(error, "Erreur création caméra")
                    _uiState.update { 
                        it.copy(errorMessage = error.message)
                    }
                }
            }
        }
    }

    /**
     * Supprime une caméra
     */
    fun deleteCamera(cameraId: String) {
        viewModelScope.launch {
            repository.deleteCamera(cameraId)
                .collect { result ->
                    result.onSuccess {
                        Timber.d("Caméra supprimée: $cameraId")
                        loadCameras()
                    }.onFailure { error ->
                        Timber.e(error, "Erreur suppression caméra")
                        _uiState.update { 
                            it.copy(errorMessage = error.message)
                        }
                    }
                }
        }
    }

    /**
     * Affiche/cache le dialogue de création
     */
    fun setShowCreateDialog(show: Boolean) {
        _uiState.update { it.copy(showCreateDialog = show) }
    }

    /**
     * Rafraîchit les données
     */
    fun refresh() {
        loadDashboardData()
    }

    /**
     * Efface l'erreur
     */
    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}

/**
 * État UI pour le dashboard
 */
data class FacialDashboardUiState(
    val isLoading: Boolean = false,
    val isCreatingSession: Boolean = false,
    val activeSessions: List<AttendanceSessionDto> = emptyList(),
    val recentCheckIns: Map<String, List<CheckInDto>> = emptyMap(),
    val statistics: StatsData? = null,
    val cameras: List<CameraDto> = emptyList(),
    val showCreateDialog: Boolean = false,
    val errorMessage: String? = null
)
