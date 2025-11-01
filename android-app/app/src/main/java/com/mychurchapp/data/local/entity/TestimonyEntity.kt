package com.mychurchapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "testimonies")
data class TestimonyEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val userName: String,
    val userPhotoUrl: String?,
    val title: String,
    val content: String,
    val category: String?, // GUERISON, MIRACLE, REPONSE_PRIERE, etc.
    val date: Long, // Date du témoignage
    val isApproved: Boolean,
    val isAnonymous: Boolean,
    val mediaUrls: String?, // JSON array
    val likes: Int,
    val commentsCount: Int,
    val shares: Int,
    val isPinned: Boolean,
    val moderatorNotes: String?,
    val approvedBy: String?,
    val approvedAt: Long?,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
