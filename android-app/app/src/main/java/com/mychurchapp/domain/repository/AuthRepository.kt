package com.mychurchapp.domain.repository

import com.mychurchapp.data.models.*
import com.mychurchapp.utils.Resource
import kotlinx.coroutines.flow.Flow

/**
 * Interface du repository d'authentification
 * Définit les opérations d'authentification
 */
interface AuthRepository {
    suspend fun login(email: String, password: String): Flow<Resource<AuthResponse>>
    suspend fun register(
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        password: String,
        confirmPassword: String
    ): Flow<Resource<AuthResponse>>
    suspend fun forgotPassword(email: String): Flow<Resource<Unit>>
    suspend fun resetPassword(token: String, password: String, confirmPassword: String): Flow<Resource<Unit>>
    suspend fun getCurrentUser(): Flow<Resource<User>>
    suspend fun logout(): Flow<Resource<Unit>>
    fun isLoggedIn(): Boolean
}
