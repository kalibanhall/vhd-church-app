package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Statistiques du tableau de bord administrateur
 */
@JsonClass(generateAdapter = true)
data class AdminStats(
    @Json(name = "totalMembers")
    val totalMembers: Int,
    
    @Json(name = "activeMembers")
    val activeMembers: Int,
    
    @Json(name = "todaysPresence")
    val todaysPresence: Int,
    
    @Json(name = "monthlyDonations")
    val monthlyDonations: Double,
    
    @Json(name = "pendingPrayers")
    val pendingPrayers: Int,
    
    @Json(name = "upcomingEvents")
    val upcomingEvents: Int,
    
    @Json(name = "pendingTestimonies")
    val pendingTestimonies: Int,
    
    @Json(name = "thisWeekAttendance")
    val thisWeekAttendance: Int
)

/**
 * Statistiques de croissance
 */
@JsonClass(generateAdapter = true)
data class GrowthStats(
    @Json(name = "period")
    val period: String,
    
    @Json(name = "newMembers")
    val newMembers: Int,
    
    @Json(name = "totalDonations")
    val totalDonations: Double,
    
    @Json(name = "averageAttendance")
    val averageAttendance: Int,
    
    @Json(name = "activePrayers")
    val activePrayers: Int,
    
    @Json(name = "publishedSermons")
    val publishedSermons: Int
)

/**
 * Données pour graphiques
 */
@JsonClass(generateAdapter = true)
data class ChartData(
    @Json(name = "label")
    val label: String,
    
    @Json(name = "value")
    val value: Double,
    
    @Json(name = "date")
    val date: String? = null
)

/**
 * Rapport de présence
 */
@JsonClass(generateAdapter = true)
data class AttendanceReport(
    @Json(name = "eventId")
    val eventId: String,
    
    @Json(name = "eventTitle")
    val eventTitle: String,
    
    @Json(name = "eventDate")
    val eventDate: String,
    
    @Json(name = "totalAttendees")
    val totalAttendees: Int,
    
    @Json(name = "onTimeAttendees")
    val onTimeAttendees: Int,
    
    @Json(name = "lateAttendees")
    val lateAttendees: Int,
    
    @Json(name = "attendanceRate")
    val attendanceRate: Double
)

/**
 * Rapport financier
 */
@JsonClass(generateAdapter = true)
data class FinancialReport(
    @Json(name = "period")
    val period: String,
    
    @Json(name = "totalDonations")
    val totalDonations: Double,
    
    @Json(name = "totalTithes")
    val totalTithes: Double,
    
    @Json(name = "totalOfferings")
    val totalOfferings: Double,
    
    @Json(name = "totalProjects")
    val totalProjects: Double,
    
    @Json(name = "donationsByType")
    val donationsByType: Map<String, Double>,
    
    @Json(name = "donationsByMethod")
    val donationsByMethod: Map<String, Double>,
    
    @Json(name = "topDonors")
    val topDonors: List<DonorSummary>
)

@JsonClass(generateAdapter = true)
data class DonorSummary(
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "userName")
    val userName: String,
    
    @Json(name = "totalAmount")
    val totalAmount: Double,
    
    @Json(name = "donationCount")
    val donationCount: Int
)
