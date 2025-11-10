package com.mychurchapp.presentation.detail

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventDetailsScreen(
    eventId: String,
    onBackClick: () -> Unit
) {
    // Simuler les données de l'événement
    val event = remember {
        Event(
            id = eventId,
            title = "Conférence Annuelle 2025",
            description = "Rejoignez-nous pour notre conférence annuelle sur le thème 'Renouvelé dans sa Présence'. Trois jours d'enseignements puissants, de louanges inspirantes et de communion fraternelle.\n\nProgramme:\n- Jour 1: Sessions de louange et intercession\n- Jour 2: Enseignements bibliques approfondis\n- Jour 3: Miracles et guérisons\n\nOrateurs invités:\n- Pasteur Jean KALOMBO\n- Dr. Marie MUKENDI\n- Évangéliste Pierre TSHIANI",
            type = "CONFERENCE",
            startDate = System.currentTimeMillis() + (30 * 24 * 60 * 60 * 1000), // Dans 30 jours
            endDate = System.currentTimeMillis() + (33 * 24 * 60 * 60 * 1000), // 3 jours
            location = "Centre de Convention VHD, Avenue de l'Église, Kinshasa",
            organizerName = "Pasteur Jean KALOMBO",
            maxAttendees = 500,
            currentAttendees = 342,
            registrationRequired = true,
            imageUrl = "https://picsum.photos/800/400",
            status = "UPCOMING"
        )
    }
    
    var isRegistered by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Détails de l'événement") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Partager */ }) {
                        Icon(Icons.Default.Share, "Partager")
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
            // Image de l'événement
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
            ) {
                Image(
                    painter = rememberAsyncImagePainter(event.imageUrl),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                
                // Gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    Color.Black.copy(alpha = 0.7f)
                                )
                            )
                        )
                )
                
                // Badge de status
                Surface(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp),
                    shape = RoundedCornerShape(20.dp),
                    color = when (event.status) {
                        "UPCOMING" -> Color(0xFF10B981)
                        "ONGOING" -> Color(0xFFF59E0B)
                        "COMPLETED" -> Color(0xFF6B7280)
                        else -> Color(0xFFEF4444)
                    }
                ) {
                    Text(
                        text = when (event.status) {
                            "UPCOMING" -> "À venir"
                            "ONGOING" -> "En cours"
                            "COMPLETED" -> "Terminé"
                            else -> "Annulé"
                        },
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White
                    )
                }
            }
            
            // content
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // title
                Text(
                    text = event.title,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Date
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.CalendarToday,
                        contentDescription = null,
                        tint = Color(0xFF3B82F6),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${formatDate(event.startDate)} - ${formatDate(event.endDate ?: event.startDate)}",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Lieu
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = Color(0xFFEF4444),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = event.location,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6B7280)
                    )
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Organisateur
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        tint = Color(0xFF8B5CF6),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Organisé par ${event.organizerName}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6B7280)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Participants
                if (event.maxAttendees != null) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFFF3F4F6)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.People,
                                    contentDescription = null,
                                    tint = Color(0xFF3B82F6)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = "${event.currentAttendees} / ${event.maxAttendees} participants",
                                        style = MaterialTheme.typography.bodyLarge,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "${event.maxAttendees - event.currentAttendees} places restantes",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF6B7280)
                                    )
                                }
                            }
                        }
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
                    text = event.notes,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF4B5563),
                    lineHeight = MaterialTheme.typography.bodyMedium.fontSize.value.dp * 1.6f
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Bouton d'inscription
                if (event.registrationRequired && event.status == "UPCOMING") {
                    Button(
                        onClick = { isRegistered = !isRegistered },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isRegistered) Color(0xFF10B981) else Color(0xFF3B82F6)
                        )
                    ) {
                        Icon(
                            if (isRegistered) Icons.Default.CheckCircle else Icons.Default.Event,
                            contentDescription = null
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isRegistered) "Inscription confirmée" else "S'inscrire à l'événement",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

// Modèle de données
data class Event(
    val id: String,
    val title: String,
    val notes: String,
    val type: String,
    val startDate: Long,
    val endDate: Long?,
    val location: String,
    val organizerName: String,
    val maxAttendees: Int?,
    val currentAttendees: Int,
    val registrationRequired: Boolean,
    val imageUrl: String?,
    val status: String
)

private fun formatDate(timestamp: Long): String {
    val sdf = SimpleDateFormat("dd MMM yyyy", Locale.FRENCH)
    return sdf.format(Date(timestamp))
}
