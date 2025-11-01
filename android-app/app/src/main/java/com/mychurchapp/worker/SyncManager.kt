package com.mychurchapp.worker

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncManager @Inject constructor(
    private val context: Context
) {
    private val workManager = WorkManager.getInstance(context)

    /**
     * Démarre la synchronisation périodique (toutes les 2 heures)
     */
    fun startPeriodicSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            repeatInterval = 2,
            repeatIntervalTimeUnit = TimeUnit.HOURS,
            flexTimeInterval = 30,
            flexTimeIntervalUnit = TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                WorkRequest.MIN_BACKOFF_MILLIS,
                TimeUnit.MILLISECONDS
            )
            .addTag(SyncWorker.WORK_NAME)
            .build()

        workManager.enqueueUniquePeriodicWork(
            SyncWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }

    /**
     * Déclenche une synchronisation immédiate
     */
    fun syncNow() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(constraints)
            .addTag("${SyncWorker.WORK_NAME}_immediate")
            .build()

        workManager.enqueue(syncRequest)
    }

    /**
     * Annule toutes les synchronisations
     */
    fun cancelSync() {
        workManager.cancelAllWorkByTag(SyncWorker.WORK_NAME)
    }

    /**
     * Obtient le statut de la synchronisation
     */
    fun getSyncStatus() = workManager.getWorkInfosByTagLiveData(SyncWorker.WORK_NAME)
}
