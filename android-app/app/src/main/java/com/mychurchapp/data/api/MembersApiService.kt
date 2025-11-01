package com.mychurchapp.data.api

import com.mychurchapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour la gestion des membres
 */
interface MembersApiService {
    
    @GET("members")
    suspend fun getMembers(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("status") status: String? = null,
        @Query("role") role: String? = null
    ): Response<PaginatedResponse<User>>
    
    @GET("members/{id}")
    suspend fun getMemberById(@Path("id") id: String): Response<ApiResponse<User>>
    
    @POST("members")
    suspend fun createMember(@Body user: User): Response<ApiResponse<User>>
    
    @PUT("members/{id}")
    suspend fun updateMember(
        @Path("id") id: String,
        @Body user: UpdateProfileRequest
    ): Response<ApiResponse<User>>
    
    @DELETE("members/{id}")
    suspend fun deleteMember(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @GET("members/{id}/attendance")
    suspend fun getMemberAttendance(@Path("id") id: String): Response<ApiResponse<List<Attendance>>>
    
    @GET("members/{id}/donations")
    suspend fun getMemberDonations(@Path("id") id: String): Response<ApiResponse<List<Donation>>>
    
    @GET("members/search")
    suspend fun searchMembers(@Query("q") query: String): Response<ApiResponse<List<User>>>
}
