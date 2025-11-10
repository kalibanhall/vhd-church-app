package com.mychurchapp.data.api

import com.mychurchapp.data.models.CreateTestimonyRequest

import com.mychurchapp.data.models.CreatePrayerRequest

import com.mychurchapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour la gestion des prières et témoignages
 */
interface PrayersApiService {
    
    @GET("prayers")
    suspend fun getPrayers(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null,
        @Query("isPublic") isPublic: Boolean? = true
    ): Response<PaginatedResponse<Prayer>>
    
    @GET("prayers/{id}")
    suspend fun getPrayerById(@Path("id") id: String): Response<ApiResponse<Prayer>>
    
    @POST("prayers")
    suspend fun createPrayer(@Body request: CreatePrayerRequest): Response<ApiResponse<Prayer>>
    
    @PUT("prayers/{id}")
    suspend fun updatePrayer(
        @Path("id") id: String,
        @Body prayer: Prayer
    ): Response<ApiResponse<Prayer>>
    
    @DELETE("prayers/{id}")
    suspend fun deletePrayer(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("prayers/{id}/support")
    suspend fun supportPrayer(@Path("id") id: String): Response<ApiResponse<PrayerSupport>>
    
    @POST("prayers/{id}/answer")
    suspend fun markAsAnswered(
        @Path("id") id: String,
        @Body testimony: String
    ): Response<ApiResponse<Prayer>>
    
    @GET("prayers/my")
    suspend fun getMyPrayers(): Response<ApiResponse<List<Prayer>>>
}

/**
 * Interface API pour les témoignages
 */
interface TestimoniesApiService {
    
    @GET("testimonies")
    suspend fun getTestimonies(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = "approved"
    ): Response<PaginatedResponse<Testimony>>
    
    @GET("testimonies/{id}")
    suspend fun getTestimonyById(@Path("id") id: String): Response<ApiResponse<Testimony>>
    
    @POST("testimonies")
    suspend fun createTestimony(@Body request: CreateTestimonyRequest): Response<ApiResponse<Testimony>>
    
    @PUT("testimonies/{id}")
    suspend fun updateTestimony(
        @Path("id") id: String,
        @Body testimony: Testimony
    ): Response<ApiResponse<Testimony>>
    
    @DELETE("testimonies/{id}")
    suspend fun deleteTestimony(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("testimonies/{id}/like")
    suspend fun likeTestimony(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @DELETE("testimonies/{id}/like")
    suspend fun unlikeTestimony(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("testimonies/{id}/comment")
    suspend fun addComment(
        @Path("id") id: String,
        @Body comment: String
    ): Response<ApiResponse<TestimonyComment>>
    
    @GET("testimonies/{id}/comments")
    suspend fun getComments(@Path("id") id: String): Response<ApiResponse<List<TestimonyComment>>>
    
    @GET("testimonies/pending")
    suspend fun getPendingTestimonies(): Response<ApiResponse<List<Testimony>>>
    
    @POST("testimonies/{id}/approve")
    suspend fun approveTestimony(@Path("id") id: String): Response<ApiResponse<Testimony>>
    
    @POST("testimonies/{id}/reject")
    suspend fun rejectTestimony(
        @Path("id") id: String,
        @Body reason: String
    ): Response<ApiResponse<Testimony>>
}
