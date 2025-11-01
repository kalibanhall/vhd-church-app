package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle d'événement correspondant à la table `events` de PostgreSQL
 */
@JsonClass(generateAdapter = true)
data class Event(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "title")
    val title: String,
    
    @Json(name = "description")
    val description: String? = null,
    
    @Json(name = "eventDate")
    val eventDate: String,
    
    @Json(name = "startTime")
    val startTime: String,
    
    @Json(name = "endTime")
    val endTime: String? = null,
    
    @Json(name = "eventType")
    val eventType: EventType,
    
    @Json(name = "location")
    val location: String? = null,
    
    @Json(name = "pastorId")
    val pastorId: String? = null,
    
    @Json(name = "maxAttendees")
    val maxAttendees: Int? = null,
    
    @Json(name = "isRecurring")
    val isRecurring: Boolean = false,
    
    @Json(name = "recurrencePattern")
    val recurrencePattern: RecurrencePattern? = null,
    
    @Json(name = "status")
    val status: EventStatus,
    
    @Json(name = "createdAt")
    val createdAt: String? = null,
    
    @Json(name = "updatedAt")
    val updatedAt: String? = null
)

enum class EventType {
    @Json(name = "service")
    SERVICE,
    
    @Json(name = "prayer")
    PRAYER,
    
    @Json(name = "conference")
    CONFERENCE,
    
    @Json(name = "seminar")
    SEMINAR,
    
    @Json(name = "meeting")
    MEETING,
    
    @Json(name = "other")
    OTHER
}

enum class RecurrencePattern {
    @Json(name = "daily")
    DAILY,
    
    @Json(name = "weekly")
    WEEKLY,
    
    @Json(name = "monthly")
    MONTHLY,
    
    @Json(name = "yearly")
    YEARLY
}

enum class EventStatus {
    @Json(name = "scheduled")
    SCHEDULED,
    
    @Json(name = "cancelled")
    CANCELLED,
    
    @Json(name = "completed")
    COMPLETED
}

/**
 * Présence à un événement
 */
@JsonClass(generateAdapter = true)
data class Attendance(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "eventId")
    val eventId: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "checkInTime")
    val checkInTime: String,
    
    @Json(name = "checkOutTime")
    val checkOutTime: String? = null,
    
    @Json(name = "attendanceMethod")
    val attendanceMethod: AttendanceMethod,
    
    @Json(name = "notes")
    val notes: String? = null
)

enum class AttendanceMethod {
    @Json(name = "manual")
    MANUAL,
    
    @Json(name = "qr_code")
    QR_CODE,
    
    @Json(name = "facial_recognition")
    FACIAL_RECOGNITION,
    
    @Json(name = "mobile")
    MOBILE
}
