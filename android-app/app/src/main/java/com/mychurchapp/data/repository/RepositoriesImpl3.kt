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

/**
 * Implémentation du repository Events
 */
class EventsRepositoryImpl @Inject constructor(
    private val eventsApi: EventsApiService
) : EventsRepository {
    
    override suspend fun getEvents(): Flow<Resource<List<Event>>> = flow {
        emit(Resource.Loading())
        try {
            val response = eventsApi.getEvents()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la récupération des événements"))
            }
        } catch (e: HttpException) {
            emit(Resource.Error("Erreur réseau: ${e.message()}"))
        } catch (e: IOException) {
            emit(Resource.Error("Vérifiez votre connexion internet"))
        } catch (e: Exception) {
            emit(Resource.Error("Erreur inconnue: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun getEventById(eventId: String): Flow<Resource<Event>> = flow {
        emit(Resource.Loading())
        try {
            val response = eventsApi.getEventById(eventId)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Événement non trouvé"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun createEvent(event: Event): Flow<Resource<Event>> = flow {
        emit(Resource.Loading())
        try {
            val response = eventsApi.createEvent(event)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la création"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun registerForEvent(eventId: String): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            val response = eventsApi.registerForEvent(eventId)
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(Resource.Error("Erreur lors de l'inscription"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}

/**
 * Implémentation du repository Sermons
 */
class SermonsRepositoryImpl @Inject constructor(
    private val sermonsApi: SermonsApiService
) : SermonsRepository {
    
    override suspend fun getSermons(): Flow<Resource<List<Sermon>>> = flow {
        emit(Resource.Loading())
        try {
            val response = sermonsApi.getSermons()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la récupération des prédications"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun getSermonById(sermonId: String): Flow<Resource<Sermon>> = flow {
        emit(Resource.Loading())
        try {
            val response = sermonsApi.getSermonById(sermonId)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Prédication non trouvée"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun downloadSermon(sermonId: String): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            // TODO: Implémenter le téléchargement réel
            emit(Resource.Success(Unit))
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}

/**
 * Implémentation du repository Appointments
 */
class AppointmentsRepositoryImpl @Inject constructor(
    private val appointmentsApi: AppointmentsApiService
) : AppointmentsRepository {
    
    override suspend fun getAppointments(): Flow<Resource<List<Appointment>>> = flow {
        emit(Resource.Loading())
        try {
            val response = appointmentsApi.getAppointments()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la récupération des rendez-vous"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun createAppointment(appointment: Appointment): Flow<Resource<Appointment>> = flow {
        emit(Resource.Loading())
        try {
            val response = appointmentsApi.createAppointment(appointment)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la création"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun confirmAppointment(appointmentId: String): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            val response = appointmentsApi.confirmAppointment(appointmentId)
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(Resource.Error("Erreur lors de la confirmation"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}

/**
 * Implémentation du repository Prayers
 */
class PrayersRepositoryImpl @Inject constructor(
    private val prayersApi: PrayersTestimoniesApiService
) : PrayersRepository {
    
    override suspend fun getPrayers(): Flow<Resource<List<Prayer>>> = flow {
        emit(Resource.Loading())
        try {
            val response = prayersApi.getPrayers()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la récupération des prières"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun createPrayer(prayer: Prayer): Flow<Resource<Prayer>> = flow {
        emit(Resource.Loading())
        try {
            val response = prayersApi.createPrayer(prayer)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la création"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun supportPrayer(prayerId: String): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            val response = prayersApi.supportPrayer(prayerId)
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(Resource.Error("Erreur"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}

/**
 * Implémentation du repository Testimonies
 */
class TestimoniesRepositoryImpl @Inject constructor(
    private val testimoniesApi: PrayersTestimoniesApiService
) : TestimoniesRepository {
    
    override suspend fun getTestimonies(): Flow<Resource<List<Testimony>>> = flow {
        emit(Resource.Loading())
        try {
            val response = testimoniesApi.getTestimonies()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la récupération des témoignages"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun createTestimony(testimony: Testimony): Flow<Resource<Testimony>> = flow {
        emit(Resource.Loading())
        try {
            val response = testimoniesApi.createTestimony(testimony)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la création"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun likeTestimony(testimonyId: String): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            val response = testimoniesApi.likeTestimony(testimonyId)
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(Resource.Error("Erreur"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}

/**
 * Implémentation du repository Chat
 */
class ChatRepositoryImpl @Inject constructor(
    private val chatApi: ChatApiService
) : ChatRepository {
    
    override suspend fun getChannels(): Flow<Resource<List<ChatChannel>>> = flow {
        emit(Resource.Loading())
        try {
            val response = chatApi.getChannels()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la récupération des canaux"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun getMessages(channelId: String): Flow<Resource<List<ChatMessage>>> = flow {
        emit(Resource.Loading())
        try {
            val response = chatApi.getMessages(channelId)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de la récupération des messages"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
    
    override suspend fun sendMessage(channelId: String, content: String): Flow<Resource<ChatMessage>> = flow {
        emit(Resource.Loading())
        try {
            val response = chatApi.sendMessage(channelId, mapOf("content" to content))
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Erreur lors de l'envoi"))
            }
        } catch (e: Exception) {
            emit(Resource.Error("Erreur: ${e.localizedMessage}"))
        }
    }
}
