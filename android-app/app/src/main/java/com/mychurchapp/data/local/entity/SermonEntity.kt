package com.mychurchapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sermons")
data class SermonEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val description: String?,
    val pastorId: String,
    val pastorName: String,
    val date: Long, // Timestamp
    val videoUrl: String?,
    val audioUrl: String?,
    val thumbnailUrl: String?,
    val duration: Int?, // En secondes
    val views: Int,
    val likes: Int,
    val category: String?,
    val tags: String?, // JSON array string
    val isDownloaded: Boolean = false,
    val localVideoPath: String?,
    val localAudioPath: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
