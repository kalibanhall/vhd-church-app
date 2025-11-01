package com.mychurchapp.data.api

import com.mychurchapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour la gestion des événements
 */
interface EventsApiService {
    
    @GET("events")
    suspend fun getEvents(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("type") type: String? = null,
        @Query("status") status: String? = null,
        @Query("startDate") startDate: String? = null,
        @Query("endDate") endDate: String? = null
    ): Response<PaginatedResponse<Event>>
    
    @GET("events/{id}")
    suspend fun getEventById(@Path("id") id: String): Response<ApiResponse<Event>>
    
    @POST("events")
    suspend fun createEvent(@Body event: Event): Response<ApiResponse<Event>>
    
    @PUT("events/{id}")
    suspend fun updateEvent(
        @Path("id") id: String,
        @Body event: Event
    ): Response<ApiResponse<Event>>
    
    @DELETE("events/{id}")
    suspend fun deleteEvent(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("events/{id}/attend")
    suspend fun registerAttendance(
        @Path("id") id: String,
        @Body attendance: Attendance
    ): Response<ApiResponse<Attendance>>
    
    @GET("events/{id}/attendees")
    suspend fun getEventAttendees(@Path("id") id: String): Response<ApiResponse<List<User>>>
    
    @GET("events/upcoming")
    suspend fun getUpcomingEvents(
        @Query("limit") limit: Int = 10
    ): Response<ApiResponse<List<Event>>>
}
