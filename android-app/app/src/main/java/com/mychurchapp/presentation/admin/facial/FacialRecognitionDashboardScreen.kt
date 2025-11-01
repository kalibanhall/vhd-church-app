package com.mychurchapp.presentation.admin.facial

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FacialRecognitionDashboardScreen(
    onBackClick: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Sessions Actives", "Statistiques", "Caméras")
    
    // Données simulées
    val activeSessions = remember {
        listOf(
            AttendanceSession(
                id = "1",
                sessionName = "Culte du Dimanche",
                sessionType = "CULTE",
                sessionDate = System.currentTimeMillis(),
                startTime = "10:00",
                status = "ACTIVE",
                expectedAttendees = 150,
                actualAttendees = 87,
                location = "Salle principale"
            ),
            AttendanceSession(
                id = "2",
                sessionName = "Réunion des Jeunes",
                sessionType = "REUNION",
                sessionDate = System.currentTimeMillis(),
                startTime = "15:00",
                status = "ACTIVE",
                expectedAttendees = 50,
                actualAttendees = 23,
                location = "Salle annexe"
            )
        )
    }
    
    val recentCheckIns = remember {
        listOf(
            CheckIn(
                userName = "Marie MUKENDI",
                userPhoto = "https://i.pravatar.cc/150?img=5",
                checkInTime = System.currentTimeMillis() - (5 * 60 * 1000),
                method = "FACIAL_RECOGNITION",
                confidence = 0.95
            ),
            CheckIn(
                userName = "Jean KALOMBO",
                userPhoto = "https://i.pravatar.cc/150?img=12",
                checkInTime = System.currentTimeMillis() - (10 * 60 * 1000),
                method = "FACIAL_RECOGNITION",
                confidence = 0.92
            ),
            CheckIn(
                userName = "Sarah TSHIANI",
                userPhoto = "https://i.pravatar.cc/150?img=9",
                checkInTime = System.currentTimeMillis() - (15 * 60 * 1000),
                method = "QR_CODE",
                confidence = null
            )
        )
    }
    
    val cameras = remember {
        listOf(
            Camera(
                id = "1",
                name = "Caméra Principale",
                location = "Entrée Principale",
                type = "FIXED",
                isActive = true,
                lastPing = System.currentTimeMillis() - (30 * 1000)
            ),
            Camera(
                id = "2",
                name = "Tablette Accueil",
                location = "Accueil",
                type = "TABLET",
                isActive = true,
                lastPing = System.currentTimeMillis() - (10 * 1000)
            ),
            Camera(
                id = "3",
                name = "Mobile Admin",
                location = "Mobile",
                type = "MOBILE",
                isActive = false,
                lastPing = System.currentTimeMillis() - (10 * 60 * 1000)
            )
        )
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Reconnaissance Faciale") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Rafraîchir */ }) {
                        Icon(Icons.Default.Refresh, "Rafraîchir")
                    }
                    IconButton(onClick = { /* Paramètres */ }) {
                        Icon(Icons.Default.Settings, "Paramètres")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* Créer nouvelle session */ },
                containerColor = Color(0xFF3B82F6)
            ) {
                Icon(Icons.Default.Add, "Nouvelle session", tint = Color.White)
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }
            
            when (selectedTab) {
                0 -> ActiveSessionsTab(
                    sessions = activeSessions,
                    recentCheckIns = recentCheckIns
                )
                1 -> StatisticsTab()
                2 -> CamerasTab(cameras = cameras)
            }
        }
    }
}

@Composable
fun ActiveSessionsTab(
    sessions: List<AttendanceSession>,
    recentCheckIns: List<CheckIn>
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Sessions actives
        item {
            Text(
                text = "Sessions actives (${sessions.size})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
        
        items(sessions) { session ->
            SessionCard(session)
        }
        
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Pointages récents",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
        
        items(recentCheckIns) { checkIn ->
            CheckInCard(checkIn)
        }
    }
}

@Composable
fun SessionCard(session: AttendanceSession) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = session.sessionName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Schedule,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = Color(0xFF6B7280)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = session.startTime,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            Icons.Default.LocationOn,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = Color(0xFF6B7280)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = session.location,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                    }
                }
                
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF10B981).copy(alpha = 0.1f)
                ) {
                    Text(
                        text = "ACTIVE",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF10B981),
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Barre de progression
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Présences: ${session.actualAttendees} / ${session.expectedAttendees}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "${(session.actualAttendees.toFloat() / session.expectedAttendees * 100).toInt()}%",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF3B82F6),
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = session.actualAttendees.toFloat() / session.expectedAttendees,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = Color(0xFF3B82F6),
                    trackColor = Color(0xFFE5E7EB)
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { /* Voir détails */ },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Voir détails")
                }
                Button(
                    onClick = { /* Arrêter session */ },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFEF4444)
                    )
                ) {
                    Icon(Icons.Default.Stop, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Arrêter")
                }
            }
        }
    }
}

@Composable
fun CheckInCard(checkIn: CheckIn) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = checkIn.userPhoto,
                contentDescription = null,
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = checkIn.userName,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = formatRelativeTime(checkIn.checkInTime),
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF6B7280)
                    )
                    if (checkIn.method == "FACIAL_RECOGNITION") {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF3B82F6).copy(alpha = 0.1f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.Face,
                                    contentDescription = null,
                                    tint = Color(0xFF3B82F6),
                                    modifier = Modifier.size(12.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "${(checkIn.confidence!! * 100).toInt()}%",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color(0xFF3B82F6)
                                )
                            }
                        }
                    }
                }
            }
            
            Icon(
                if (checkIn.method == "FACIAL_RECOGNITION") Icons.Default.Face else Icons.Default.QrCode,
                contentDescription = null,
                tint = if (checkIn.method == "FACIAL_RECOGNITION") Color(0xFF3B82F6) else Color(0xFF8B5CF6),
                modifier = Modifier.size(24.dp)
            )
        }
    }
}

@Composable
fun StatisticsTab() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Cartes de statistiques
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Total Présences",
                    value = "1,247",
                    icon = Icons.Default.People,
                    color = Color(0xFF3B82F6),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Aujourd'hui",
                    value = "87",
                    icon = Icons.Default.Today,
                    color = Color(0xFF10B981),
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Reconnaissance",
                    value = "92%",
                    icon = Icons.Default.Face,
                    color = Color(0xFF8B5CF6),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Confiance Moy.",
                    value = "94%",
                    icon = Icons.Default.VerifiedUser,
                    color = Color(0xFFF59E0B),
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        item {
            Text(
                text = "Top 5 Membres Assidus",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
        
        items(5) { index ->
            TopMemberCard(rank = index + 1)
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(color.copy(alpha = 0.1f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF6B7280)
            )
        }
    }
}

@Composable
fun TopMemberCard(rank: Int) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = when (rank) {
                    1 -> Color(0xFFFBBF24)
                    2 -> Color(0xFF9CA3AF)
                    3 -> Color(0xFFD97706)
                    else -> Color(0xFFE5E7EB)
                }
            ) {
                Text(
                    text = "$rank",
                    modifier = Modifier.padding(12.dp),
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            AsyncImage(
                model = "https://i.pravatar.cc/150?img=$rank",
                contentDescription = null,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Membre $rank",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${45 - rank * 3} présences",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF6B7280)
                )
            }
        }
    }
}

@Composable
fun CamerasTab(cameras: List<Camera>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Caméras (${cameras.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${cameras.count { it.isActive }} actives",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF10B981)
                )
            }
        }
        
        items(cameras) { camera ->
            CameraCard(camera)
        }
    }
}

@Composable
fun CameraCard(camera: Camera) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(
                        if (camera.isActive) Color(0xFF10B981).copy(alpha = 0.1f) else Color(0xFFEF4444).copy(alpha = 0.1f),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    when (camera.type) {
                        "FIXED" -> Icons.Default.Videocam
                        "TABLET" -> Icons.Default.Tablet
                        else -> Icons.Default.PhoneAndroid
                    },
                    contentDescription = null,
                    tint = if (camera.isActive) Color(0xFF10B981) else Color(0xFFEF4444),
                    modifier = Modifier.size(28.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = camera.name,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = camera.location,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF6B7280)
                )
                Text(
                    text = "Dernier ping: ${formatRelativeTime(camera.lastPing)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF9CA3AF)
                )
            }
            
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (camera.isActive) Color(0xFF10B981).copy(alpha = 0.1f) else Color(0xFFEF4444).copy(alpha = 0.1f)
            ) {
                Text(
                    text = if (camera.isActive) "ACTIVE" else "INACTIVE",
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (camera.isActive) Color(0xFF10B981) else Color(0xFFEF4444),
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

// Modèles de données
data class AttendanceSession(
    val id: String,
    val sessionName: String,
    val sessionType: String,
    val sessionDate: Long,
    val startTime: String,
    val status: String,
    val expectedAttendees: Int,
    val actualAttendees: Int,
    val location: String
)

data class CheckIn(
    val userName: String,
    val userPhoto: String,
    val checkInTime: Long,
    val method: String,
    val confidence: Double?
)

data class Camera(
    val id: String,
    val name: String,
    val location: String,
    val type: String,
    val isActive: Boolean,
    val lastPing: Long
)

private fun formatRelativeTime(timestamp: Long): String {
    val now = System.currentTimeMillis()
    val diff = now - timestamp
    
    val minutes = diff / (1000 * 60)
    val hours = diff / (1000 * 60 * 60)
    
    return when {
        minutes < 1 -> "À l'instant"
        minutes < 60 -> "Il y a ${minutes}min"
        hours < 24 -> "Il y a ${hours}h"
        else -> SimpleDateFormat("dd/MM HH:mm", Locale.FRENCH).format(Date(timestamp))
    }
}
