package com.mychurchapp.presentation.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.mychurchapp.data.models.User
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState

/**
 * Écran de profil utilisateur
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onNavigateToSettings: () -> Unit,
    onNavigateToEdit: () -> Unit,
    onLogout: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val profile by viewModel.profile.collectAsState()
    val stats by viewModel.profileStats.collectAsState()
    var showLogoutDialog by remember { mutableStateOf(false) }

    val isRefreshing = profile is Resource.Loading

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mon Profil") },
                actions = {
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, "Paramètres")
                    }
                    IconButton(onClick = { showLogoutDialog = true }) {
                        Icon(Icons.Default.Logout, "Déconnexion")
                    }
                }
            )
        }
    ) { paddingValues ->
        SwipeRefresh(
            state = rememberSwipeRefreshState(isRefreshing),
            onRefresh = { viewModel.refreshChannels() },
            modifier = Modifier.padding(paddingValues)
        ) {
            when (val state = profile) {
                is Resource.Success -> {
                    ProfileContent(
                        user = state.data,
                        statsResource = stats,
                        onEditClick = onNavigateToEdit,
                        onPhotoClick = { /* TODO: Camera */ }
                    )
                }
                is Resource.Error -> {
                    ErrorView(message = state.message) {
                        viewModel.refreshChannels()
                    }
                }
                is Resource.Loading -> LoadingView()
                null -> LoadingView()
            }
        }
    }

    // Dialog de déconnexion
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Déconnexion") },
            text = { Text("Voulez-vous vraiment vous déconnecter ?") },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        onLogout()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Déconnexion")
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Annuler")
                }
            }
        )
    }
}

@Composable
private fun ProfileContent(
    user: User,
    statsResource: Resource<Map<String, Any>>?,
    onEditClick: () -> Unit,
    onPhotoClick: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header avec photo et nom
        item {
            ProfileHeader(
                user = user,
                onPhotoClick = onPhotoClick,
                onEditClick = onEditClick
            )
        }

        // Informations personnelles
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Informations personnelles",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    InfoRow(Icons.Default.Email, "Email", user.email)
                    user.telephone?.let {
                        InfoRow(Icons.Default.Phone, "Téléphone", it)
                    }
                    user.adresse?.let {
                        InfoRow(Icons.Default.LocationOn, "Adresse", it)
                    }
                    user.dateNaissance?.let {
                        InfoRow(Icons.Default.Cake, "Date de naissance", it)
                    }
                    InfoRow(Icons.Default.Badge, "Rôle", getRoleLabel(user.userRole))
                }
            }
        }

        // Statistiques
        item {
            when (val stats = statsResource) {
                is Resource.Success -> {
                    StatsCard(stats.data)
                }
                else -> {}
            }
        }

        // Actions rapides
        item {
            QuickActionsCard(user.userRole)
        }

        // Espacement final
        item {
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun ProfileHeader(
    user: User,
    onPhotoClick: () -> Unit,
    onEditClick: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Photo de profil
        Box(
            modifier = Modifier.size(120.dp)
        ) {
            if (user.photoUrl != null) {
                AsyncImage(
                    model = user.photoUrl,
                    contentDescription = "Photo de profil",
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            } else {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(CircleShape),
                    color = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "${user.lastName.firstOrNull()?.uppercase() ?: ""}${user.firstName.firstOrNull()?.uppercase() ?: ""}",
                            style = MaterialTheme.typography.displayLarge,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }

            // Bouton caméra
            IconButton(
                onClick = onPhotoClick,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size(36.dp)
                    .background(
                        MaterialTheme.colorScheme.primary,
                        CircleShape
                    )
            ) {
                Icon(
                    Icons.Default.CameraAlt,
                    "Changer photo",
                    tint = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Nom
        Text(
            text = "${user.lastName} ${user.firstName}",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Badge rôle
        RoleBadge(user.userRole)

        Spacer(modifier = Modifier.height(16.dp))

        // Bouton éditer
        OutlinedButton(
            onClick = onEditClick,
            modifier = Modifier.fillMaxWidth(0.6f)
        ) {
            Icon(Icons.Default.Edit, null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Modifier le profil")
        }
    }
}

@Composable
private fun InfoRow(
    icon: ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

@Composable
private fun StatsCard(stats: Map<String, Any>) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Mes statistiques",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatItem(
                    label = "Présences",
                    value = (stats["presences"] as? Number)?.toString() ?: "0",
                    icon = Icons.Default.CheckCircle
                )
                StatItem(
                    label = "Dons",
                    value = (stats["donations"] as? Number)?.toString() ?: "0",
                    icon = Icons.Default.VolunteerActivism
                )
                StatItem(
                    label = "Événements",
                    value = (stats["events"] as? Number)?.toString() ?: "0",
                    icon = Icons.Default.Event
                )
            }
        }
    }
}

@Composable
private fun StatItem(
    label: String,
    value: String,
    icon: ImageVector
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.padding(8.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(32.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun QuickActionsCard(role: String) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Actions rapides",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))

            QuickActionItem(
                icon = Icons.Default.VolunteerActivism,
                title = "Faire un don",
                onClick = { /* TODO */ }
            )
            QuickActionItem(
                icon = Icons.Default.Favorite,
                title = "Nouvelle prière",
                onClick = { /* TODO */ }
            )
            QuickActionItem(
                icon = Icons.Default.Star,
                title = "Nouveau témoignage",
                onClick = { /* TODO */ }
            )

            if (role in listOf("ADMIN", "PASTEUR", "OUVRIER")) {
                Divider(modifier = Modifier.padding(vertical = 8.dp))
                Text(
                    text = "Actions administrateur",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
                QuickActionItem(
                    icon = Icons.Default.People,
                    title = "Gérer les membres",
                    onClick = { /* TODO */ }
                )
                QuickActionItem(
                    icon = Icons.Default.Analytics,
                    title = "Voir les statistiques",
                    onClick = { /* TODO */ }
                )
            }
        }
    }
}

@Composable
private fun QuickActionItem(
    icon: ImageVector,
    title: String,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(24.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(title)
            Spacer(modifier = Modifier.weight(1f))
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun RoleBadge(role: String) {
    val (color, text) = when (role) {
        "ADMIN" -> MaterialTheme.colorScheme.error to "Administrateur"
        "PASTEUR" -> MaterialTheme.colorScheme.primary to "Pasteur"
        "OUVRIER" -> MaterialTheme.colorScheme.secondary to "Ouvrier"
        else -> MaterialTheme.colorScheme.tertiary to "Membre"
    }

    Surface(
        shape = MaterialTheme.shapes.small,
        color = color.copy(alpha = 0.1f)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelMedium,
            color = color
        )
    }
}

@Composable
private fun LoadingView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}

@Composable
private fun ErrorView(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Error,
            contentDescription = "Erreur",
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.error
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.error
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text("Réessayer")
        }
    }
}

private fun getRoleLabel(role: String): String = when (role) {
    "ADMIN" -> "Administrateur"
    "PASTEUR" -> "Pasteur"
    "OUVRIER" -> "Ouvrier"
    else -> "Membre"
}
