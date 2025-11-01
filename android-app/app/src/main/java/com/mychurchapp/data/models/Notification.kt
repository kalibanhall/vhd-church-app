package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle de notification correspondant à la table `notifications` de PostgreSQL
 */
@JsonClass(generateAdapter = true)
data class Notification(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "title")
    val title: String,
    
    @Json(name = "message")
    val message: String,
    
    @Json(name = "notificationType")
    val notificationType: NotificationType,
    
    @Json(name = "isRead")
    val isRead: Boolean = false,
    
    @Json(name = "relatedEntityType")
    val relatedEntityType: String? = null,
    
    @Json(name = "relatedEntityId")
    val relatedEntityId: String? = null,
    
    @Json(name = "scheduledAt")
    val scheduledAt: String? = null,
    
    @Json(name = "sentAt")
    val sentAt: String,
    
    @Json(name = "createdAt")
    val createdAt: String? = null
)

enum class NotificationType {
    @Json(name = "event_reminder")
    EVENT_REMINDER,
    
    @Json(name = "prayer_request")
    PRAYER_REQUEST,
    
    @Json(name = "appointment_reminder")
    APPOINTMENT_REMINDER,
    
    @Json(name = "donation_receipt")
    DONATION_RECEIPT,
    
    @Json(name = "system_alert")
    SYSTEM_ALERT,
    
    @Json(name = "new_sermon")
    NEW_SERMON,
    
    @Json(name = "testimony_approved")
    TESTIMONY_APPROVED,
    
    @Json(name = "chat_message")
    CHAT_MESSAGE,
    
    @Json(name = "birthday")
    BIRTHDAY,
    
    @Json(name = "announcement")
    ANNOUNCEMENT
}
