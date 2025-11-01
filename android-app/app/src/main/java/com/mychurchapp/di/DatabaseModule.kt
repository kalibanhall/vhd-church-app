package com.mychurchapp.di

import android.content.Context
import androidx.room.Room
import com.mychurchapp.data.local.ChurchDatabase
import com.mychurchapp.data.local.dao.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideChurchDatabase(
        @ApplicationContext context: Context
    ): ChurchDatabase {
        return Room.databaseBuilder(
            context,
            ChurchDatabase::class.java,
            ChurchDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration() // Pour développement, à remplacer par migrations en prod
            .build()
    }

    @Provides
    @Singleton
    fun provideSermonDao(database: ChurchDatabase): SermonDao {
        return database.sermonDao()
    }

    @Provides
    @Singleton
    fun provideEventDao(database: ChurchDatabase): EventDao {
        return database.eventDao()
    }

    @Provides
    @Singleton
    fun provideMemberDao(database: ChurchDatabase): MemberDao {
        return database.memberDao()
    }

    @Provides
    @Singleton
    fun provideTestimonyDao(database: ChurchDatabase): TestimonyDao {
        return database.testimonyDao()
    }

    @Provides
    @Singleton
    fun provideAppointmentDao(database: ChurchDatabase): AppointmentDao {
        return database.appointmentDao()
    }

    @Provides
    @Singleton
    fun provideDonationDao(database: ChurchDatabase): DonationDao {
        return database.donationDao()
    }
}
