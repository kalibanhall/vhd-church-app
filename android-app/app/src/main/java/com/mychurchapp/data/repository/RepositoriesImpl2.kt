package com.mychurchapp.data.repository

import com.mychurchapp.data.api.*
import com.mychurchapp.data.models.*
import com.mychurchapp.domain.repository.*
import com.mychurchapp.utils.Resource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implémentation du repository dashboard
 */
@Singleton
class DashboardRepositoryImpl @Inject constructor(
    private val analyticsApiService: AnalyticsApiService
) : DashboardRepository {

    override suspend fun getDashboardStats(): Flow<Resource<AdminStats>> = flow {
        try {
            emit(Resource.Loading)
            val response = analyticsApiService.getDashboardStats()
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getAnalytics(period: String): Flow<Resource<GrowthStats>> = flow {
        try {
            emit(Resource.Loading)
            val response = analyticsApiService.getAnalytics(period)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getAttendanceReport(
        startDate: String,
        endDate: String
    ): Flow<Resource<List<AttendanceReport>>> = flow {
        try {
            emit(Resource.Loading)
            val response = analyticsApiService.getAttendanceReport(startDate, endDate)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getFinancialReport(period: String): Flow<Resource<FinancialReport>> = flow {
        try {
            emit(Resource.Loading)
            val response = analyticsApiService.getFinancialReport(period)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}

/**
 * Implémentation du repository notifications
 */
@Singleton
class NotificationsRepositoryImpl @Inject constructor(
    private val notificationsApiService: NotificationsApiService
) : NotificationsRepository {

    override suspend fun getNotifications(
        page: Int,
        limit: Int,
        isRead: Boolean?
    ): Flow<Resource<PaginatedResponse<Notification>>> = flow {
        try {
            emit(Resource.Loading)
            val response = notificationsApiService.getNotifications(page, limit, isRead)
            
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!))
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun markAsRead(id: String): Flow<Resource<Unit>> = flow {
        try {
            emit(Resource.Loading)
            val response = notificationsApiService.markAsRead(id)
            
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun markAllAsRead(): Flow<Resource<Unit>> = flow {
        try {
            emit(Resource.Loading)
            val response = notificationsApiService.markAllAsRead()
            
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getUnreadCount(): Flow<Resource<Int>> = flow {
        try {
            emit(Resource.Loading)
            val response = notificationsApiService.getUnreadCount()
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun registerFcmToken(token: String): Flow<Resource<Unit>> = flow {
        try {
            emit(Resource.Loading)
            val response = notificationsApiService.registerFcmToken(token)
            
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}

/**
 * Implémentation du repository profil
 */
@Singleton
class ProfileRepositoryImpl @Inject constructor(
    private val profileApiService: ProfileApiService
) : ProfileRepository {

    override suspend fun getProfile(): Flow<Resource<User>> = flow {
        try {
            emit(Resource.Loading)
            val response = profileApiService.getProfile()
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun updateProfile(request: UpdateProfileRequest): Flow<Resource<User>> = flow {
        try {
            emit(Resource.Loading)
            val response = profileApiService.updateProfile(request)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur de mise à jour"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun uploadPhoto(photo: ByteArray): Flow<Resource<String>> = flow {
        try {
            emit(Resource.Loading)
            val response = profileApiService.uploadPhoto(photo)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur d'upload"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getActivity(): Flow<Resource<List<Any>>> = flow {
        try {
            emit(Resource.Loading)
            val response = profileApiService.getActivity()
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getStats(): Flow<Resource<Map<String, Int>>> = flow {
        try {
            emit(Resource.Loading)
            val response = profileApiService.getStats()
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}
