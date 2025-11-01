package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle de témoignage correspondant à la table `testimonies` de PostgreSQL
 */
@JsonClass(generateAdapter = true)
data class Testimony(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "title")
    val title: String,
    
    @Json(name = "content")
    val content: String,
    
    @Json(name = "isAnonymous")
    val isAnonymous: Boolean = false,
    
    @Json(name = "testimonyDate")
    val testimonyDate: String,
    
    @Json(name = "status")
    val status: TestimonyStatus,
    
    @Json(name = "likeCount")
    val likeCount: Int = 0,
    
    @Json(name = "viewCount")
    val viewCount: Int = 0,
    
    @Json(name = "rejectionReason")
    val rejectionReason: String? = null,
    
    @Json(name = "reviewedBy")
    val reviewedBy: String? = null,
    
    @Json(name = "reviewedAt")
    val reviewedAt: String? = null,
    
    @Json(name = "comments")
    val comments: List<TestimonyComment>? = null,
    
    @Json(name = "createdAt")
    val createdAt: String? = null,
    
    @Json(name = "updatedAt")
    val updatedAt: String? = null
)

enum class TestimonyStatus {
    @Json(name = "pending")
    PENDING,
    
    @Json(name = "approved")
    APPROVED,
    
    @Json(name = "rejected")
    REJECTED
}

/**
 * Commentaire sur un témoignage
 */
@JsonClass(generateAdapter = true)
data class TestimonyComment(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "testimonyId")
    val testimonyId: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "content")
    val content: String,
    
    @Json(name = "isApproved")
    val isApproved: Boolean = false,
    
    @Json(name = "createdAt")
    val createdAt: String,
    
    @Json(name = "updatedAt")
    val updatedAt: String? = null
)

/**
 * Like sur un témoignage
 */
@JsonClass(generateAdapter = true)
data class TestimonyLike(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "testimonyId")
    val testimonyId: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "createdAt")
    val createdAt: String
)
