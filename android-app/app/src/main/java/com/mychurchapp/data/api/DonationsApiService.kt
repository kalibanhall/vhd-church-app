package com.mychurchapp.data.api

import com.mychurchapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour la gestion des dons et finances
 */
interface DonationsApiService {
    
    @GET("donations")
    suspend fun getDonations(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("userId") userId: String? = null,
        @Query("type") type: String? = null,
        @Query("startDate") startDate: String? = null,
        @Query("endDate") endDate: String? = null
    ): Response<PaginatedResponse<Donation>>
    
    @GET("donations/{id}")
    suspend fun getDonationById(@Path("id") id: String): Response<ApiResponse<Donation>>
    
    @POST("donations")
    suspend fun createDonation(@Body request: CreateDonationRequest): Response<ApiResponse<Donation>>
    
    @GET("donations/stats")
    suspend fun getDonationStats(
        @Query("period") period: String? = "month"
    ): Response<ApiResponse<FinancialReport>>
    
    @GET("donations/projects")
    suspend fun getProjects(
        @Query("status") status: String? = null
    ): Response<ApiResponse<List<DonationProject>>>
    
    @GET("donations/projects/{id}")
    suspend fun getProjectById(@Path("id") id: String): Response<ApiResponse<DonationProject>>
    
    @POST("donations/projects")
    suspend fun createProject(@Body project: DonationProject): Response<ApiResponse<DonationProject>>
    
    @GET("donations/receipt/{id}")
    suspend fun downloadReceipt(@Path("id") id: String): Response<ApiResponse<ByteArray>>
}
