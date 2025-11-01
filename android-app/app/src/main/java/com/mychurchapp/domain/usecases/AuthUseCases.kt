package com.mychurchapp.domain.usecases

import com.mychurchapp.data.models.AuthResponse
import com.mychurchapp.domain.repository.AuthRepository
import com.mychurchapp.utils.Resource
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

/**
 * Use case pour la connexion
 */
class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): Flow<Resource<AuthResponse>> {
        // Validation des entrées
        if (email.isBlank()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("L'email est requis"))
            }
        }
        
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Email invalide"))
            }
        }
        
        if (password.isBlank()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Le mot de passe est requis"))
            }
        }
        
        if (password.length < 6) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Le mot de passe doit contenir au moins 6 caractères"))
            }
        }
        
        return authRepository.login(email, password)
    }
}

/**
 * Use case pour l'inscription
 */
class RegisterUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        password: String,
        confirmPassword: String
    ): Flow<Resource<AuthResponse>> {
        // Validation des entrées
        if (firstName.isBlank()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Le prénom est requis"))
            }
        }
        
        if (lastName.isBlank()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Le nom est requis"))
            }
        }
        
        if (email.isBlank()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("L'email est requis"))
            }
        }
        
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Email invalide"))
            }
        }
        
        if (phone.isBlank()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Le téléphone est requis"))
            }
        }
        
        if (password.isBlank()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Le mot de passe est requis"))
            }
        }
        
        if (password.length < 6) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Le mot de passe doit contenir au moins 6 caractères"))
            }
        }
        
        if (password != confirmPassword) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Les mots de passe ne correspondent pas"))
            }
        }
        
        return authRepository.register(firstName, lastName, email, phone, password, confirmPassword)
    }
}

/**
 * Use case pour mot de passe oublié
 */
class ForgotPasswordUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(email: String): Flow<Resource<Unit>> {
        if (email.isBlank()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("L'email est requis"))
            }
        }
        
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return kotlinx.coroutines.flow.flow {
                emit(Resource.Error("Email invalide"))
            }
        }
        
        return authRepository.forgotPassword(email)
    }
}

/**
 * Use case pour la déconnexion
 */
class LogoutUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(): Flow<Resource<Unit>> {
        return authRepository.logout()
    }
}

/**
 * Use case pour récupérer l'utilisateur courant
 */
class GetCurrentUserUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke() = authRepository.getCurrentUser()
}
