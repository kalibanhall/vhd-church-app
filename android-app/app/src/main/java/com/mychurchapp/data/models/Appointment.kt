package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle de rendez-vous correspondant à la table `appointments` de PostgreSQL
 */
@JsonClass(generateAdapter = true)
data class Appointment(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "pastorId")
    val pastorId: String,
    
    @Json(name = "appointmentDate")
    val appointmentDate: String,
    
    @Json(name = "startTime")
    val startTime: String,
    
    @Json(name = "endTime")
    val endTime: String,
    
    @Json(name = "purpose")
    val purpose: AppointmentPurpose,
    
    @Json(name = "status")
    val status: AppointmentStatus,
    
    @Json(name = "notes")
    val notes: String? = null,
    
    @Json(name = "cancellationReason")
    val cancellationReason: String? = null,
    
    @Json(name = "reminderSent")
    val reminderSent: Boolean = false,
    
    @Json(name = "createdAt")
    val createdAt: String? = null,
    
    @Json(name = "updatedAt")
    val updatedAt: String? = null
)

enum class AppointmentPurpose {
    @Json(name = "spiritual_counseling")
    SPIRITUAL_COUNSELING,
    
    @Json(name = "family_counseling")
    FAMILY_COUNSELING,
    
    @Json(name = "prayer_request")
    PRAYER_REQUEST,
    
    @Json(name = "baptism_preparation")
    BAPTISM_PREPARATION,
    
    @Json(name = "marriage_preparation")
    MARRIAGE_PREPARATION,
    
    @Json(name = "visit_request")
    VISIT_REQUEST,
    
    @Json(name = "other")
    OTHER
}

enum class AppointmentStatus {
    @Json(name = "pending")
    PENDING,
    
    @Json(name = "confirmed")
    CONFIRMED,
    
    @Json(name = "cancelled")
    CANCELLED,
    
    @Json(name = "completed")
    COMPLETED,
    
    @Json(name = "no_show")
    NO_SHOW
}
