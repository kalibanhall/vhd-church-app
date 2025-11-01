package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Réponse générique de l'API
 */
@JsonClass(generateAdapter = true)
data class ApiResponse<T>(
    @Json(name = "success")
    val success: Boolean,
    
    @Json(name = "data")
    val data: T? = null,
    
    @Json(name = "message")
    val message: String? = null,
    
    @Json(name = "error")
    val error: String? = null
)

/**
 * Réponse d'authentification
 */
@JsonClass(generateAdapter = true)
data class AuthResponse(
    @Json(name = "success")
    val success: Boolean,
    
    @Json(name = "accessToken")
    val accessToken: String? = null,
    
    @Json(name = "refreshToken")
    val refreshToken: String? = null,
    
    @Json(name = "user")
    val user: User? = null,
    
    @Json(name = "message")
    val message: String? = null,
    
    @Json(name = "error")
    val error: String? = null
)

/**
 * Requête de connexion
 */
@JsonClass(generateAdapter = true)
data class LoginRequest(
    @Json(name = "email")
    val email: String,
    
    @Json(name = "password")
    val password: String
)

/**
 * Requête d'inscription
 */
@JsonClass(generateAdapter = true)
data class RegisterRequest(
    @Json(name = "firstName")
    val firstName: String,
    
    @Json(name = "lastName")
    val lastName: String,
    
    @Json(name = "email")
    val email: String,
    
    @Json(name = "phone")
    val phone: String,
    
    @Json(name = "password")
    val password: String,
    
    @Json(name = "confirmPassword")
    val confirmPassword: String
)

/**
 * Requête de mot de passe oublié
 */
@JsonClass(generateAdapter = true)
data class ForgotPasswordRequest(
    @Json(name = "email")
    val email: String
)

/**
 * Requête de réinitialisation de mot de passe
 */
@JsonClass(generateAdapter = true)
data class ResetPasswordRequest(
    @Json(name = "token")
    val token: String,
    
    @Json(name = "password")
    val password: String,
    
    @Json(name = "confirmPassword")
    val confirmPassword: String
)

/**
 * Requête de création de don
 */
@JsonClass(generateAdapter = true)
data class CreateDonationRequest(
    @Json(name = "amount")
    val amount: Double,
    
    @Json(name = "donationType")
    val donationType: String,
    
    @Json(name = "paymentMethod")
    val paymentMethod: String,
    
    @Json(name = "projectId")
    val projectId: String? = null,
    
    @Json(name = "notes")
    val notes: String? = null
)

/**
 * Requête de création de rendez-vous
 */
@JsonClass(generateAdapter = true)
data class CreateAppointmentRequest(
    @Json(name = "pastorId")
    val pastorId: String,
    
    @Json(name = "appointmentDate")
    val appointmentDate: String,
    
    @Json(name = "startTime")
    val startTime: String,
    
    @Json(name = "purpose")
    val purpose: String,
    
    @Json(name = "notes")
    val notes: String? = null
)

/**
 * Requête de création de prière
 */
@JsonClass(generateAdapter = true)
data class CreatePrayerRequest(
    @Json(name = "title")
    val title: String? = null,
    
    @Json(name = "content")
    val content: String,
    
    @Json(name = "isAnonymous")
    val isAnonymous: Boolean = false,
    
    @Json(name = "isPublic")
    val isPublic: Boolean = true
)

/**
 * Requête de création de témoignage
 */
@JsonClass(generateAdapter = true)
data class CreateTestimonyRequest(
    @Json(name = "title")
    val title: String,
    
    @Json(name = "content")
    val content: String,
    
    @Json(name = "isAnonymous")
    val isAnonymous: Boolean = false
)

/**
 * Requête de mise à jour du profil
 */
@JsonClass(generateAdapter = true)
data class UpdateProfileRequest(
    @Json(name = "firstName")
    val firstName: String? = null,
    
    @Json(name = "lastName")
    val lastName: String? = null,
    
    @Json(name = "phone")
    val phone: String? = null,
    
    @Json(name = "address")
    val address: String? = null,
    
    @Json(name = "birthDate")
    val birthDate: String? = null,
    
    @Json(name = "maritalStatus")
    val maritalStatus: String? = null,
    
    @Json(name = "profession")
    val profession: String? = null,
    
    @Json(name = "emergencyContactName")
    val emergencyContactName: String? = null,
    
    @Json(name = "emergencyContactPhone")
    val emergencyContactPhone: String? = null
)

/**
 * Réponse paginée
 */
@JsonClass(generateAdapter = true)
data class PaginatedResponse<T>(
    @Json(name = "success")
    val success: Boolean,
    
    @Json(name = "data")
    val data: List<T>,
    
    @Json(name = "page")
    val page: Int,
    
    @Json(name = "pageSize")
    val pageSize: Int,
    
    @Json(name = "totalPages")
    val totalPages: Int,
    
    @Json(name = "totalItems")
    val totalItems: Int,
    
    @Json(name = "hasNext")
    val hasNext: Boolean,
    
    @Json(name = "hasPrevious")
    val hasPrevious: Boolean
)
