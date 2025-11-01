package com.mychurchapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "appointments")
data class AppointmentEntity(
    @PrimaryKey
    val id: String,
    val memberId: String,
    val memberName: String,
    val pastorId: String,
    val pastorName: String,
    val date: Long, // Timestamp
    val duration: Int, // En minutes
    val type: String, // CONSEIL, PRIERE, BAPTEME, MARIAGE, etc.
    val status: String, // PENDING, CONFIRMED, CANCELLED, COMPLETED
    val reason: String?,
    val notes: String?,
    val location: String?,
    val isOnline: Boolean,
    val meetingUrl: String?,
    val reminderSent: Boolean,
    val cancelledBy: String?,
    val cancelReason: String?,
    val completedNotes: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
