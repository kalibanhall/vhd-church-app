package com.mychurchapp.presentation.detail

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
fun MemberDetailsScreen(
    memberId: String,
    onBackClick: () -> Unit,
    isAdmin: Boolean = false
) {
    // Simuler les données du membre
    val member = remember {
        Member(
            id = memberId,
            firstName = "Marie",
            lastName = "MUKENDI",
            email = "marie.mukendi@example.com",
            phone = "+243 900 000 001",
            address = "Avenue de la Paix, Kinshasa",
            dateOfBirth = System.currentTimeMillis() - (30 * 365 * 24 * 60 * 60 * 1000L), // 30 ans
            gender = "Femme",
            role = "MEMBER",
            status = "ACTIVE",
            profilePictureUrl = "https://i.pravatar.cc/300?img=5",
            joinDate = System.currentTimeMillis() - (3 * 365 * 24 * 60 * 60 * 1000L), // 3 ans
            baptismDate = System.currentTimeMillis() - (2 * 365 * 24 * 60 * 60 * 1000L),
            department = "Chorale",
            skills = listOf("Chant", "Piano", "Direction musicale"),
            emergencyContact = "Jean MUKENDI",
            emergencyPhone = "+243 900 000 002"
        )
    }
    
    var showEditDialog by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profil du membre") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                },
                actions = {
                    if (isAdmin) {
                        IconButton(onClick = { showEditDialog = true }) {
                            Icon(Icons.Default.Edit, "Modifier")
                        }
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
            // En-tête avec photo
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        androidx.compose.ui.graphics.Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFFDEEBFF),
                                Color(0xFFF3F4F6)
                            )
                        )
                    )
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    AsyncImage(
                        model = member.profilePictureUrl,
                        contentDescription = null,
                        modifier = Modifier
                            .size(120.dp)
                            .clip(CircleShape)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "${member.firstName} ${member.lastName}",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = when (member.status) {
                            "ACTIVE" -> Color(0xFFDCFCE7)
                            "INACTIVE" -> Color(0xFFFEE2E2)
                            else -> Color(0xFFF3F4F6)
                        }
                    ) {
                        Text(
                            text = when (member.status) {
                                "ACTIVE" -> "Actif"
                                "INACTIVE" -> "Inactif"
                                else -> "Suspendu"
                            },
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.labelMedium,
                            color = when (member.status) {
                                "ACTIVE" -> Color(0xFF10B981)
                                "INACTIVE" -> Color(0xFFEF4444)
                                else -> Color(0xFF6B7280)
                            }
                        )
                    }
                }
            }
            
            // Informations personnelles
            Column(modifier = Modifier.padding(16.dp)) {
                SectionTitle("Informations personnelles")
                
                InfoCard {
                    InfoRow(
                        icon = Icons.Default.Email,
                        label = "Email",
                        value = member.email,
                        iconColor = Color(0xFF3B82F6)
                    )
                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                    InfoRow(
                        icon = Icons.Default.Phone,
                        label = "Téléphone",
                        value = member.phone,
                        iconColor = Color(0xFF10B981)
                    )
                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                    InfoRow(
                        icon = Icons.Default.LocationOn,
                        label = "Adresse",
                        value = member.address,
                        iconColor = Color(0xFFEF4444)
                    )
                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                    InfoRow(
                        icon = Icons.Default.Cake,
                        label = "Date de naissance",
                        value = formatDate(member.dateOfBirth),
                        iconColor = Color(0xFFF59E0B)
                    )
                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                    InfoRow(
                        icon = Icons.Default.Person,
                        label = "Genre",
                        value = member.gender,
                        iconColor = Color(0xFF8B5CF6)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Informations de l'église
                SectionTitle("Informations de l'église")
                
                InfoCard {
                    InfoRow(
                        icon = Icons.Default.CalendarToday,
                        label = "Date d'adhésion",
                        value = formatDate(member.joinDate),
                        iconColor = Color(0xFF3B82F6)
                    )
                    member.baptismDate?.let {
                        Divider(modifier = Modifier.padding(vertical = 12.dp))
                        InfoRow(
                            icon = Icons.Default.WaterDrop,
                            label = "Date de baptême",
                            value = formatDate(it),
                            iconColor = Color(0xFF06B6D4)
                        )
                    }
                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                    InfoRow(
                        icon = Icons.Default.Group,
                        label = "Département",
                        value = member.department ?: "Aucun",
                        iconColor = Color(0xFF8B5CF6)
                    )
                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                    InfoRow(
                        icon = Icons.Default.AdminPanelSettings,
                        label = "Rôle",
                        value = when (member.userRole) {
                            "ADMIN" -> "Administrateur"
                            "PASTOR" -> "Pasteur"
                            else -> "Membre"
                        },
                        iconColor = Color(0xFFF59E0B)
                    )
                }
                
                // Compétences
                if (member.skills.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(16.dp))
                    SectionTitle("Compétences")
                    
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = Color.White
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            member.skills.forEach { skill ->
                                AssistChip(
                                    onClick = { },
                                    label = { Text(skill) }
                                )
                            }
                        }
                    }
                }
                
                // Contact d'urgence
                Spacer(modifier = Modifier.height(16.dp))
                SectionTitle("Contact d'urgence")
                
                InfoCard {
                    InfoRow(
                        icon = Icons.Default.PersonPin,
                        label = "Nom",
                        value = member.emergencyContact ?: "Non renseigné",
                        iconColor = Color(0xFFEF4444)
                    )
                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                    InfoRow(
                        icon = Icons.Default.Phone,
                        label = "Téléphone",
                        value = member.emergencyPhone ?: "Non renseigné",
                        iconColor = Color(0xFFEF4444)
                    )
                }
                
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(bottom = 12.dp)
    )
}

@Composable
fun InfoCard(content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            content()
        }
    }
}

@Composable
fun InfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    iconColor: Color
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            icon,
            contentDescription = null,
            tint = iconColor,
            modifier = Modifier.size(20.dp)
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF6B7280)
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF1F2937),
                fontWeight = FontWeight.Medium
            )
        }
    }
}

// Modèle de données
data class Member(
    val id: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String,
    val address: String,
    val dateOfBirth: Long,
    val gender: String,
    val role: String,
    val status: String,
    val profilePictureUrl: String?,
    val joinDate: Long,
    val baptismDate: Long?,
    val department: String?,
    val skills: List<String>,
    val emergencyContact: String?,
    val emergencyPhone: String?
)

private fun formatDate(timestamp: Long): String {
    val sdf = SimpleDateFormat("dd MMMM yyyy", Locale.FRENCH)
    return sdf.format(Date(timestamp))
}
