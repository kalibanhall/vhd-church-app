package com.mychurchapp.presentation.sermons

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
import com.mychurchapp.data.models.Sermon
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import java.text.SimpleDateFormat
import java.util.*

/**
 * Écran de gestion des sermons/prédications
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SermonsScreen(
    onNavigateToDetails: (String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: SermonsViewModel = hiltViewModel()
) {
    val sermons by viewModel.sermons.collectAsState()
    val downloadState by viewModel.downloadState.collectAsState()
    var selectedPreacher by remember { mutableStateOf<String?>(null) }
    var showMiniPlayer by remember { mutableStateOf(false) }
    var currentSermon by remember { mutableStateOf<Sermon?>(null) }

    val isRefreshing = sermons is Resource.Loading

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Prédications") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                },
                actions = {
                    IconButton(onClick = { /* TODO: Recherche */ }) {
                        Icon(Icons.Default.Search, "Rechercher")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* TODO: Créer sermon (admin) */ }
            ) {
                Icon(Icons.Default.Add, "Ajouter sermon")
            }
        },
        bottomBar = {
            if (showMiniPlayer && currentSermon != null) {
                MiniPlayer(
                    sermon = currentSermon!!,
                    onExpand = { onNavigateToDetails(currentSermon!!.id) },
                    onClose = { showMiniPlayer = false }
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Filtres par prédicateur
            if (sermons is Resource.Success) {
                val preachers = (sermons as Resource.Success<List<Sermon>>).data
                    .mapNotNull { it.predicateur }
                    .distinct()
                
                if (preachers.isNotEmpty()) {
                    PreacherFilter(
                        preachers = preachers,
                        selectedPreacher = selectedPreacher,
                        onPreacherSelected = { selectedPreacher = it }
                    )
                }
            }

            // Liste des sermons
            SwipeRefresh(
                state = rememberSwipeRefreshState(isRefreshing),
                onRefresh = { viewModel.refresh() }
            ) {
                when (val state = sermons) {
                    is Resource.Success -> {
                        val filteredSermons = selectedPreacher?.let { preacher ->
                            state.data.filter { it.predicateur == preacher }
                        } ?: state.data

                        if (filteredSermons.isEmpty()) {
                            EmptySermonsView()
                        } else {
                            SermonsList(
                                sermons = filteredSermons,
                                onSermonClick = { onNavigateToDetails(it.id) },
                                onPlayClick = { 
                                    currentSermon = it
                                    showMiniPlayer = true
                                },
                                onDownloadClick = { viewModel.downloadSermon(it.id) }
                            )
                        }
                    }
                    is Resource.Error -> {
                        ErrorView(message = state.message) {
                            viewModel.refresh()
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
private fun PreacherFilter(
    preachers: List<String>,
    selectedPreacher: String?,
    onPreacherSelected: (String?) -> Unit
) {
    LazyRow(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Option "Tous"
        item {
            FilterChip(
                selected = selectedPreacher == null,
                onClick = { onPreacherSelected(null) },
                label = { Text("Tous") },
                leadingIcon = if (selectedPreacher == null) {
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

        // Options par prédicateur
        items(preachers.size) { index ->
            val preacher = preachers[index]
            FilterChip(
                selected = selectedPreacher == preacher,
                onClick = { onPreacherSelected(preacher) },
                label = { Text(preacher) },
                leadingIcon = if (selectedPreacher == preacher) {
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
private fun SermonsList(
    sermons: List<Sermon>,
    onSermonClick: (Sermon) -> Unit,
    onPlayClick: (Sermon) -> Unit,
    onDownloadClick: (Sermon) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(sermons, key = { it.id }) { sermon ->
            SermonCard(
                sermon = sermon,
                onClick = { onSermonClick(sermon) },
                onPlayClick = { onPlayClick(sermon) },
                onDownloadClick = { onDownloadClick(sermon) }
            )
        }
    }
}

@Composable
private fun SermonCard(
    sermon: Sermon,
    onClick: () -> Unit,
    onPlayClick: () -> Unit,
    onDownloadClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // En-tête
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = sermon.titre,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    sermon.predicateur?.let {
                        Text(
                            text = "Par $it",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                
                // Bouton télécharger
                IconButton(onClick = onDownloadClick) {
                    Icon(Icons.Default.Download, "Télécharger")
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Référence biblique
            sermon.reference?.let {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Book,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.tertiary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Date
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.CalendarToday,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = formatDate(sermon.date),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                // Durée
                sermon.duree?.let {
                    Spacer(modifier = Modifier.width(16.dp))
                    Icon(
                        Icons.Default.AccessTime,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "$it min",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Statistiques
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
                    // Vues
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Visibility,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${sermon.vuesCount ?: 0}",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    // Téléchargements
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.CloudDownload,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${sermon.telechargementsCount ?: 0}",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }

                // Bouton Play
                FilledTonalButton(
                    onClick = onPlayClick,
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Icon(
                        Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Écouter")
                }
            }
        }
    }
}

@Composable
private fun MiniPlayer(
    sermon: Sermon,
    onExpand: () -> Unit,
    onClose: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onExpand
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icône lecture
            Icon(
                Icons.Default.PlayArrow,
                contentDescription = null,
                modifier = Modifier.size(32.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Info sermon
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = sermon.titre,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1
                )
                sermon.predicateur?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1
                    )
                }
            }

            // Bouton fermer
            IconButton(onClick = onClose) {
                Icon(Icons.Default.Close, "Fermer")
            }
        }
    }
}

@Composable
private fun EmptySermonsView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.MusicNote,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Aucune prédication trouvée",
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

private fun formatDate(dateString: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val formatter = SimpleDateFormat("dd MMMM yyyy", Locale("fr", "FR"))
        val date = parser.parse(dateString)
        date?.let { formatter.format(it) } ?: dateString
    } catch (e: Exception) {
        dateString
    }
}
