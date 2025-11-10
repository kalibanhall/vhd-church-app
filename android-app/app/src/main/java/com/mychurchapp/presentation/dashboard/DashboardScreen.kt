package com.mychurchapp.presentation.dashboard

import androidx.compose.material.icons.filled.Person

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.mychurchapp.data.models.AdminStats
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState

/**
 * Écran principal du Dashboard
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToMembers: () -> Unit,
    onNavigateToDonations: () -> Unit,
    onNavigateToEvents: () -> Unit,
    onNavigateToSermons: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val dashboardStats by viewModel.dashboardStats.collectAsState()
    val isRefreshing = dashboardStats is Resource.Loading

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tableau de bord") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { paddingValues ->
        SwipeRefresh(
            state = rememberSwipeRefreshState(isRefreshing),
            onRefresh = { viewModel.refreshChannels() },
            modifier = Modifier.padding(paddingValues)
        ) {
            when (val state = dashboardStats) {
                is Resource.Success -> {
                    DashboardContent(
                        stats = state.data,
                        onNavigateToMembers = onNavigateToMembers,
                        onNavigateToDonations = onNavigateToDonations,
                        onNavigateToEvents = onNavigateToEvents,
                        onNavigateToSermons = onNavigateToSermons
                    )
                }
                is Resource.Error -> {
                    ErrorView(message = state.message) {
                        viewModel.refreshChannels()
                    }
                }
                is Resource.Loading -> {
                    LoadingView()
                }
                null -> {
                    LoadingView()
                }
            }
        }
    }
}

@Composable
private fun DashboardContent(
    stats: AdminStats,
    onNavigateToMembers: () -> Unit,
    onNavigateToDonations: () -> Unit,
    onNavigateToEvents: () -> Unit,
    onNavigateToSermons: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // En-tête
        item {
            Text(
                text = "Vue d'ensemble",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
        }

        // Cartes statistiques
        item {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.height(400.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(
                    listOf(
                        StatCard("Membres totaux", stats.totalMembers.toString(), Icons.Default.People, MaterialTheme.colorScheme.primary),
                        StatCard("Membres actifs", stats.activeMembers.toString(), Icons.Default.Person, MaterialTheme.colorScheme.secondary),
                        StatCard("Présence aujourd'hui", stats.todaysPresence.toString(), Icons.Default.CalendarToday, MaterialTheme.colorScheme.tertiary),
                        StatCard("Dons du mois", "${stats.monthlyDonations}€", Icons.Default.AttachMoney, MaterialTheme.colorScheme.primary)
                    )
                ) { statCard ->
                    StatisticCard(statCard)
                }
            }
        }

        // Modules rapides
        item {
            Text(
                text = "Modules",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 16.dp)
            )
        }

        item {
            ModuleCard(
                title = "Membres",
                subtitle = "${stats.totalMembers} membres",
                icon = Icons.Default.People,
                onClick = onNavigateToMembers
            )
        }

        item {
            ModuleCard(
                title = "Dons",
                subtitle = "${stats.monthlyDonations}€ ce mois",
                icon = Icons.Default.AttachMoney,
                onClick = onNavigateToDonations
            )
        }

        item {
            ModuleCard(
                title = "Événements",
                subtitle = "${stats.upcomingEvents} à venir",
                icon = Icons.Default.Event,
                onClick = onNavigateToEvents
            )
        }

        item {
            ModuleCard(
                title = "Prières",
                subtitle = "${stats.pendingPrayers} en cours",
                icon = Icons.Default.Favorite,
                onClick = {}
            )
        }
    }
}

@Composable
private fun StatisticCard(statCard: StatCard) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = statCard.color.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = statCard.icon,
                contentDescription = null,
                tint = statCard.color,
                modifier = Modifier.size(32.dp)
            )
            Text(
                text = statCard.value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = statCard.color
            )
            Text(
                text = statCard.label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ModuleCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "Naviguer"
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

data class StatCard(
    val label: String,
    val value: String,
    val icon: ImageVector,
    val color: androidx.compose.ui.graphics.Color
)
