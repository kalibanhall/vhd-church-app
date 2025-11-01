package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle de prière correspondant à la table `prayers` de PostgreSQL
 */
@JsonClass(generateAdapter = true)
data class Prayer(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "title")
    val title: String? = null,
    
    @Json(name = "content")
    val content: String,
    
    @Json(name = "isAnonymous")
    val isAnonymous: Boolean = false,
    
    @Json(name = "isPublic")
    val isPublic: Boolean = true,
    
    @Json(name = "prayerDate")
    val prayerDate: String,
    
    @Json(name = "status")
    val status: PrayerStatus,
    
    @Json(name = "prayerCount")
    val prayerCount: Int = 0,
    
    @Json(name = "answeredDate")
    val answeredDate: String? = null,
    
    @Json(name = "answeredTestimony")
    val answeredTestimony: String? = null,
    
    @Json(name = "createdAt")
    val createdAt: String? = null,
    
    @Json(name = "updatedAt")
    val updatedAt: String? = null
)

enum class PrayerStatus {
    @Json(name = "active")
    ACTIVE,
    
    @Json(name = "answered")
    ANSWERED,
    
    @Json(name = "archived")
    ARCHIVED
}

/**
 * Support de prière (personne qui prie pour une demande)
 */
@JsonClass(generateAdapter = true)
data class PrayerSupport(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "prayerId")
    val prayerId: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "supportedAt")
    val supportedAt: String,
    
    @Json(name = "notes")
    val notes: String? = null
)
