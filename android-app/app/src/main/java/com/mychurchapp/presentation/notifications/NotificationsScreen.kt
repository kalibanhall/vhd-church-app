package com.mychurchapp.presentation.notifications

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.mychurchapp.data.models.Notification
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import java.text.SimpleDateFormat
import java.util.*

/**
 * Écran de gestion des notifications
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToDetail: (String, String) -> Unit, // type, id
    viewModel: NotificationsViewModel = hiltViewModel()
) {
    val notifications by viewModel.notifications.collectAsState()
    var selectedFilter by remember { mutableStateOf(NotificationFilter.ALL) }
    var showMenu by remember { mutableStateOf(false) }

    val isRefreshing = notifications is Resource.Loading

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                },
                actions = {
                    IconButton(onClick = { showMenu = true }) {
                        Icon(Icons.Default.MoreVert, "Plus d'options")
                    }
                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Tout marquer comme lu") },
                            onClick = {
                                viewModel.markAllAsRead()
                                showMenu = false
                            },
                            leadingIcon = {
                                Icon(Icons.Default.DoneAll, null)
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Tout supprimer") },
                            onClick = {
                                viewModel.deleteAll()
                                showMenu = false
                            },
                            leadingIcon = {
                                Icon(Icons.Default.Delete, null)
                            }
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Filtres
            FilterChips(
                selectedFilter = selectedFilter,
                onFilterSelected = { selectedFilter = it }
            )

            // Liste des notifications
            SwipeRefresh(
                state = rememberSwipeRefreshState(isRefreshing),
                onRefresh = { viewModel.refreshChannels() }
            ) {
                when (val state = notifications) {
                    is Resource.Success -> {
                        val filteredNotifications = filterNotifications(state.data, selectedFilter)
                        if (filteredNotifications.isEmpty()) {
                            EmptyNotificationsView(selectedFilter)
                        } else {
                            NotificationsList(
                                notifications = filteredNotifications,
                                onNotificationClick = { notification ->
                                    viewModel.markAsRead(notification.id)
                                    notification.relatedId?.let { id ->
                                        onNavigateToDetail(notification.type, id)
                                    }
                                },
                                onDeleteClick = { viewModel.deleteNotification(it.id) }
                            )
                        }
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
    }
}

@Composable
private fun FilterChips(
    selectedFilter: NotificationFilter,
    onFilterSelected: (NotificationFilter) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        NotificationFilter.values().forEach { filter ->
            FilterChip(
                selected = selectedFilter == filter,
                onClick = { onFilterSelected(filter) },
                label = { Text(filter.label) },
                leadingIcon = if (selectedFilter == filter) {
                    {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                } else null
            )
        }
    }
}

@Composable
private fun NotificationsList(
    notifications: List<Notification>,
    onNotificationClick: (Notification) -> Unit,
    onDeleteClick: (Notification) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(vertical = 8.dp)
    ) {
        items(notifications, key = { it.id }) { notification ->
            NotificationItem(
                notification = notification,
                onClick = { onNotificationClick(notification) },
                onDeleteClick = { onDeleteClick(notification) }
            )
            Divider()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NotificationItem(
    notification: Notification,
    onClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    var showDeleteDialog by remember { mutableStateOf(false) }

    SwipeToDismiss(
        state = rememberDismissState(
            confirmValueChange = { dismissValue ->
                if (dismissValue == DismissValue.DismissedToEnd || dismissValue == DismissValue.DismissedToStart) {
                    showDeleteDialog = true
                    false // Ne pas supprimer automatiquement
                } else {
                    false
                }
            }
        ),
        background = {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.CenterEnd
            ) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Supprimer",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        },
        dismissContent = {
            Surface(
                onClick = onClick,
                modifier = Modifier.fillMaxWidth(),
                color = if (notification.isRead) 
                    MaterialTheme.colorScheme.surface 
                else 
                    MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Icône selon le type
                    Surface(
                        modifier = Modifier.size(48.dp),
                        shape = MaterialTheme.shapes.medium,
                        color = getNotificationColor(notification.type).copy(alpha = 0.2f)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = getNotificationIcon(notification.type),
                                contentDescription = null,
                                tint = getNotificationColor(notification.type)
                            )
                        }
                    }

                    // content
                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = notification.title,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = if (notification.isRead) FontWeight.Normal else FontWeight.Bold
                            )
                            if (!notification.isRead) {
                                Badge {
                                    Text("New")
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = notification.message,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 2
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = formatTimeAgo(notification.createdAt),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    )

    // Dialog de confirmation de suppression
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Supprimer la notification ?") },
            text = { Text("Cette action est irréversible.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        onDeleteClick()
                        showDeleteDialog = false
                    },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Supprimer")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Annuler")
                }
            }
        )
    }
}

@Composable
private fun getNotificationIcon(type: String) = when (donationType) {
    "NOUVEAU_MEMBRE" -> Icons.Default.PersonAdd
    "NOUVEAU_DON" -> Icons.Default.AttachMoney
    "NOUVEL_EVENEMENT" -> Icons.Default.Event
    "NOUVEAU_SERMON" -> Icons.Default.MusicNote
    "NOUVEAU_RDV" -> Icons.Default.EventNote
    "NOUVELLE_PRIERE" -> Icons.Default.Favorite
    "NOUVEAU_TEMOIGNAGE" -> Icons.Default.Star
    "NOUVEAU_MESSAGE" -> Icons.Default.Message
    "RAPPEL" -> Icons.Default.Alarm
    else -> Icons.Default.Notifications
}

@Composable
private fun getNotificationColor(type: String) = when (donationType) {
    "NOUVEAU_MEMBRE" -> MaterialTheme.colorScheme.primary
    "NOUVEAU_DON" -> MaterialTheme.colorScheme.tertiary
    "NOUVEL_EVENEMENT" -> MaterialTheme.colorScheme.secondary
    "NOUVEAU_SERMON" -> MaterialTheme.colorScheme.primary
    "NOUVEAU_RDV" -> MaterialTheme.colorScheme.tertiary
    "NOUVELLE_PRIERE" -> MaterialTheme.colorScheme.error
    "NOUVEAU_TEMOIGNAGE" -> MaterialTheme.colorScheme.secondary
    "NOUVEAU_MESSAGE" -> MaterialTheme.colorScheme.primary
    "RAPPEL" -> MaterialTheme.colorScheme.tertiary
    else -> MaterialTheme.colorScheme.outline
}

@Composable
private fun EmptyNotificationsView(filter: NotificationFilter) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.NotificationsNone,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = when (filter) {
                    NotificationFilter.ALL -> "Aucune notification"
                    NotificationFilter.UNREAD -> "Aucune notification non lue"
                    NotificationFilter.READ -> "Aucune notification lue"
                },
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
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

// Enums et utilitaires
enum class NotificationFilter(val label: String) {
    ALL("Toutes"),
    UNREAD("Non lues"),
    READ("Lues")
}

private fun filterNotifications(
    notifications: List<Notification>,
    filter: NotificationFilter
): List<Notification> {
    return when (filter) {
        NotificationFilter.ALL -> notifications
        NotificationFilter.UNREAD -> notifications.filter { !it.isRead }
        NotificationFilter.READ -> notifications.filter { it.isRead }
    }
}

private fun formatTimeAgo(timestamp: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val now = Date()
        val appointmentDate = parser.parse(timestamp) ?: return timestamp
        
        val diffInMillis = now.time - date.time
        val diffInMinutes = diffInMillis / (1000 * 60)
        val diffInHours = diffInMillis / (1000 * 60 * 60)
        val diffInDays = diffInMillis / (1000 * 60 * 60 * 24)
        
        when {
            diffInMinutes < 1 -> "À l'instant"
            diffInMinutes < 60 -> "Il y a ${diffInMinutes}m"
            diffInHours < 24 -> "Il y a ${diffInHours}h"
            diffInDays < 7 -> "Il y a ${diffInDays}j"
            else -> {
                val formatter = SimpleDateFormat("dd MMM", Locale("fr", "FR"))
                formatter.format(date)
            }
        }
    } catch (e: Exception) {
        timestamp
    }
}
