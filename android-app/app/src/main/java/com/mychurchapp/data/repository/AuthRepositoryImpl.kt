package com.mychurchapp.data.repository

import com.mychurchapp.data.models.User

import com.mychurchapp.data.api.AuthApiService
import com.mychurchapp.data.local.TokenManager
import com.mychurchapp.data.models.*
import com.mychurchapp.domain.repository.AuthRepository
import com.mychurchapp.utils.Resource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implémentation du repository d'authentification
 * Gère la communication avec l'API et le stockage local des tokens
 */
@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val authApiService: AuthApiService,
    private val tokenManager: TokenManager
) : AuthRepository {

    override suspend fun login(email: String, password: String): Flow<Resource<AuthResponse>> = flow {
        try {
            emit(Resource.Loading)
            
            val request = LoginRequest(email = email, password = password)
            val response = authApiService.login(request)
            
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                
                if (authResponse.success && authResponse.accessToken != null) {
                    // Sauvegarder les tokens
                    tokenManager.saveAccessToken(authResponse.accessToken)
                    authResponse.refreshToken?.let { 
                        tokenManager.saveRefreshToken(it) 
                    }
                    
                    // Sauvegarder les infos utilisateur
                    authResponse.user?.let { user ->
                        tokenManager.saveUserId(user.id)
                        tokenManager.saveUserEmail(user.email)
                        tokenManager.saveUserRole(user.userRole.name.lowercase())
                    }
                    
                    emit(Resource.Success(authResponse))
                } else {
                    emit(Resource.Error(authResponse.error ?: "Échec de connexion"))
                }
            } else {
                emit(Resource.Error("Erreur de connexion", response.code()))
            }
        } catch (e: HttpException) {
            emit(Resource.Error("Erreur réseau: ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Vérifiez votre connexion internet"))
        } catch (e: Exception) {
            emit(Resource.Error("Erreur inattendue: ${e.localizedMessage}"))
        }
    }

    override suspend fun register(
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        password: String,
        confirmPassword: String
    ): Flow<Resource<AuthResponse>> = flow {
        try {
            emit(Resource.Loading)
            
            val request = RegisterRequest(
                firstName = firstName,
                lastName = lastName,
                email = email,
                phone = phone,
                password = password,
                confirmPassword = confirmPassword
            )
            
            val response = authApiService.register(request)
            
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                
                if (authResponse.success && authResponse.accessToken != null) {
                    // Sauvegarder les tokens
                    tokenManager.saveAccessToken(authResponse.accessToken)
                    authResponse.refreshToken?.let { 
                        tokenManager.saveRefreshToken(it) 
                    }
                    
                    // Sauvegarder les infos utilisateur
                    authResponse.user?.let { user ->
                        tokenManager.saveUserId(user.id)
                        tokenManager.saveUserEmail(user.email)
                        tokenManager.saveUserRole(user.userRole.name.lowercase())
                    }
                    
                    emit(Resource.Success(authResponse))
                } else {
                    emit(Resource.Error(authResponse.error ?: "Échec d'inscription"))
                }
            } else {
                emit(Resource.Error("Erreur d'inscription", response.code()))
            }
        } catch (e: HttpException) {
            emit(Resource.Error("Erreur réseau: ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Vérifiez votre connexion internet"))
        } catch (e: Exception) {
            emit(Resource.Error("Erreur inattendue: ${e.localizedMessage}"))
        }
    }

    override suspend fun forgotPassword(email: String): Flow<Resource<Unit>> = flow {
        try {
            emit(Resource.Loading)
            
            val request = ForgotPasswordRequest(email = email)
            val response = authApiService.forgotPassword(request)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                
                if (result.success) {
                    emit(Resource.Success(Unit))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur lors de l'envoi de l'email"))
                }
            } else {
                emit(Resource.Error("Erreur de requête", response.code()))
            }
        } catch (e: HttpException) {
            emit(Resource.Error("Erreur réseau: ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Vérifiez votre connexion internet"))
        } catch (e: Exception) {
            emit(Resource.Error("Erreur inattendue: ${e.localizedMessage}"))
        }
    }

    override suspend fun resetPassword(
        token: String,
        password: String,
        confirmPassword: String
    ): Flow<Resource<Unit>> = flow {
        try {
            emit(Resource.Loading)
            
            val request = ResetPasswordRequest(
                token = token,
                password = password,
                confirmPassword = confirmPassword
            )
            val response = authApiService.resetPassword(request)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                
                if (result.success) {
                    emit(Resource.Success(Unit))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur lors de la réinitialisation"))
                }
            } else {
                emit(Resource.Error("Erreur de requête", response.code()))
            }
        } catch (e: HttpException) {
            emit(Resource.Error("Erreur réseau: ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Vérifiez votre connexion internet"))
        } catch (e: Exception) {
            emit(Resource.Error("Erreur inattendue: ${e.localizedMessage}"))
        }
    }

    override suspend fun getCurrentUser(): Flow<Resource<User>> = flow {
        try {
            emit(Resource.Loading)
            
            val response = authApiService.getCurrentUser()
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                
                if (result.success && result.data != null) {
                    // Mettre à jour les infos locales
                    tokenManager.saveUserId(result.data.id)
                    tokenManager.saveUserEmail(result.data.email)
                    tokenManager.saveUserRole(result.data.role.name.lowercase())
                    
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Impossible de récupérer l'utilisateur"))
                }
            } else {
                emit(Resource.Error("Erreur de requête", response.code()))
            }
        } catch (e: HttpException) {
            emit(Resource.Error("Erreur réseau: ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Vérifiez votre connexion internet"))
        } catch (e: Exception) {
            emit(Resource.Error("Erreur inattendue: ${e.localizedMessage}"))
        }
    }

    override suspend fun logout(): Flow<Resource<Unit>> = flow {
        try {
            emit(Resource.Loading)
            
            // Appeler l'API pour invalider le token côté serveur
            val response = authApiService.logout()
            
            // Nettoyer les données locales peu importe le résultat
            tokenManager.clearAll()
            
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                // Même en cas d'erreur API, on considère la déconnexion réussie localement
                emit(Resource.Success(Unit))
            }
        } catch (e: Exception) {
            // Nettoyer quand même en cas d'erreur
            tokenManager.clearAll()
            emit(Resource.Success(Unit))
        }
    }

    override fun isLoggedIn(): Boolean {
        return tokenManager.isLoggedIn()
    }
}
