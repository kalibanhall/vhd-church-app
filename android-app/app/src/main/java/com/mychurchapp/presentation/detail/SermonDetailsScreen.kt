package com.mychurchapp.presentation.detail

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SermonDetailsScreen(
    sermonId: String,
    onBackClick: () -> Unit
) {
    var isPlaying by remember { mutableStateOf(false) }
    var currentPosition by remember { mutableLongStateOf(0L) }
    var duration by remember { mutableLongStateOf(0L) }
    var isFullscreen by remember { mutableStateOf(false) }
    
    val context = LocalContext.current
    
    // Simuler les données du sermon
    val sermon = remember {
        Sermon(
            id = sermonId,
            title = "La foi qui déplace les montagnes",
            description = "Dans ce message puissant, le pasteur nous enseigne comment développer une foi inébranlable qui peut déplacer les montagnes dans notre vie. À travers des exemples bibliques et des témoignages contemporains, découvrez les clés pour une foi victorieuse.",
            pastorName = "Pasteur Jean KALOMBO",
            appointmentDate = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
            videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbnailUrl = null,
            duration = 2700, // 45 minutes
            views = 1250,
            likes = 342,
            category = "Enseignement",
            tags = listOf("Foi", "Miracle", "Prière")
        )
    }
    
    // Créer ExoPlayer
    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            val mediaItem = MediaItem.fromUri(sermon.videoUrl)
            setMediaItem(mediaItem)
            prepare()
            
            addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(playbackState: Int) {
                    when (playbackState) {
                        Player.STATE_READY -> {
                            duration = this@apply.duration
                        }
                        Player.STATE_ENDED -> {
                            isPlaying = false
                        }
                    }
                }
                
                override fun onIsPlayingChanged(playing: Boolean) {
                    isPlaying = playing
                }
            })
        }
    }
    
    // Nettoyer le player quand le composable est détruit
    DisposableEffect(Unit) {
        onDispose {
            exoPlayer.release()
        }
    }
    
    // Mettre à jour la position
    LaunchedEffect(isPlaying) {
        while (isPlaying) {
            currentPosition = exoPlayer.currentPosition
            kotlinx.coroutines.delay(1000)
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Détails du sermon") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Partager */ }) {
                        Icon(Icons.Default.Share, "Partager")
                    }
                    IconButton(onClick = { /* Télécharger */ }) {
                        Icon(Icons.Default.Download, "Télécharger")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Lecteur vidéo
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(if (isFullscreen) 400.dp else 240.dp)
                    .background(Color.Black)
            ) {
                AndroidView(
                    factory = { ctx ->
                        PlayerView(ctx).apply {
                            player = exoPlayer
                            useController = true
                            layoutParams = FrameLayout.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
            
            // Informations du sermon
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // title
                Text(
                    text = sermon.title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Pasteur et date
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            tint = Color(0xFF3B82F6),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = sermon.pastorName,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFF6B7280)
                        )
                    }
                    
                    Text(
                        text = formatDate(sermon.appointmentDate),
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF9CA3AF)
                    )
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Statistiques
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Vues
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Visibility,
                            contentDescription = null,
                            tint = Color(0xFF6B7280),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${sermon.views} vues",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                    }
                    
                    // J'aime
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.ThumbUp,
                            contentDescription = null,
                            tint = Color(0xFF6B7280),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${sermon.likes} j'aime",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                    }
                    
                    // Durée
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Schedule,
                            contentDescription = null,
                            tint = Color(0xFF6B7280),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = formatDuration(sermon.duration),
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // J'aime
                    OutlinedButton(
                        onClick = { /* Liker */ },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.ThumbUp, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("J'aime")
                    }
                    
                    // Télécharger
                    OutlinedButton(
                        onClick = { /* Télécharger */ },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Télécharger")
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Divider()
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Description
                Text(
                    text = "Description",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = sermon.notes,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF4B5563),
                    lineHeight = MaterialTheme.typography.bodyMedium.fontSize.value.dp * 1.5f
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Catégorie et tags
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Catégorie
                    AssistChip(
                        onClick = { },
                        label = { Text(sermon.category) },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Category,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    )
                    
                    // Tags
                    sermon.tags.forEach { tag ->
                        AssistChip(
                            onClick = { },
                            label = { Text(tag) }
                        )
                    }
                }
            }
        }
    }
}

// Modèle de données
data class Sermon(
    val id: String,
    val title: String,
    val notes: String,
    val pastorName: String,
    val appointmentDate: Long,
    val videoUrl: String,
    val thumbnailUrl: String?,
    val duration: Int,
    val views: Int,
    val likes: Int,
    val category: String,
    val tags: List<String>
)

// Fonctions utilitaires
private fun formatDate(timestamp: Long): String {
    val sdf = SimpleDateFormat("dd MMMM yyyy", Locale.FRENCH)
    return sdf.format(Date(timestamp))
}

private fun formatDuration(seconds: Int): String {
    val hours = seconds / 3600
    val minutes = (seconds % 3600) / 60
    return if (hours > 0) {
        "${hours}h ${minutes}min"
    } else {
        "${minutes}min"
    }
}
