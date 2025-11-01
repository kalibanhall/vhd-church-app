package com.mychurchapp.domain.repository

import com.mychurchapp.data.models.*
import com.mychurchapp.utils.Resource
import kotlinx.coroutines.flow.Flow

/**
 * Repository pour la gestion des membres
 */
interface MembersRepository {
    suspend fun getMembers(page: Int, limit: Int, search: String?, status: String?, role: String?): Flow<Resource<PaginatedResponse<User>>>
    suspend fun getMemberById(id: String): Flow<Resource<User>>
    suspend fun searchMembers(query: String): Flow<Resource<List<User>>>
    suspend fun getMemberAttendance(id: String): Flow<Resource<List<Attendance>>>
    suspend fun getMemberDonations(id: String): Flow<Resource<List<Donation>>>
}

/**
 * Repository pour les dons
 */
interface DonationsRepository {
    suspend fun getDonations(page: Int, limit: Int, userId: String?, type: String?, startDate: String?, endDate: String?): Flow<Resource<PaginatedResponse<Donation>>>
    suspend fun getDonationById(id: String): Flow<Resource<Donation>>
    suspend fun createDonation(request: CreateDonationRequest): Flow<Resource<Donation>>
    suspend fun getDonationStats(period: String): Flow<Resource<FinancialReport>>
    suspend fun getProjects(status: String?): Flow<Resource<List<DonationProject>>>
    suspend fun getProjectById(id: String): Flow<Resource<DonationProject>>
}

/**
 * Repository pour les événements
 */
interface EventsRepository {
    suspend fun getEvents(page: Int, limit: Int, type: String?, status: String?, startDate: String?, endDate: String?): Flow<Resource<PaginatedResponse<Event>>>
    suspend fun getEventById(id: String): Flow<Resource<Event>>
    suspend fun createEvent(event: Event): Flow<Resource<Event>>
    suspend fun updateEvent(id: String, event: Event): Flow<Resource<Event>>
    suspend fun deleteEvent(id: String): Flow<Resource<Unit>>
    suspend fun registerAttendance(id: String, attendance: Attendance): Flow<Resource<Attendance>>
    suspend fun getUpcomingEvents(limit: Int): Flow<Resource<List<Event>>>
}

/**
 * Repository pour les prédications
 */
interface SermonsRepository {
    suspend fun getSermons(page: Int, limit: Int, type: String?, preacherId: String?, search: String?): Flow<Resource<PaginatedResponse<Sermon>>>
    suspend fun getSermonById(id: String): Flow<Resource<Sermon>>
    suspend fun getRecentSermons(limit: Int): Flow<Resource<List<Sermon>>>
    suspend fun getPopularSermons(limit: Int): Flow<Resource<List<Sermon>>>
    suspend fun incrementViewCount(id: String): Flow<Resource<Unit>>
    suspend fun incrementDownloadCount(id: String): Flow<Resource<Unit>>
}

/**
 * Repository pour les rendez-vous
 */
interface AppointmentsRepository {
    suspend fun getAppointments(page: Int, limit: Int, userId: String?, pastorId: String?, status: String?): Flow<Resource<PaginatedResponse<Appointment>>>
    suspend fun getAppointmentById(id: String): Flow<Resource<Appointment>>
    suspend fun createAppointment(request: CreateAppointmentRequest): Flow<Resource<Appointment>>
    suspend fun cancelAppointment(id: String): Flow<Resource<Unit>>
    suspend fun confirmAppointment(id: String): Flow<Resource<Appointment>>
    suspend fun getPastorAvailability(pastorId: String, date: String): Flow<Resource<List<String>>>
}

/**
 * Repository pour les prières
 */
interface PrayersRepository {
    suspend fun getPrayers(page: Int, limit: Int, status: String?, isPublic: Boolean?): Flow<Resource<PaginatedResponse<Prayer>>>
    suspend fun getPrayerById(id: String): Flow<Resource<Prayer>>
    suspend fun createPrayer(request: CreatePrayerRequest): Flow<Resource<Prayer>>
    suspend fun supportPrayer(id: String): Flow<Resource<PrayerSupport>>
    suspend fun markAsAnswered(id: String, testimony: String): Flow<Resource<Prayer>>
    suspend fun getMyPrayers(): Flow<Resource<List<Prayer>>>
}

/**
 * Repository pour les témoignages
 */
interface TestimoniesRepository {
    suspend fun getTestimonies(page: Int, limit: Int, status: String?): Flow<Resource<PaginatedResponse<Testimony>>>
    suspend fun getTestimonyById(id: String): Flow<Resource<Testimony>>
    suspend fun createTestimony(request: CreateTestimonyRequest): Flow<Resource<Testimony>>
    suspend fun likeTestimony(id: String): Flow<Resource<Unit>>
    suspend fun unlikeTestimony(id: String): Flow<Resource<Unit>>
    suspend fun addComment(id: String, comment: String): Flow<Resource<TestimonyComment>>
    suspend fun getComments(id: String): Flow<Resource<List<TestimonyComment>>>
}

/**
 * Repository pour le chat
 */
interface ChatRepository {
    suspend fun getChannels(type: String?): Flow<Resource<List<ChatChannel>>>
    suspend fun getChannelById(id: String): Flow<Resource<ChatChannel>>
    suspend fun getMessages(id: String, page: Int, limit: Int, before: String?): Flow<Resource<PaginatedResponse<ChatMessage>>>
    suspend fun sendMessage(id: String, message: ChatMessage): Flow<Resource<ChatMessage>>
    suspend fun editMessage(id: String, content: String): Flow<Resource<ChatMessage>>
    suspend fun deleteMessage(id: String): Flow<Resource<Unit>>
    suspend fun addReaction(id: String, emoji: String): Flow<Resource<ChatReaction>>
}

/**
 * Repository pour le dashboard
 */
interface DashboardRepository {
    suspend fun getDashboardStats(): Flow<Resource<AdminStats>>
    suspend fun getAnalytics(period: String): Flow<Resource<GrowthStats>>
    suspend fun getAttendanceReport(startDate: String, endDate: String): Flow<Resource<List<AttendanceReport>>>
    suspend fun getFinancialReport(period: String): Flow<Resource<FinancialReport>>
}

/**
 * Repository pour les notifications
 */
interface NotificationsRepository {
    suspend fun getNotifications(page: Int, limit: Int, isRead: Boolean?): Flow<Resource<PaginatedResponse<Notification>>>
    suspend fun markAsRead(id: String): Flow<Resource<Unit>>
    suspend fun markAllAsRead(): Flow<Resource<Unit>>
    suspend fun getUnreadCount(): Flow<Resource<Int>>
    suspend fun registerFcmToken(token: String): Flow<Resource<Unit>>
}

/**
 * Repository pour le profil
 */
interface ProfileRepository {
    suspend fun getProfile(): Flow<Resource<User>>
    suspend fun updateProfile(request: UpdateProfileRequest): Flow<Resource<User>>
    suspend fun uploadPhoto(photo: ByteArray): Flow<Resource<String>>
    suspend fun getActivity(): Flow<Resource<List<Any>>>
    suspend fun getStats(): Flow<Resource<Map<String, Int>>>
}
