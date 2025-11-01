package com.mychurchapp.data.repository

import com.mychurchapp.data.api.*
import com.mychurchapp.data.models.*
import com.mychurchapp.domain.repository.*
import com.mychurchapp.utils.Resource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implémentation du repository des membres
 */
@Singleton
class MembersRepositoryImpl @Inject constructor(
    private val membersApiService: MembersApiService
) : MembersRepository {

    override suspend fun getMembers(
        page: Int,
        limit: Int,
        search: String?,
        status: String?,
        role: String?
    ): Flow<Resource<PaginatedResponse<User>>> = flow {
        try {
            emit(Resource.Loading)
            val response = membersApiService.getMembers(page, limit, search, status, role)
            
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!))
            } else {
                emit(Resource.Error("Erreur de récupération des membres", response.code()))
            }
        } catch (e: HttpException) {
            emit(Resource.Error("Erreur réseau: ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Vérifiez votre connexion internet"))
        } catch (e: Exception) {
            emit(Resource.Error("Erreur inattendue: ${e.localizedMessage}"))
        }
    }

    override suspend fun getMemberById(id: String): Flow<Resource<User>> = flow {
        try {
            emit(Resource.Loading)
            val response = membersApiService.getMemberById(id)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Membre introuvable"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun searchMembers(query: String): Flow<Resource<List<User>>> = flow {
        try {
            emit(Resource.Loading)
            val response = membersApiService.searchMembers(query)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur de recherche"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getMemberAttendance(id: String): Flow<Resource<List<Attendance>>> = flow {
        try {
            emit(Resource.Loading)
            val response = membersApiService.getMemberAttendance(id)
            
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

    override suspend fun getMemberDonations(id: String): Flow<Resource<List<Donation>>> = flow {
        try {
            emit(Resource.Loading)
            val response = membersApiService.getMemberDonations(id)
            
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
 * Implémentation du repository des dons
 */
@Singleton
class DonationsRepositoryImpl @Inject constructor(
    private val donationsApiService: DonationsApiService
) : DonationsRepository {

    override suspend fun getDonations(
        page: Int,
        limit: Int,
        userId: String?,
        type: String?,
        startDate: String?,
        endDate: String?
    ): Flow<Resource<PaginatedResponse<Donation>>> = flow {
        try {
            emit(Resource.Loading)
            val response = donationsApiService.getDonations(page, limit, userId, type, startDate, endDate)
            
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!))
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getDonationById(id: String): Flow<Resource<Donation>> = flow {
        try {
            emit(Resource.Loading)
            val response = donationsApiService.getDonationById(id)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Don introuvable"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun createDonation(request: CreateDonationRequest): Flow<Resource<Donation>> = flow {
        try {
            emit(Resource.Loading)
            val response = donationsApiService.createDonation(request)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Erreur de création"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }

    override suspend fun getDonationStats(period: String): Flow<Resource<FinancialReport>> = flow {
        try {
            emit(Resource.Loading)
            val response = donationsApiService.getDonationStats(period)
            
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

    override suspend fun getProjects(status: String?): Flow<Resource<List<DonationProject>>> = flow {
        try {
            emit(Resource.Loading)
            val response = donationsApiService.getProjects(status)
            
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

    override suspend fun getProjectById(id: String): Flow<Resource<DonationProject>> = flow {
        try {
            emit(Resource.Loading)
            val response = donationsApiService.getProjectById(id)
            
            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                if (result.success && result.data != null) {
                    emit(Resource.Success(result.data))
                } else {
                    emit(Resource.Error(result.error ?: "Projet introuvable"))
                }
            } else {
                emit(Resource.Error("Erreur", response.code()))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}
