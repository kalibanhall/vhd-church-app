package com.mychurchapp.data.api

import com.mychurchapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour les analytics et rapports
 */
interface AnalyticsApiService {
    
    @GET("dashboard/stats")
    suspend fun getDashboardStats(): Response<ApiResponse<AdminStats>>
    
    @GET("dashboard/analytics")
    suspend fun getAnalytics(
        @Query("period") period: String = "month"
    ): Response<ApiResponse<GrowthStats>>
    
    @GET("analytics/attendance")
    suspend fun getAttendanceReport(
        @Query("startDate") startDate: String,
        @Query("endDate") endDate: String
    ): Response<ApiResponse<List<AttendanceReport>>>
    
    @GET("analytics/financial")
    suspend fun getFinancialReport(
        @Query("period") period: String = "month"
    ): Response<ApiResponse<FinancialReport>>
    
    @GET("analytics/growth")
    suspend fun getGrowthReport(
        @Query("period") period: String = "year"
    ): Response<ApiResponse<List<ChartData>>>
    
    @GET("analytics/engagement")
    suspend fun getEngagementStats(): Response<ApiResponse<Map<String, Int>>>
}

/**
 * Interface API pour les notifications
 */
interface NotificationsApiService {
    
    @GET("notifications")
    suspend fun getNotifications(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("isRead") isRead: Boolean? = null
    ): Response<PaginatedResponse<Notification>>
    
    @GET("notifications/{id}")
    suspend fun getNotificationById(@Path("id") id: String): Response<ApiResponse<Notification>>
    
    @POST("notifications/{id}/read")
    suspend fun markAsRead(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("notifications/read-all")
    suspend fun markAllAsRead(): Response<ApiResponse<Unit>>
    
    @DELETE("notifications/{id}")
    suspend fun deleteNotification(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @GET("notifications/unread-count")
    suspend fun getUnreadCount(): Response<ApiResponse<Int>>
    
    @POST("notifications/fcm-token")
    suspend fun registerFcmToken(@Body token: String): Response<ApiResponse<Unit>>
}

/**
 * Interface API pour le profil utilisateur
 */
interface ProfileApiService {
    
    @GET("profile")
    suspend fun getProfile(): Response<ApiResponse<User>>
    
    @PUT("profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<ApiResponse<User>>
    
    @POST("profile/photo")
    suspend fun uploadPhoto(@Body photo: ByteArray): Response<ApiResponse<String>>
    
    @GET("profile/activity")
    suspend fun getActivity(): Response<ApiResponse<List<Any>>>
    
    @GET("profile/stats")
    suspend fun getStats(): Response<ApiResponse<Map<String, Int>>>
}
