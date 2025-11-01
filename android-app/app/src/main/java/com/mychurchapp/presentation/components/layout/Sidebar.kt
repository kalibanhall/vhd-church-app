/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID - SIDEBAR COMPONENT
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Navigation latérale de l'application - EXACTEMENT comme le web
 * Correspond à: src/components/layout/Sidebar.tsx
 * 
 * Fonctionnalités:
 * - Logo VHD avec titre d'espace selon le rôle
 * - Menu principal (Accueil, Prédications, Soutien, etc.)
 * - Tableau de bord pour ADMIN et PASTOR (menu déroulant)
 * - Navigation contextuelle selon le rôle
 * - Sidebar collapsible (repliée par défaut comme Gmail)
 * 
 * =============================================================================
 */

package com.mychurchapp.presentation.components.layout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.mychurchapp.domain.model.User

/**
 * Élément de menu
 */
data class MenuItem(
    val id: String,
    val label: String,
    val icon: ImageVector,
    val badgeCount: Int = 0
)

/**
 * Composant Sidebar - Navigation latérale
 * Exactement comme Sidebar.tsx dans le web
 */
@Composable
fun Sidebar(
    activeTab: String,
    onTabChange: (String) -> Unit,
    user: User,
    isCollapsed: Boolean = true,
    onToggleCollapse: () -> Unit,
    modifier: Modifier = Modifier
) {
    // État du menu déroulant Tableau de bord
    var isDashboardOpen by remember { mutableStateOf(true) }

    // Menu principal accessible à tous - EXACTEMENT comme dans le web
    val userMenuItems = listOf(
        MenuItem("home", "Accueil", Icons.Filled.Home),
        MenuItem("sermons", "Prédications", Icons.Filled.PlayArrow),
        MenuItem("donations", "Soutien à l'œuvre", Icons.Filled.AccountBalance),
        MenuItem("appointments", "Rendez-vous", Icons.Filled.CalendarToday),
        MenuItem("polls", "Sondages", Icons.Filled.HowToVote),
        MenuItem("prayers", "Prières", Icons.Filled.FavoriteBorder),
        MenuItem("testimonies", "Témoignages", Icons.Filled.Book),
        MenuItem("chat", "Discussion", Icons.Filled.Chat, badgeCount = 3)
    )

    // Sous-menu Tableau de bord selon le rôle - EXACTEMENT comme dans le web
    val dashboardSubItems = if (user.role == "PASTOR") {
        // Pasteurs : accès uniquement au gestionnaire de rendez-vous
        listOf(
            MenuItem("pastor-appointments", "Gestion rendez-vous", Icons.Filled.PersonAdd)
        )
    } else {
        // Admins : accès complet à tous les outils de gestion
        listOf(
            MenuItem("admin", "Vue d'ensemble", Icons.Filled.Settings),
            MenuItem("analytics", "Analytics", Icons.Filled.BarChart),
            MenuItem("members", "Gestion des membres", Icons.Filled.People),
            MenuItem("events", "Gestion d'événements", Icons.Filled.Event),
            MenuItem("polls-admin", "Gestion des sondages", Icons.Filled.HowToVote),
            MenuItem("notifications", "Gestion des notifications", Icons.Filled.Notifications),
            MenuItem("validate-testimonies", "Validation témoignages", Icons.Filled.CheckCircle),
            MenuItem("pastor-appointments", "Gestion rendez-vous", Icons.Filled.PersonAdd)
        )
    }

    // Vérifier si l'utilisateur est admin ou pasteur
    val isAdminUser = user.role == "ADMIN" || user.role == "PASTOR"

    // Titre de l'espace selon le rôle - EXACTEMENT comme dans le web
    val spaceTitle = when (user.role) {
        "ADMIN" -> "Espace Admin"
        "PASTOR" -> "Espace Pasteur"
        "FIDELE" -> "Espace Fidèle"
        else -> "Espace Vaillants"
    }

    // Titre du tableau de bord selon le rôle
    val dashboardTitle = when (user.role) {
        "ADMIN" -> "Tableau de Bord Admin"
        "PASTOR" -> "Tableau de Bord Pasteur"
        else -> "Tableau de Bord"
    }

    // Vérifier si on est dans l'espace admin
    val adminOnlyTabs = listOf("admin", "analytics", "members", "events", "polls-admin", "notifications", "validate-testimonies")
    val isInAdminSpace = adminOnlyTabs.contains(activeTab)

    // Vérifier si on est dans l'espace de travail spécialisé
    val isInSpecializedSpace = if (user.role == "ADMIN") {
        isInAdminSpace || activeTab == "pastor-appointments"
    } else {
        activeTab == "pastor-appointments"
    }

    Box(modifier = modifier) {
        // Overlay pour mobile quand la sidebar est ouverte - EXACTEMENT comme le web
        if (!isCollapsed && !isInSpecializedSpace) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f))
                    .clickable(onClick = onToggleCollapse)
            )
        }

        // Sidebar principale
        Surface(
            modifier = Modifier
                .fillMaxHeight()
                .width(if (isCollapsed) 0.dp else 256.dp),
            color = Color.Transparent
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF1E3A8A), // blue-900
                                Color(0xFF1E40AF)  // blue-800
                            )
                        )
                    )
            ) {
                // Header avec Logo - EXACTEMENT comme le web
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color.Transparent
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp)
                            .border(
                                width = 1.dp,
                                color = Color(0xFF1D4ED8), // blue-700
                                shape = RoundedCornerShape(0.dp)
                            )
                            .padding(bottom = 12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Logo et titre
                            Column(
                                modifier = Modifier.weight(1f),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                // Logo VHD
                                AsyncImage(
                                    model = "/images/logos/vhd-logo.jpg",
                                    contentDescription = "Logo VHD",
                                    modifier = Modifier
                                        .size(50.dp)
                                        .clip(CircleShape)
                                        .border(1.dp, Color(0xFFBFDBFE), CircleShape),
                                    contentScale = ContentScale.Crop
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = "Ministères VHD",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        fontWeight = FontWeight.Bold
                                    ),
                                    color = Color.White,
                                    textAlign = TextAlign.Center
                                )

                                Text(
                                    text = spaceTitle,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFFBFDBFE), // blue-200
                                    textAlign = TextAlign.Center
                                )
                            }

                            // Bouton fermeture
                            IconButton(
                                onClick = onToggleCollapse,
                                modifier = Modifier.padding(start = 8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Close,
                                    contentDescription = "Masquer le menu",
                                    tint = Color(0xFFBFDBFE),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }

                // Navigation - EXACTEMENT comme le web
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Menu utilisateur normal - Affiché uniquement si PAS dans l'espace spécialisé
                    if (!isInSpecializedSpace) {
                        items(userMenuItems) { item ->
                            NavigationItem(
                                item = item,
                                isActive = activeTab == item.id,
                                onClick = { onTabChange(item.id) }
                            )
                        }

                        // Section Tableau de bord pour les utilisateurs admin/pastor
                        if (isAdminUser) {
                            item {
                                Spacer(modifier = Modifier.height(16.dp))

                                // Bouton Tableau de Bord avec dropdown
                                Surface(
                                    modifier = Modifier.fillMaxWidth(),
                                    color = Color.Transparent,
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Column {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(8.dp))
                                                .clickable { isDashboardOpen = !isDashboardOpen }
                                                .padding(horizontal = 16.dp, vertical = 12.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Row(
                                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Filled.Settings,
                                                    contentDescription = null,
                                                    tint = Color(0xFFBFDBFE),
                                                    modifier = Modifier.size(20.dp)
                                                )
                                                Text(
                                                    text = "Tableau de Bord",
                                                    style = MaterialTheme.typography.bodyMedium.copy(
                                                        fontWeight = FontWeight.Medium
                                                    ),
                                                    color = Color(0xFFBFDBFE)
                                                )
                                            }

                                            Icon(
                                                imageVector = if (isDashboardOpen) Icons.Filled.KeyboardArrowDown else Icons.Filled.KeyboardArrowRight,
                                                contentDescription = null,
                                                tint = Color(0xFFBFDBFE),
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }

                                        // Sous-menu Tableau de bord
                                        if (isDashboardOpen) {
                                            Column(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(start = 16.dp, top = 8.dp),
                                                verticalArrangement = Arrangement.spacedBy(4.dp)
                                            ) {
                                                dashboardSubItems.forEach { subItem ->
                                                    SubNavigationItem(
                                                        item = subItem,
                                                        isActive = activeTab == subItem.id,
                                                        onClick = { onTabChange(subItem.id) }
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Interface spécialisée - Tableau de bord admin OU pasteur
                    if (isAdminUser && isInSpecializedSpace) {
                        item {
                            // Titre Tableau de Bord avec icône
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.Settings,
                                        contentDescription = null,
                                        tint = Color(0xFFBFDBFE),
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Text(
                                        text = dashboardTitle,
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            fontWeight = FontWeight.Medium
                                        ),
                                        color = Color(0xFFBFDBFE)
                                    )
                                }

                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    // Bouton retour pour les pasteurs
                                    if (user.role == "PASTOR" && activeTab == "pastor-appointments") {
                                        IconButton(
                                            onClick = { onTabChange("home") },
                                            modifier = Modifier.size(16.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Filled.Home,
                                                contentDescription = "Retour au menu principal",
                                                tint = Color(0xFFBFDBFE),
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }

                                    Icon(
                                        imageVector = Icons.Filled.KeyboardArrowDown,
                                        contentDescription = null,
                                        tint = Color(0xFFBFDBFE),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))
                        }

                        // Liste des fonctions admin - Style direct comme dans le web
                        items(dashboardSubItems) { subItem ->
                            NavigationItem(
                                item = subItem,
                                isActive = activeTab == subItem.id,
                                onClick = { onTabChange(subItem.id) }
                            )
                        }
                    }
                }

                // Footer - EXACTEMENT comme le web
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color.Transparent
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(
                                width = 1.dp,
                                color = Color(0xFF1D4ED8),
                                shape = RoundedCornerShape(0.dp)
                            )
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Version 1.0.3",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFBFDBFE),
                            textAlign = TextAlign.Center
                        )
                        Text(
                            text = "© 2025 My Church App",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFBFDBFE),
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }
    }
}

/**
 * Élément de navigation principal
 */
@Composable
private fun NavigationItem(
    item: MenuItem,
    isActive: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = if (isActive) Color(0xFF1D4ED8) else Color.Transparent,
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .clickable(onClick = onClick)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = null,
                    tint = if (isActive) Color.White else Color(0xFFBFDBFE),
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = item.label,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Medium
                    ),
                    color = if (isActive) Color.White else Color(0xFFBFDBFE)
                )
            }

            // Badge pour chat
            if (item.badgeCount > 0) {
                Surface(
                    shape = CircleShape,
                    color = Color(0xFFEF4444)
                ) {
                    Text(
                        text = item.badgeCount.toString(),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

/**
 * Élément de sous-navigation (pour Tableau de bord)
 */
@Composable
private fun SubNavigationItem(
    item: MenuItem,
    isActive: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = if (isActive) Color(0xFF2563EB) else Color.Transparent,
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .clickable(onClick = onClick)
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = if (isActive) Color.White else Color(0xFFBFDBFE),
                modifier = Modifier.size(16.dp)
            )
            Text(
                text = item.label,
                style = MaterialTheme.typography.bodySmall,
                color = if (isActive) Color.White else Color(0xFFBFDBFE)
            )
        }
    }
}
