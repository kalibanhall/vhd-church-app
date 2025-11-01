package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle de prédication/sermon correspondant à la table `sermons` de PostgreSQL
 */
@JsonClass(generateAdapter = true)
data class Sermon(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "title")
    val title: String,
    
    @Json(name = "preacherId")
    val preacherId: String,
    
    @Json(name = "preacherName")
    val preacherName: String,
    
    @Json(name = "eventId")
    val eventId: String? = null,
    
    @Json(name = "sermonDate")
    val sermonDate: String,
    
    @Json(name = "sermonType")
    val sermonType: SermonType,
    
    @Json(name = "durationMinutes")
    val durationMinutes: Int? = null,
    
    @Json(name = "audioUrl")
    val audioUrl: String? = null,
    
    @Json(name = "videoUrl")
    val videoUrl: String? = null,
    
    @Json(name = "thumbnailUrl")
    val thumbnailUrl: String? = null,
    
    @Json(name = "description")
    val description: String? = null,
    
    @Json(name = "bibleVerses")
    val bibleVerses: String? = null,
    
    @Json(name = "sermonNotes")
    val sermonNotes: String? = null,
    
    @Json(name = "downloadCount")
    val downloadCount: Int = 0,
    
    @Json(name = "viewCount")
    val viewCount: Int = 0,
    
    @Json(name = "isPublished")
    val isPublished: Boolean = false,
    
    @Json(name = "createdAt")
    val createdAt: String? = null,
    
    @Json(name = "updatedAt")
    val updatedAt: String? = null
) {
    val mediaUrl: String?
        get() = when (sermonType) {
            SermonType.AUDIO -> audioUrl
            SermonType.VIDEO -> videoUrl
            SermonType.TEXT -> null
        }
}

enum class SermonType {
    @Json(name = "audio")
    AUDIO,
    
    @Json(name = "video")
    VIDEO,
    
    @Json(name = "text")
    TEXT
}
