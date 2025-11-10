package com.mychurchapp.data.api

import com.mychurchapp.data.models.CreateAppointmentRequest

import com.mychurchapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour la gestion des rendez-vous
 */
interface AppointmentsApiService {
    
    @GET("appointments")
    suspend fun getAppointments(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("userId") userId: String? = null,
        @Query("pastorId") pastorId: String? = null,
        @Query("status") status: String? = null
    ): Response<PaginatedResponse<Appointment>>
    
    @GET("appointments/{id}")
    suspend fun getAppointmentById(@Path("id") id: String): Response<ApiResponse<Appointment>>
    
    @POST("appointments")
    suspend fun createAppointment(@Body request: CreateAppointmentRequest): Response<ApiResponse<Appointment>>
    
    @PUT("appointments/{id}")
    suspend fun updateAppointment(
        @Path("id") id: String,
        @Body appointment: Appointment
    ): Response<ApiResponse<Appointment>>
    
    @DELETE("appointments/{id}")
    suspend fun cancelAppointment(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("appointments/{id}/confirm")
    suspend fun confirmAppointment(@Path("id") id: String): Response<ApiResponse<Appointment>>
    
    @POST("appointments/{id}/complete")
    suspend fun completeAppointment(@Path("id") id: String): Response<ApiResponse<Appointment>>
    
    @GET("pastor/appointments")
    suspend fun getPastorAppointments(): Response<ApiResponse<List<Appointment>>>
    
    @GET("pastor/availability")
    suspend fun getPastorAvailability(
        @Query("pastorId") pastorId: String,
        @Query("date") date: String
    ): Response<ApiResponse<List<String>>>
}
