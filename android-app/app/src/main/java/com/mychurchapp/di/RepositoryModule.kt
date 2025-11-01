package com.mychurchapp.di

import com.mychurchapp.data.api.FacialRecognitionApi
import com.mychurchapp.data.repository.*
import com.mychurchapp.domain.repository.*
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Module Hilt pour les repositories
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository
    
    @Binds
    @Singleton
    abstract fun bindMembersRepository(
        membersRepositoryImpl: MembersRepositoryImpl
    ): MembersRepository
    
    @Binds
    @Singleton
    abstract fun bindDonationsRepository(
        donationsRepositoryImpl: DonationsRepositoryImpl
    ): DonationsRepository
    
    @Binds
    @Singleton
    abstract fun bindDashboardRepository(
        dashboardRepositoryImpl: DashboardRepositoryImpl
    ): DashboardRepository
    
    @Binds
    @Singleton
    abstract fun bindNotificationsRepository(
        notificationsRepositoryImpl: NotificationsRepositoryImpl
    ): NotificationsRepository
    
    @Binds
    @Singleton
    abstract fun bindProfileRepository(
        profileRepositoryImpl: ProfileRepositoryImpl
    ): ProfileRepository
    
    @Binds
    @Singleton
    abstract fun bindEventsRepository(
        eventsRepositoryImpl: EventsRepositoryImpl
    ): EventsRepository
    
    @Binds
    @Singleton
    abstract fun bindSermonsRepository(
        sermonsRepositoryImpl: SermonsRepositoryImpl
    ): SermonsRepository
    
    @Binds
    @Singleton
    abstract fun bindAppointmentsRepository(
        appointmentsRepositoryImpl: AppointmentsRepositoryImpl
    ): AppointmentsRepository
    
    @Binds
    @Singleton
    abstract fun bindPrayersRepository(
        prayersRepositoryImpl: PrayersRepositoryImpl
    ): PrayersRepository
    
    @Binds
    @Singleton
    abstract fun bindTestimoniesRepository(
        testimoniesRepositoryImpl: TestimoniesRepositoryImpl
    ): TestimoniesRepository
    
    @Binds
    @Singleton
    abstract fun bindChatRepository(
        chatRepositoryImpl: ChatRepositoryImpl
    ): ChatRepository
    
    companion object {
        @Provides
        @Singleton
        fun provideFacialRecognitionRepository(
            api: FacialRecognitionApi
        ): FacialRecognitionRepository {
            return FacialRecognitionRepository(api)
        }
    }
}
