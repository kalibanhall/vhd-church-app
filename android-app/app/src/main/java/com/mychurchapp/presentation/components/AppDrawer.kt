package com.mychurchapp.presentation.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.AsyncImage

/**
 * Navigation Drawer complète avec tous les modules
 */
@Composable
fun AppDrawer(
    navController: NavController,
    currentRoute: String?,
    userPhotoUrl: String?,
    userName: String,
    userRole: String,
    onCloseDrawer: () -> Unit
) {
    ModalDrawerSheet {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(vertical = 16.dp)
        ) {
            // Header avec profil utilisateur
            DrawerHeader(
                photoUrl = userPhotoUrl,
                name = userName,
                role = userRole,
                onProfileClick = {
                    navController.navigate("profile")
                    onCloseDrawer()
                }
            )

            Divider(modifier = Modifier.padding(vertical = 8.dp))

            // Menu principal
            DrawerMenuItem(
                icon = Icons.Default.Dashboard,
                label = "Tableau de bord",
                selected = currentRoute == "dashboard",
                onClick = {
                    navController.navigate("dashboard")
                    onCloseDrawer()
                }
            )

            Divider(modifier = Modifier.padding(vertical = 4.dp))

            // Section Membres & Dons
            DrawerSectionTitle("Membres & Finances")
            
            DrawerMenuItem(
                icon = Icons.Default.People,
                label = "Membres",
                selected = currentRoute == "members",
                onClick = {
                    navController.navigate("members")
                    onCloseDrawer()
                }
            )

            DrawerMenuItem(
                icon = Icons.Default.AttachMoney,
                label = "Dons & Offrandes",
                selected = currentRoute == "donations",
                onClick = {
                    navController.navigate("donations")
                    onCloseDrawer()
                }
            )

            Divider(modifier = Modifier.padding(vertical = 4.dp))

            // Section Événements & Cultes
            DrawerSectionTitle("Événements & Cultes")

            DrawerMenuItem(
                icon = Icons.Default.Event,
                label = "Événements",
                selected = currentRoute == "events",
                onClick = {
                    navController.navigate("events")
                    onCloseDrawer()
                }
            )

            DrawerMenuItem(
                icon = Icons.Default.MusicNote,
                label = "Prédications",
                selected = currentRoute == "sermons",
                onClick = {
                    navController.navigate("sermons")
                    onCloseDrawer()
                }
            )

            DrawerMenuItem(
                icon = Icons.Default.EventNote,
                label = "Rendez-vous",
                selected = currentRoute == "appointments",
                onClick = {
                    navController.navigate("appointments")
                    onCloseDrawer()
                }
            )

            Divider(modifier = Modifier.padding(vertical = 4.dp))

            // Section Spiritualité
            DrawerSectionTitle("Vie Spirituelle")

            DrawerMenuItem(
                icon = Icons.Default.Favorite,
                label = "Demandes de prières",
                selected = currentRoute == "prayers",
                onClick = {
                    navController.navigate("prayers")
                    onCloseDrawer()
                }
            )

            DrawerMenuItem(
                icon = Icons.Default.Star,
                label = "Témoignages",
                selected = currentRoute == "testimonies",
                onClick = {
                    navController.navigate("testimonies")
                    onCloseDrawer()
                }
            )

            Divider(modifier = Modifier.padding(vertical = 4.dp))

            // Section Communication
            DrawerSectionTitle("Communication")

            DrawerMenuItem(
                icon = Icons.Default.Chat,
                label = "Messages",
                selected = currentRoute == "chat",
                onClick = {
                    navController.navigate("chat")
                    onCloseDrawer()
                }
            )

            DrawerMenuItem(
                icon = Icons.Default.Notifications,
                label = "Notifications",
                selected = currentRoute == "notifications",
                onClick = {
                    navController.navigate("notifications")
                    onCloseDrawer()
                }
            )

            Divider(modifier = Modifier.padding(vertical = 4.dp))

            // Section Admin (visible seulement pour ADMIN/PASTEUR/OUVRIER)
            if (userRole in listOf("ADMIN", "PASTEUR", "OUVRIER")) {
                DrawerSectionTitle("Administration")

                DrawerMenuItem(
                    icon = Icons.Default.Analytics,
                    label = "Statistiques",
                    selected = currentRoute == "analytics",
                    onClick = {
                        // TODO: Navigate to analytics
                        onCloseDrawer()
                    }
                )

                DrawerMenuItem(
                    icon = Icons.Default.Settings,
                    label = "Paramètres",
                    selected = currentRoute == "settings",
                    onClick = {
                        // TODO: Navigate to settings
                        onCloseDrawer()
                    }
                )

                // Menu reconnaissance faciale (ADMIN uniquement)
                if (userRole == "ADMIN") {
                    DrawerMenuItem(
                        icon = Icons.Default.Face,
                        label = "Reconnaissance faciale",
                        selected = currentRoute == "facial_recognition",
                        onClick = {
                            // TODO: Navigate to facial recognition
                            onCloseDrawer()
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Divider(modifier = Modifier.padding(vertical = 8.dp))

            // Bouton déconnexion
            DrawerMenuItem(
                icon = Icons.Default.Logout,
                label = "Déconnexion",
                selected = false,
                onClick = {
                    navController.navigate("login") {
                        popUpTo("dashboard") { inclusive = true }
                    }
                    onCloseDrawer()
                },
                isDestructive = true
            )

            // Version info
            Text(
                text = "MyChurchApp v1.0.0",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .padding(top = 8.dp)
            )
        }
    }
}

/**
 * Header du drawer avec photo de profil
 */
@Composable
private fun DrawerHeader(
    photoUrl: String?,
    name: String,
    role: String,
    onProfileClick: () -> Unit
) {
    Surface(
        onClick = onProfileClick,
        color = MaterialTheme.colorScheme.primaryContainer,
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Photo de profil
            if (photoUrl != null) {
                AsyncImage(
                    model = photoUrl,
                    contentDescription = "Photo de profil",
                    modifier = Modifier.size(56.dp)
                )
            } else {
                Surface(
                    modifier = Modifier.size(56.dp),
                    shape = MaterialTheme.shapes.medium,
                    color = MaterialTheme.colorScheme.primary
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                }
            }

            // Infos utilisateur
            Column {
                Text(
                    text = name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = role,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

/**
 * title de section dans le drawer
 */
@Composable
private fun DrawerSectionTitle(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.labelMedium,
        color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
    )
}

/**
 * Item de menu du drawer
 */
@Composable
private fun DrawerMenuItem(
    icon: ImageVector,
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    isDestructive: Boolean = false
) {
    NavigationDrawerItem(
        icon = {
            Icon(
                imageVector = icon,
                contentDescription = null
            )
        },
        label = { Text(label) },
        selected = selected,
        onClick = onClick,
        modifier = Modifier.padding(horizontal = 12.dp),
        colors = if (isDestructive) {
            NavigationDrawerItemDefaults.colors(
                unselectedTextColor = MaterialTheme.colorScheme.error,
                unselectedIconColor = MaterialTheme.colorScheme.error
            )
        } else {
            NavigationDrawerItemDefaults.colors()
        }
    )
}
