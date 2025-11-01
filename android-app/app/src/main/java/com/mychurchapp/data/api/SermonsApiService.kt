package com.mychurchapp.data.api

import com.mychurchapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour la gestion des prédications/sermons
 */
interface SermonsApiService {
    
    @GET("sermons")
    suspend fun getSermons(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("type") type: String? = null,
        @Query("preacherId") preacherId: String? = null,
        @Query("search") search: String? = null
    ): Response<PaginatedResponse<Sermon>>
    
    @GET("sermons/{id}")
    suspend fun getSermonById(@Path("id") id: String): Response<ApiResponse<Sermon>>
    
    @POST("sermons")
    suspend fun createSermon(@Body sermon: Sermon): Response<ApiResponse<Sermon>>
    
    @PUT("sermons/{id}")
    suspend fun updateSermon(
        @Path("id") id: String,
        @Body sermon: Sermon
    ): Response<ApiResponse<Sermon>>
    
    @DELETE("sermons/{id}")
    suspend fun deleteSermon(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("sermons/{id}/view")
    suspend fun incrementViewCount(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("sermons/{id}/download")
    suspend fun incrementDownloadCount(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @GET("sermons/recent")
    suspend fun getRecentSermons(
        @Query("limit") limit: Int = 10
    ): Response<ApiResponse<List<Sermon>>>
    
    @GET("sermons/popular")
    suspend fun getPopularSermons(
        @Query("limit") limit: Int = 10
    ): Response<ApiResponse<List<Sermon>>>
}
