package com.mychurchapp

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.mychurchapp.worker.SyncManager
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber
import javax.inject.Inject

/**
 * Classe Application principale
 * Point d'entrée de l'application Android
 */
@HiltAndroidApp
class MyChurchApp : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory
    
    @Inject
    lateinit var syncManager: SyncManager

    override fun onCreate() {
        super.onCreate()
        
        // Initialiser Timber pour le logging
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
        
        // Démarrer la synchronisation périodique
        syncManager.startPeriodicSync()
        
        Timber.d("MyChurchApp initialisée avec WorkManager")
    }
    
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}
