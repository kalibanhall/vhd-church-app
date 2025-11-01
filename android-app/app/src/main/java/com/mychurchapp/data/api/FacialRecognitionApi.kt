package com.mychurchapp.data.api

import retrofit2.Response
import retrofit2.http.*

/**
 * API Service pour la reconnaissance faciale
 */
interface FacialRecognitionApi {
    
    // ========== DESCRIPTEURS ===========
    
    @POST("facial-recognition/descriptors")
    suspend fun uploadDescriptor(
        @Body request: UploadDescriptorRequest
    ): Response<UploadDescriptorResponse>
    
    @GET("facial-recognition/descriptors/{userId}")
    suspend fun getDescriptors(
        @Path("userId") userId: String
    ): Response<GetDescriptorsResponse>
    
    @DELETE("facial-recognition/descriptors/{descriptorId}")
    suspend fun deleteDescriptor(
        @Path("descriptorId") descriptorId: String
    ): Response<BaseResponse>
    
    // ========== VÉRIFICATION ===========
    
    @POST("facial-recognition/verify")
    suspend fun verifyFace(
        @Body request: VerifyFaceRequest
    ): Response<VerifyFaceResponse>
    
    // ========== SESSIONS ===========
    
    @GET("facial-recognition/sessions")
    suspend fun getSessions(
        @Query("status") status: String? = null,
        @Query("limit") limit: Int = 50,
        @Query("offset") offset: Int = 0
    ): Response<GetSessionsResponse>
    
    @POST("facial-recognition/sessions")
    suspend fun createSession(
        @Body request: CreateSessionRequest
    ): Response<CreateSessionResponse>
    
    @PATCH("facial-recognition/sessions/{sessionId}")
    suspend fun updateSession(
        @Path("sessionId") sessionId: String,
        @Body updates: Map<String, Any>
    ): Response<UpdateSessionResponse>
    
    // ========== CHECK-IN ===========
    
    @POST("facial-recognition/check-in")
    suspend fun checkIn(
        @Body request: CheckInRequest
    ): Response<CheckInResponse>
    
    @GET("facial-recognition/check-in/{sessionId}")
    suspend fun getCheckIns(
        @Path("sessionId") sessionId: String
    ): Response<GetCheckInsResponse>
    
    // ========== STATISTIQUES ===========
    
    @GET("facial-recognition/stats")
    suspend fun getStats(
        @Query("period") period: Int = 30
    ): Response<GetStatsResponse>
    
    @GET("facial-recognition/stats/member/{userId}")
    suspend fun getMemberStats(
        @Path("userId") userId: String
    ): Response<GetMemberStatsResponse>
    
    // ========== CAMÉRAS ===========
    
    @GET("facial-recognition/cameras")
    suspend fun getCameras(
        @Query("active") activeOnly: Boolean? = null
    ): Response<GetCamerasResponse>
    
    @POST("facial-recognition/cameras")
    suspend fun createCamera(
        @Body request: CreateCameraRequest
    ): Response<CreateCameraResponse>
    
    @PATCH("facial-recognition/cameras/{cameraId}/ping")
    suspend fun pingCamera(
        @Path("cameraId") cameraId: String
    ): Response<BaseResponse>
    
    @DELETE("facial-recognition/cameras/{cameraId}")
    suspend fun deleteCamera(
        @Path("cameraId") cameraId: String
    ): Response<BaseResponse>
}

// ========== REQUEST MODELS ===========

data class UploadDescriptorRequest(
    val userId: String,
    val descriptor: List<Float>,
    val photoUrl: String?,
    val qualityScore: Float?,
    val isPrimary: Boolean
)

data class VerifyFaceRequest(
    val descriptor: List<Float>,
    val sessionId: String?
)

data class CreateSessionRequest(
    val eventId: String?,
    val sessionName: String,
    val sessionType: String,
    val sessionDate: String,
    val startTime: String,
    val endTime: String?,
    val location: String?,
    val expectedAttendees: Int,
    val faceRecognitionEnabled: Boolean,
    val qrCodeEnabled: Boolean,
    val createdBy: String,
    val notes: String?
)

data class CheckInRequest(
    val sessionId: String,
    val userId: String,
    val checkInMethod: String, // FACIAL_RECOGNITION, QR_CODE, MANUAL
    val confidenceScore: Float?,
    val photoUrl: String?,
    val matchedDescriptorId: String?,
    val cameraId: String?,
    val deviceInfo: Map<String, String>?,
    val locationData: Map<String, Double>?
)

data class CreateCameraRequest(
    val cameraName: String,
    val cameraLocation: String?,
    val cameraType: String,
    val deviceId: String?,
    val ipAddress: String?,
    val settings: Map<String, Any>?,
    val assignedTo: String?,
    val notes: String?
)

// ========== RESPONSE MODELS ===========

data class BaseResponse(
    val success: Boolean,
    val message: String?
)

data class UploadDescriptorResponse(
    val success: Boolean,
    val descriptor: FaceDescriptor
)

data class GetDescriptorsResponse(
    val success: Boolean,
    val descriptors: List<FaceDescriptor>
)

data class VerifyFaceResponse(
    val success: Boolean,
    val match: Boolean,
    val user: UserMatch?,
    val confidence: Float?,
    val descriptorId: String?,
    val message: String?,
    val bestSimilarity: Float?
)

data class GetSessionsResponse(
    val success: Boolean,
    val sessions: List<AttendanceSessionDto>,
    val total: Int
)

data class CreateSessionResponse(
    val success: Boolean,
    val session: AttendanceSessionDto
)

data class UpdateSessionResponse(
    val success: Boolean,
    val session: AttendanceSessionDto
)

data class CheckInResponse(
    val success: Boolean,
    val checkIn: CheckInDto?,
    val error: String?
)

data class GetCheckInsResponse(
    val success: Boolean,
    val checkIns: List<CheckInDto>,
    val total: Int
)

data class GetStatsResponse(
    val success: Boolean,
    val stats: StatsData
)

data class GetMemberStatsResponse(
    val success: Boolean,
    val stats: MemberStats,
    val history: List<AttendanceHistory>
)

data class GetCamerasResponse(
    val success: Boolean,
    val cameras: List<CameraDto>
)

data class CreateCameraResponse(
    val success: Boolean,
    val camera: CameraDto
)

// ========== DATA MODELS ===========

data class FaceDescriptor(
    val id: String,
    val user_id: String,
    val descriptor: String, // JSON string
    val photo_url: String?,
    val quality_score: Float?,
    val is_primary: Boolean,
    val created_at: String,
    val updated_at: String
)

data class UserMatch(
    val id: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val profileImageUrl: String?
)

data class AttendanceSessionDto(
    val id: String,
    val event_id: String?,
    val session_name: String,
    val session_type: String,
    val session_date: String,
    val start_time: String,
    val end_time: String?,
    val status: String,
    val location: String?,
    val expected_attendees: Int,
    val actual_attendees: Int,
    val face_recognition_enabled: Boolean,
    val qr_code_enabled: Boolean,
    val created_by: String,
    val creator_name: String?,
    val notes: String?,
    val created_at: String,
    val updated_at: String,
    val completed_at: String?,
    val check_ins_count: Int?
)

data class CheckInDto(
    val id: String,
    val session_id: String,
    val user_id: String,
    val first_name: String?,
    val last_name: String?,
    val email: String?,
    val profile_image_url: String?,
    val check_in_time: String,
    val check_in_method: String,
    val confidence_score: Float?,
    val photo_url: String?,
    val matched_descriptor_id: String?,
    val camera_id: String?,
    val camera_name: String?,
    val camera_location: String?,
    val is_verified: Boolean
)

data class StatsData(
    val global: GlobalStats,
    val byMethod: List<MethodStats>,
    val topAttendees: List<TopAttendee>,
    val daily: List<DailyStats>
)

data class GlobalStats(
    val total_descriptors: Int,
    val users_with_descriptors: Int,
    val active_sessions: Int,
    val completed_sessions: Int,
    val recent_checkins: Int,
    val active_users: Int,
    val avg_confidence: Float?
)

data class MethodStats(
    val check_in_method: String,
    val count: Int,
    val avg_confidence: Float?
)

data class TopAttendee(
    val id: String,
    val first_name: String,
    val last_name: String,
    val profile_image_url: String?,
    val sessions_attended: Int,
    val last_attendance: String
)

data class DailyStats(
    val date: String,
    val total_checkins: Int,
    val unique_users: Int,
    val facial_checkins: Int
)

data class MemberStats(
    val user_id: String,
    val first_name: String,
    val last_name: String,
    val email: String,
    val total_sessions_attended: Int,
    val facial_checkins: Int,
    val qr_checkins: Int,
    val manual_checkins: Int,
    val avg_confidence_score: Float?,
    val last_attendance: String?,
    val last_30_days_attendance: Int
)

data class AttendanceHistory(
    val check_in_time: String,
    val check_in_method: String,
    val confidence_score: Float?,
    val session_name: String,
    val session_type: String,
    val session_date: String
)

data class CameraDto(
    val id: String,
    val camera_name: String,
    val camera_location: String?,
    val camera_type: String,
    val device_id: String?,
    val is_active: Boolean,
    val last_ping: String?,
    val ip_address: String?,
    val assigned_to: String?,
    val assigned_name: String?,
    val created_at: String,
    val updated_at: String
)
