package com.mychurchapp.di

import android.content.Context
import com.mychurchapp.BuildConfig
import com.mychurchapp.data.api.*
import com.mychurchapp.data.local.TokenManager
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

/**
 * Module Hilt pour les dépendances réseau
 * Configuration Retrofit pour communiquer avec l'API Next.js/PostgreSQL
 */
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideBaseUrl(): String {
        return if (BuildConfig.DEBUG) {
            BuildConfig.API_BASE_URL_DEV
        } else {
            BuildConfig.API_BASE_URL
        }
    }

    @Provides
    @Singleton
    fun provideMoshi(): Moshi {
        return Moshi.Builder()
            .add(KotlinJsonAdapterFactory())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthInterceptor(tokenManager: TokenManager): Interceptor {
        return Interceptor { chain ->
            val request = chain.request()
            val token = tokenManager.getAccessToken()
            
            val newRequest = if (token != null) {
                request.newBuilder()
                    .header("Authorization", "Bearer $token")
                    .header("Content-Type", "application/json")
                    .build()
            } else {
                request.newBuilder()
                    .header("Content-Type", "application/json")
                    .build()
            }
            
            chain.proceed(newRequest)
        }
    }

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: Interceptor,
        loggingInterceptor: HttpLoggingInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(
        baseUrl: String,
        okHttpClient: OkHttpClient,
        moshi: Moshi
    ): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
    }

    // API Services
    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): AuthApiService {
        return retrofit.create(AuthApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideMembersApiService(retrofit: Retrofit): MembersApiService {
        return retrofit.create(MembersApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideDonationsApiService(retrofit: Retrofit): DonationsApiService {
        return retrofit.create(DonationsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideEventsApiService(retrofit: Retrofit): EventsApiService {
        return retrofit.create(EventsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideSermonsApiService(retrofit: Retrofit): SermonsApiService {
        return retrofit.create(SermonsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideAppointmentsApiService(retrofit: Retrofit): AppointmentsApiService {
        return retrofit.create(AppointmentsApiService::class.java)
    }

    @Provides
    @Singleton
    fun providePrayersApiService(retrofit: Retrofit): PrayersApiService {
        return retrofit.create(PrayersApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideTestimoniesApiService(retrofit: Retrofit): TestimoniesApiService {
        return retrofit.create(TestimoniesApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideChatApiService(retrofit: Retrofit): ChatApiService {
        return retrofit.create(ChatApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideAnalyticsApiService(retrofit: Retrofit): AnalyticsApiService {
        return retrofit.create(AnalyticsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideNotificationsApiService(retrofit: Retrofit): NotificationsApiService {
        return retrofit.create(NotificationsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideProfileApiService(retrofit: Retrofit): ProfileApiService {
        return retrofit.create(ProfileApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideFacialRecognitionApi(retrofit: Retrofit): FacialRecognitionApi {
        return retrofit.create(FacialRecognitionApi::class.java)
    }
}
