/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID - ADMIN SCREENS
 * =============================================================================
 * 
 * userId: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * notes: Écrans d'administration - Selon les fichiers web
 * 
 * =============================================================================
 */

package com.mychurchapp.presentation.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * AdminDashboard - Vue d'ensemble admin
 * Correspond à: AdminDashboard.tsx
 */
@Composable
fun AdminDashboard() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // En-tête
        item {
            Column {
                Text(
                    text = "Tableau de bord Admin",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    color = Color(0xFF111827)
                )
                Text(
                    text = "Aperçu général des activités de l'église",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color(0xFF6B7280)
                )
            }
        }

        // Cartes statistiques
        item {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.height(420.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(
                    listOf(
                        StatCard("Membres totaux", "150", Icons.Default.People, Color(0xFF3B82F6), "+5%"),
                        StatCard("Membres actifs", "142", Icons.Default.PersonAdd, Color(0xFF10B981), "+2%"),
                        StatCard("Présence aujourd'hui", "45", Icons.Default.CalendarToday, Color(0xFF8B5CF6), "+12%"),
                        StatCard("Soutien du mois", "2,450,000 CDF", Icons.Default.AttachMoney, Color(0xFFF59E0B), "+8%")
                    )
                ) { stat ->
                    AdminStatCard(stat)
                }
            }
        }

        // Activités récentes
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text(
                        text = "Activités récentes",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = Color(0xFF111827),
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        ActivityItem("👤", "Nouveau membre", "Jean Dupont s'est inscrit", "Il y a 2h")
                        ActivityItem("💰", "Nouveau don", "Offrande de 50,000 CDF", "Il y a 5h")
                        ActivityItem("📅", "Événement créé", "Culte de dimanche planifié", "Hier")
                        ActivityItem("🙏", "Nouvelle prière", "Demande de guérison", "Hier")
                    }
                }
            }
        }
    }
}

data class StatCard(
    val label: String,
    val value: String,
    val icon: ImageVector,
    val color: Color,
    val change: String
)

@Composable
private fun AdminStatCard(stat: StatCard) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White,
        shape = RoundedCornerShape(12.dp),
        shadowElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = stat.label,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6B7280)
                    )
                    Text(
                        text = stat.value,
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = Color(0xFF111827),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(top = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.TrendingUp,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = stat.change,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF10B981)
                        )
                    }
                }
                
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(stat.color.copy(alpha = 0.1f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = stat.icon,
                        contentDescription = null,
                        tint = stat.color,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun ActivityItem(emoji: String, title: String, notes: String, time: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color(0xFFF9FAFB),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = emoji, fontSize = 24.sp)
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Medium
                    ),
                    color = Color(0xFF111827)
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF6B7280)
                )
            }
            Text(
                text = time,
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF9CA3AF)
            )
        }
    }
}

@Composable
fun AnalyticsPage() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "📊 Analytics",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "📈", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Statistiques détaillées",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF111827)
                    )
                }
            }
        }
    }
}

@Composable
fun MembersManagement() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "👥 Gestion des membres",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = Color(0xFF111827)
                    )
                    Text(
                        text = "150 membres actifs",
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color(0xFF6B7280)
                    )
                }
                
                Button(
                    onClick = { },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF3B82F6)
                    )
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Ajouter")
                }
            }
        }
    }
}

@Composable
fun EventsManagement() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "📅 Gestion des événements",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827)
            )
        }
    }
}

@Composable
fun PollsManagement() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "📊 Gestion des sondages",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827)
            )
        }
    }
}

@Composable
fun NotificationsManagement() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "🔔 Gestion des notifications",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827)
            )
        }
    }
}

@Composable
fun PrayersTestimoniesValidation() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "✅ Validation témoignages",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827)
            )
        }
    }
}

@Composable
fun AppointmentsManagement() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "📅 Gestion des rendez-vous",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827)
            )
        }
    }
}
