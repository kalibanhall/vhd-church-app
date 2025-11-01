package com.mychurchapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "events")
data class EventEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val description: String?,
    val type: String, // CULTE, REUNION, CONFERENCE, etc.
    val startDate: Long, // Timestamp
    val endDate: Long?, // Timestamp
    val location: String?,
    val organizerId: String?,
    val organizerName: String?,
    val maxAttendees: Int?,
    val currentAttendees: Int,
    val registrationRequired: Boolean,
    val imageUrl: String?,
    val isRecurring: Boolean,
    val recurrencePattern: String?, // JSON string
    val status: String, // UPCOMING, ONGOING, COMPLETED, CANCELLED
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
