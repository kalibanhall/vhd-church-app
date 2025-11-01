package com.mychurchapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "donations")
data class DonationEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val userName: String?,
    val amount: Double,
    val currency: String, // CDF, USD
    val type: String, // OFFRANDE, DIME, PROJET
    val paymentMethod: String, // CASH, MOBILE_MONEY, BANK_TRANSFER, CARD
    val transactionId: String?,
    val status: String, // PENDING, COMPLETED, FAILED, REFUNDED
    val isRecurring: Boolean,
    val recurringFrequency: String?, // WEEKLY, MONTHLY, YEARLY
    val projectId: String?,
    val projectName: String?,
    val isAnonymous: Boolean,
    val receiptUrl: String?,
    val notes: String?,
    val processedBy: String?,
    val date: Long,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
