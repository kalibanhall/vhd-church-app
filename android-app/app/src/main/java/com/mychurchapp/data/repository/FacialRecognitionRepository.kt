package com.mychurchapp.data.repository

import com.mychurchapp.data.api.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FacialRecognitionRepository @Inject constructor(
    private val api: FacialRecognitionApi
) {
    
    // ========== DESCRIPTEURS ===========
    
    fun uploadDescriptor(
        userId: String,
        descriptor: List<Float>,
        photoUrl: String? = null,
        qualityScore: Float? = null,
        isPrimary: Boolean = false
    ): Flow<Result<FaceDescriptor>> = flow {
        try {
            val response = api.uploadDescriptor(
                UploadDescriptorRequest(
                    userId = userId,
                    descriptor = descriptor,
                    photoUrl = photoUrl,
                    qualityScore = qualityScore,
                    isPrimary = isPrimary
                )
            )
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.descriptor))
            } else {
                emit(Result.failure(Exception("Erreur upload: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur uploadDescriptor")
            emit(Result.failure(e))
        }
    }
    
    fun getDescriptors(userId: String): Flow<Result<List<FaceDescriptor>>> = flow {
        try {
            val response = api.getDescriptors(userId)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.descriptors))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur getDescriptors")
            emit(Result.failure(e))
        }
    }
    
    fun deleteDescriptor(descriptorId: String): Flow<Result<Boolean>> = flow {
        try {
            val response = api.deleteDescriptor(descriptorId)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(true))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur deleteDescriptor")
            emit(Result.failure(e))
        }
    }
    
    // ========== VÉRIFICATION ===========
    
    fun verifyFace(
        descriptor: List<Float>,
        sessionId: String? = null
    ): Flow<Result<VerifyFaceResponse>> = flow {
        try {
            val response = api.verifyFace(
                VerifyFaceRequest(
                    descriptor = descriptor,
                    sessionId = sessionId
                )
            )
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!))
            } else {
                emit(Result.failure(Exception("Erreur vérification: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur verifyFace")
            emit(Result.failure(e))
        }
    }
    
    // ========== SESSIONS ===========
    
    fun getSessions(
        status: String? = null,
        limit: Int = 50,
        offset: Int = 0
    ): Flow<Result<List<AttendanceSessionDto>>> = flow {
        try {
            val response = api.getSessions(status, limit, offset)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.sessions))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur getSessions")
            emit(Result.failure(e))
        }
    }
    
    fun createSession(
        sessionName: String,
        sessionType: String,
        sessionDate: String,
        startTime: String,
        createdBy: String,
        eventId: String? = null,
        endTime: String? = null,
        location: String? = null,
        expectedAttendees: Int = 0,
        faceRecognitionEnabled: Boolean = true,
        qrCodeEnabled: Boolean = true,
        notes: String? = null
    ): Flow<Result<AttendanceSessionDto>> = flow {
        try {
            val response = api.createSession(
                CreateSessionRequest(
                    eventId = eventId,
                    sessionName = sessionName,
                    sessionType = sessionType,
                    sessionDate = sessionDate,
                    startTime = startTime,
                    endTime = endTime,
                    location = location,
                    expectedAttendees = expectedAttendees,
                    faceRecognitionEnabled = faceRecognitionEnabled,
                    qrCodeEnabled = qrCodeEnabled,
                    createdBy = createdBy,
                    notes = notes
                )
            )
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.session))
            } else {
                emit(Result.failure(Exception("Erreur création: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur createSession")
            emit(Result.failure(e))
        }
    }
    
    fun updateSession(
        sessionId: String,
        updates: Map<String, Any>
    ): Flow<Result<AttendanceSessionDto>> = flow {
        try {
            val response = api.updateSession(sessionId, updates)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.session))
            } else {
                emit(Result.failure(Exception("Erreur mise à jour: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur updateSession")
            emit(Result.failure(e))
        }
    }
    
    // ========== CHECK-IN ===========
    
    fun checkIn(
        sessionId: String,
        userId: String,
        checkInMethod: String,
        confidenceScore: Float? = null,
        photoUrl: String? = null,
        matchedDescriptorId: String? = null,
        cameraId: String? = null,
        deviceInfo: Map<String, String>? = null,
        locationData: Map<String, Double>? = null
    ): Flow<Result<CheckInDto>> = flow {
        try {
            val response = api.checkIn(
                CheckInRequest(
                    sessionId = sessionId,
                    userId = userId,
                    checkInMethod = checkInMethod,
                    confidenceScore = confidenceScore,
                    photoUrl = photoUrl,
                    matchedDescriptorId = matchedDescriptorId,
                    cameraId = cameraId,
                    deviceInfo = deviceInfo,
                    locationData = locationData
                )
            )
            
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()!!.checkIn?.let {
                    emit(Result.success(it))
                } ?: emit(Result.failure(Exception("Check-in null")))
            } else {
                val errorBody = response.errorBody()?.string()
                emit(Result.failure(Exception(errorBody ?: "Erreur check-in")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur checkIn")
            emit(Result.failure(e))
        }
    }
    
    fun getCheckIns(sessionId: String): Flow<Result<List<CheckInDto>>> = flow {
        try {
            val response = api.getCheckIns(sessionId)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.checkIns))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur getCheckIns")
            emit(Result.failure(e))
        }
    }
    
    // ========== STATISTIQUES ===========
    
    fun getStats(period: Int = 30): Flow<Result<StatsData>> = flow {
        try {
            val response = api.getStats(period)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.stats))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur getStats")
            emit(Result.failure(e))
        }
    }
    
    fun getMemberStats(userId: String): Flow<Result<Pair<MemberStats, List<AttendanceHistory>>>> = flow {
        try {
            val response = api.getMemberStats(userId)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                emit(Result.success(Pair(body.stats, body.history)))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur getMemberStats")
            emit(Result.failure(e))
        }
    }
    
    // ========== CAMÉRAS ===========
    
    fun getCameras(activeOnly: Boolean? = null): Flow<Result<List<CameraDto>>> = flow {
        try {
            val response = api.getCameras(activeOnly)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.cameras))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur getCameras")
            emit(Result.failure(e))
        }
    }
    
    fun createCamera(
        cameraName: String,
        cameraLocation: String? = null,
        cameraType: String = "MOBILE",
        deviceId: String? = null,
        ipAddress: String? = null,
        settings: Map<String, Any>? = null,
        assignedTo: String? = null,
        notes: String? = null
    ): Flow<Result<CameraDto>> = flow {
        try {
            val response = api.createCamera(
                CreateCameraRequest(
                    cameraName = cameraName,
                    cameraLocation = cameraLocation,
                    cameraType = cameraType,
                    deviceId = deviceId,
                    ipAddress = ipAddress,
                    settings = settings,
                    assignedTo = assignedTo,
                    notes = notes
                )
            )
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(response.body()!!.camera))
            } else {
                emit(Result.failure(Exception("Erreur création: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur createCamera")
            emit(Result.failure(e))
        }
    }
    
    fun pingCamera(cameraId: String): Flow<Result<Boolean>> = flow {
        try {
            val response = api.pingCamera(cameraId)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(true))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur pingCamera")
            emit(Result.failure(e))
        }
    }
    
    fun deleteCamera(cameraId: String): Flow<Result<Boolean>> = flow {
        try {
            val response = api.deleteCamera(cameraId)
            
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.success(true))
            } else {
                emit(Result.failure(Exception("Erreur: ${response.message()}")))
            }
        } catch (e: Exception) {
            Timber.e(e, "Erreur deleteCamera")
            emit(Result.failure(e))
        }
    }
}
