package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle de don correspondant à la table `donations` de PostgreSQL
 */
@JsonClass(generateAdapter = true)
data class Donation(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "amount")
    val amount: Double,
    
    @Json(name = "donationType")
    val donationType: DonationType,
    
    @Json(name = "paymentMethod")
    val paymentMethod: PaymentMethod,
    
    @Json(name = "paymentReference")
    val paymentReference: String? = null,
    
    @Json(name = "donationDate")
    val donationDate: String,
    
    @Json(name = "status")
    val status: DonationStatus,
    
    @Json(name = "projectId")
    val projectId: String? = null,
    
    @Json(name = "notes")
    val notes: String? = null,
    
    @Json(name = "receiptNumber")
    val receiptNumber: String? = null,
    
    @Json(name = "createdAt")
    val createdAt: String? = null,
    
    @Json(name = "updatedAt")
    val updatedAt: String? = null
)

enum class DonationType {
    @Json(name = "offering")
    OFFERING,
    
    @Json(name = "tithe")
    TITHE,
    
    @Json(name = "freewill")
    FREEWILL,
    
    @Json(name = "project")
    PROJECT,
    
    @Json(name = "building")
    BUILDING,
    
    @Json(name = "other")
    OTHER
}

enum class PaymentMethod {
    @Json(name = "cash")
    CASH,
    
    @Json(name = "card")
    CARD,
    
    @Json(name = "mobile_money")
    MOBILE_MONEY,
    
    @Json(name = "bank_transfer")
    BANK_TRANSFER,
    
    @Json(name = "check")
    CHECK
}

enum class DonationStatus {
    @Json(name = "pending")
    PENDING,
    
    @Json(name = "completed")
    COMPLETED,
    
    @Json(name = "failed")
    FAILED,
    
    @Json(name = "refunded")
    REFUNDED
}

/**
 * Projet de donation
 */
@JsonClass(generateAdapter = true)
data class DonationProject(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "projectName")
    val projectName: String,
    
    @Json(name = "description")
    val description: String? = null,
    
    @Json(name = "targetAmount")
    val targetAmount: Double,
    
    @Json(name = "currentAmount")
    val currentAmount: Double,
    
    @Json(name = "startDate")
    val startDate: String? = null,
    
    @Json(name = "endDate")
    val endDate: String? = null,
    
    @Json(name = "status")
    val status: ProjectStatus,
    
    @Json(name = "projectImageUrl")
    val projectImageUrl: String? = null
) {
    val progressPercentage: Float
        get() = if (targetAmount > 0) {
            ((currentAmount / targetAmount) * 100).toFloat()
        } else 0f
}

enum class ProjectStatus {
    @Json(name = "active")
    ACTIVE,
    
    @Json(name = "completed")
    COMPLETED,
    
    @Json(name = "cancelled")
    CANCELLED
}
