package com.mychurchapp.presentation.prayers

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
import com.mychurchapp.data.models.Prayer
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import java.text.SimpleDateFormat
import java.util.*

/**
 * Écran de gestion des demandes de prières
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PrayersScreen(
    onNavigateBack: () -> Unit,
    viewModel: PrayersViewModel = hiltViewModel()
) {
    val prayers by viewModel.prayers.collectAsState()
    val createState by viewModel.createState.collectAsState()
    var showCreateDialog by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf(PrayerFilter.ALL) }

    val isRefreshing = prayers is Resource.Loading

    // Observer création réussie
    LaunchedEffect(createState) {
        if (createState is Resource.Success) {
            showCreateDialog = false
            viewModel.clearCreateState()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Demandes de prières") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showCreateDialog = true }
            ) {
                Icon(Icons.Default.Add, "Nouvelle demande")
            }
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

            // Liste des prières
            SwipeRefresh(
                state = rememberSwipeRefreshState(isRefreshing),
                onRefresh = { viewModel.refreshChannels() }
            ) {
                when (val state = prayers) {
                    is Resource.Success -> {
                        val filteredPrayers = filterPrayers(state.data, selectedFilter)
                        if (filteredPrayers.isEmpty()) {
                            EmptyPrayersView(selectedFilter)
                        } else {
                            PrayersList(
                                prayers = filteredPrayers,
                                onSupportClick = { viewModel.supportPrayer(it.id) }
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

        // Dialog de création
        if (showCreateDialog) {
            CreatePrayerDialog(
                onDismiss = { showCreateDialog = false },
                onConfirm = { title, demande, isAnonymous ->
                    viewModel.createPrayer(title, demande, isAnonymous)
                },
                isLoading = createState is Resource.Loading
            )
        }
    }
}

@Composable
private fun FilterChips(
    selectedFilter: PrayerFilter,
    onFilterSelected: (PrayerFilter) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        PrayerFilter.values().forEach { filter ->
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
private fun PrayersList(
    prayers: List<Prayer>,
    onSupportClick: (Prayer) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(prayers, key = { it.id }) { prayer ->
            PrayerCard(
                prayer = prayer,
                onSupportClick = { onSupportClick(prayer) }
            )
        }
    }
}

@Composable
private fun PrayerCard(
    prayer: Prayer,
    onSupportClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // En-tête avec auteur et status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        if (prayer.isAnonymous) Icons.Default.PersonOff else Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (prayer.isAnonymous) "Anonyme" else prayer.auteur,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
                StatusBadge(prayer.status)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // title
            Text(
                text = prayer.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            // Demande
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = prayer.demande,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Date et soutiens
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Date
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.CalendarToday,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = formatDate(prayer.appointmentDate),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Soutiens
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Favorite,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${prayer.soutiensCount ?: 0} soutiens",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Bouton Soutenir (seulement si EN_COURS)
                if (prayer.status == PrayerStatus.ACTIVE) {
                    FilledTonalButton(
                        onClick = onSupportClick,
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            Icons.Default.FavoriteBorder,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Soutenir", style = MaterialTheme.typography.labelMedium)
                    }
                }
            }

            // Message de réponse (si exaucée)
            if (prayer.status == PrayerStatus.ANSWERED && !prayer.reponse.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(12.dp))
                Divider()
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    verticalAlignment = Alignment.Start
                ) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "Témoignage",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = prayer.reponse!!,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (color, icon, text) = when (status) {
        "EN_COURS" -> Triple(
            MaterialTheme.colorScheme.primary,
            Icons.Default.Schedule,
            "En cours"
        )
        "EXAUCEE" -> Triple(
            MaterialTheme.colorScheme.tertiary,
            Icons.Default.CheckCircle,
            "Exaucée"
        )
        else -> Triple(
            MaterialTheme.colorScheme.outline,
            Icons.Default.Help,
            status
        )
    }

    Surface(
        shape = MaterialTheme.shapes.small,
        color = color.copy(alpha = 0.1f)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                icon,
                contentDescription = null,
                modifier = Modifier.size(14.dp),
                tint = color
            )
            Text(
                text = text,
                style = MaterialTheme.typography.labelSmall,
                color = color
            )
        }
    }
}

@Composable
private fun CreatePrayerDialog(
    onDismiss: () -> Unit,
    onConfirm: (title: String, demande: String, isAnonymous: Boolean) -> Unit,
    isLoading: Boolean
) {
    var title by remember { mutableStateOf("") }
    var demande by remember { mutableStateOf("") }
    var isAnonymous by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Nouvelle demande de prière") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("title") },
                    placeholder = { Text("Sujet de la prière") },
                    leadingIcon = {
                        Icon(Icons.Default.Title, null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading,
                    singleLine = true
                )

                OutlinedTextField(
                    value = demande,
                    onValueChange = { demande = it },
                    label = { Text("Demande") },
                    placeholder = { Text("Décrivez votre demande de prière") },
                    leadingIcon = {
                        Icon(Icons.Default.Description, null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 4,
                    maxLines = 6,
                    enabled = !isLoading
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = isAnonymous,
                        onCheckedChange = { isAnonymous = it },
                        enabled = !isLoading
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Publier anonymement",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank() && demande.isNotBlank()) {
                        onConfirm(title, demande, isAnonymous)
                    }
                },
                enabled = !isLoading && title.isNotBlank() && demande.isNotBlank()
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Publier")
                }
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isLoading
            ) {
                Text("Annuler")
            }
        }
    )
}

@Composable
private fun EmptyPrayersView(filter: PrayerFilter) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.Favorite,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = when (filter) {
                    PrayerFilter.ALL -> "Aucune demande de prière"
                    PrayerFilter.ONGOING -> "Aucune prière en cours"
                    PrayerFilter.ANSWERED -> "Aucune prière exaucée"
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
enum class PrayerFilter(val label: String) {
    ALL("Toutes"),
    ONGOING("En cours"),
    ANSWERED("Exaucées")
}

private fun filterPrayers(
    prayers: List<Prayer>,
    filter: PrayerFilter
): List<Prayer> {
    return when (filter) {
        PrayerFilter.ALL -> prayers
        PrayerFilter.ONGOING -> prayers.filter { it.status == PrayerStatus.ACTIVE }
        PrayerFilter.ANSWERED -> prayers.filter { it.status == PrayerStatus.ANSWERED }
    }
}

private fun formatDate(dateString: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val formatter = SimpleDateFormat("dd MMM yyyy", Locale("fr", "FR"))
        val date = parser.parse(dateString)
        date?.let { formatter.format(it) } ?: dateString
    } catch (e: Exception) {
        dateString
    }
}
