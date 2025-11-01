package com.mychurchapp.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.mychurchapp.MainActivity
import com.mychurchapp.R
import timber.log.Timber

class ChurchMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Timber.d("FCM Token: $token")
        
        // Envoyer le token au serveur pour enregistrement
        sendTokenToServer(token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        
        Timber.d("Message reçu de: ${message.from}")
        
        // Vérifier si le message contient une notification
        message.notification?.let {
            showNotification(
                title = it.title ?: "VHD Church",
                body = it.body ?: "",
                data = message.data
            )
        }
        
        // Vérifier si le message contient des données
        if (message.data.isNotEmpty()) {
            Timber.d("Message data payload: ${message.data}")
            handleDataPayload(message.data)
        }
    }

    private fun sendTokenToServer(token: String) {
        // TODO: Implémenter l'envoi du token vers l'API
        // Utiliser le repository pour faire l'appel API
        Timber.d("Token à envoyer au serveur: $token")
    }

    private fun handleDataPayload(data: Map<String, String>) {
        val type = data["type"]
        val entityId = data["entityId"]
        
        when (type) {
            "sermon" -> {
                // Naviguer vers les détails du sermon
                Timber.d("Notification sermon: $entityId")
            }
            "event" -> {
                // Naviguer vers les détails de l'événement
                Timber.d("Notification événement: $entityId")
            }
            "appointment" -> {
                // Naviguer vers les rendez-vous
                Timber.d("Notification rendez-vous: $entityId")
            }
            "testimony" -> {
                // Naviguer vers les témoignages
                Timber.d("Notification témoignage: $entityId")
            }
            "prayer" -> {
                // Naviguer vers les prières
                Timber.d("Notification prière: $entityId")
            }
            else -> {
                Timber.d("Type de notification inconnu: $type")
            }
        }
    }

    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Créer le canal de notification pour Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "VHD Church Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications de l'application VHD Church"
                enableLights(true)
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
        
        // Intent pour ouvrir l'application
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            
            // Ajouter les données pour le deep linking
            data["type"]?.let { putExtra("notification_type", it) }
            data["entityId"]?.let { putExtra("entity_id", it) }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Construire la notification
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()
        
        notificationManager.notify(NOTIFICATION_ID++, notification)
    }

    companion object {
        private const val CHANNEL_ID = "vhd_church_channel"
        private var NOTIFICATION_ID = 1000
    }
}
