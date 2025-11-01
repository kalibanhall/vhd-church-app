package com.mychurchapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "members")
data class MemberEntity(
    @PrimaryKey
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String?,
    val address: String?,
    val dateOfBirth: Long?, // Timestamp
    val gender: String?,
    val role: String, // ADMIN, PASTOR, MEMBER
    val status: String, // ACTIVE, INACTIVE, SUSPENDED
    val profilePictureUrl: String?,
    val faceDescriptor: String?, // JSON array pour reconnaissance faciale
    val joinDate: Long,
    val baptismDate: Long?,
    val isVerified: Boolean,
    val department: String?, // Chorale, Jeunesse, Intercession, etc.
    val skills: String?, // JSON array
    val emergencyContact: String?,
    val emergencyPhone: String?,
    val notes: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
