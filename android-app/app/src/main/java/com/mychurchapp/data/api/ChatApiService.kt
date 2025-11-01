package com.mychurchapp.data.api

import com.mychurchapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour le chat et la messagerie
 */
interface ChatApiService {
    
    @GET("chat/channels")
    suspend fun getChannels(
        @Query("type") type: String? = null
    ): Response<ApiResponse<List<ChatChannel>>>
    
    @GET("chat/channels/{id}")
    suspend fun getChannelById(@Path("id") id: String): Response<ApiResponse<ChatChannel>>
    
    @POST("chat/channels")
    suspend fun createChannel(@Body channel: ChatChannel): Response<ApiResponse<ChatChannel>>
    
    @PUT("chat/channels/{id}")
    suspend fun updateChannel(
        @Path("id") id: String,
        @Body channel: ChatChannel
    ): Response<ApiResponse<ChatChannel>>
    
    @DELETE("chat/channels/{id}")
    suspend fun deleteChannel(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @GET("chat/channels/{id}/messages")
    suspend fun getMessages(
        @Path("id") id: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("before") before: String? = null
    ): Response<PaginatedResponse<ChatMessage>>
    
    @POST("chat/channels/{id}/messages")
    suspend fun sendMessage(
        @Path("id") id: String,
        @Body message: ChatMessage
    ): Response<ApiResponse<ChatMessage>>
    
    @PUT("chat/messages/{id}")
    suspend fun editMessage(
        @Path("id") id: String,
        @Body content: String
    ): Response<ApiResponse<ChatMessage>>
    
    @DELETE("chat/messages/{id}")
    suspend fun deleteMessage(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("chat/messages/{id}/react")
    suspend fun addReaction(
        @Path("id") id: String,
        @Body emoji: String
    ): Response<ApiResponse<ChatReaction>>
    
    @DELETE("chat/messages/{id}/react")
    suspend fun removeReaction(
        @Path("id") id: String,
        @Query("emoji") emoji: String
    ): Response<ApiResponse<Unit>>
    
    @POST("chat/channels/{id}/join")
    suspend fun joinChannel(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @POST("chat/channels/{id}/leave")
    suspend fun leaveChannel(@Path("id") id: String): Response<ApiResponse<Unit>>
    
    @GET("chat/users/status")
    suspend fun getUsersStatus(
        @Query("userIds") userIds: List<String>
    ): Response<ApiResponse<List<OnlineStatus>>>
    
    @POST("chat/status")
    suspend fun updateStatus(@Body status: String): Response<ApiResponse<Unit>>
}
