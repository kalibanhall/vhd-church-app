package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle utilisateur correspondant à la table `users` de PostgreSQL
 * Compatible avec l'API Next.js existante
 */
@JsonClass(generateAdapter = true)
data class User(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "firstName")
    val firstName: String,
    
    @Json(name = "lastName")
    val lastName: String,
    
    @Json(name = "email")
    val email: String,
    
    @Json(name = "phone")
    val phone: String?,
    
    @Json(name = "role")
    val role: UserRole,
    
    @Json(name = "status")
    val status: UserStatus,
    
    @Json(name = "birthDate")
    val birthDate: String? = null,
    
    @Json(name = "address")
    val address: String? = null,
    
    @Json(name = "profileImage")
    val profileImage: String? = null,
    
    @Json(name = "profilePhoto")
    val profilePhoto: String? = null,
    
    @Json(name = "membershipDate")
    val membershipDate: String,
    
    @Json(name = "membershipNumber")
    val membershipNumber: String? = null,
    
    @Json(name = "emergencyContactName")
    val emergencyContactName: String? = null,
    
    @Json(name = "emergencyContactPhone")
    val emergencyContactPhone: String? = null,
    
    @Json(name = "baptismDate")
    val baptismDate: String? = null,
    
    @Json(name = "maritalStatus")
    val maritalStatus: MaritalStatus? = null,
    
    @Json(name = "profession")
    val profession: String? = null
) {
    val fullName: String
        get() = "$firstName $lastName"
}

enum class UserRole {
    @Json(name = "member")
    MEMBER,
    
    @Json(name = "pastor")
    PASTOR,
    
    @Json(name = "admin")
    ADMIN,
    
    @Json(name = "deacon")
    DEACON
}

enum class UserStatus {
    @Json(name = "active")
    ACTIVE,
    
    @Json(name = "inactive")
    INACTIVE,
    
    @Json(name = "pending")
    PENDING
}

enum class MaritalStatus {
    @Json(name = "single")
    SINGLE,
    
    @Json(name = "married")
    MARRIED,
    
    @Json(name = "divorced")
    DIVORCED,
    
    @Json(name = "widowed")
    WIDOWED
}
