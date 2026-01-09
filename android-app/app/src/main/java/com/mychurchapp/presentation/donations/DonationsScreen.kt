package com.mychurchapp.presentation.donations

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
import com.mychurchapp.data.models.Donation
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

/**
 * Écran de gestion des dons
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DonationsScreen(
    onNavigateBack: () -> Unit,
    viewModel: DonationsViewModel = hiltViewModel()
) {
    val donations by viewModel.donations.collectAsState()
    val donationStats by viewModel.donationStats.collectAsState()
    var showCreateDialog by remember { mutableStateOf(false) }

    val isRefreshing = donations is Resource.Loading

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Dons & Offrandes") },
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
                Icon(Icons.Default.Add, "Ajouter don")
            }
        }
    ) { paddingValues ->
        SwipeRefresh(
            state = rememberSwipeRefreshState(isRefreshing),
            onRefresh = { viewModel.refreshChannels() },
            modifier = Modifier.padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Statistiques
                when (val stats = donationStats) {
                    is Resource.Success -> {
                        DonationStatsCard(
                            totalAmount = stats.data.totalAmount,
                            monthlyAmount = stats.data.monthlyAmount,
                            donorsCount = stats.data.donorsCount
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                    else -> {}
                }

                // Liste des dons
                when (val state = donations) {
                    is Resource.Success -> {
                        if (state.data.isEmpty()) {
                            EmptyDonationsView()
                        } else {
                            DonationsList(donations = state.data)
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

    // Dialog de création de don
    if (showCreateDialog) {
        CreateDonationDialog(
            onDismiss = { showCreateDialog = false },
            onConfirm = { amount, type, projectId ->
                viewModel.createDonation(amount, type, projectId)
                showCreateDialog = false
            }
        )
    }
}

@Composable
private fun DonationStatsCard(
    totalAmount: Double,
    monthlyAmount: Double,
    donorsCount: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Statistiques",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatItem("Total", formatCurrency(totalAmount))
                StatItem("Ce mois", formatCurrency(monthlyAmount))
                StatItem("Donateurs", "$donorsCount")
            }
        }
    }
}

@Composable
private fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onPrimaryContainer
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
        )
    }
}

@Composable
private fun DonationsList(donations: List<Donation>) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(donations, key = { it.id }) { donation ->
            DonationCard(donation)
        }
    }
}

@Composable
private fun DonationCard(donation: Donation) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icône selon le type
            Surface(
                modifier = Modifier.size(48.dp),
                shape = MaterialTheme.shapes.medium,
                color = when (donation.donationType) {
                    "OFFRANDE" -> MaterialTheme.colorScheme.primaryContainer
                    "DIME" -> MaterialTheme.colorScheme.secondaryContainer
                    else -> MaterialTheme.colorScheme.tertiaryContainer
                }
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = when (donation.donationType) {
                            "OFFRANDE" -> Icons.Default.VolunteerActivism
                            "DIME" -> Icons.Default.Savings
                            else -> Icons.Default.CardGiftcard
                        },
                        contentDescription = null
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Infos
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = formatCurrency(donation.amount),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = donation.donationType,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = formatDate(donation.createdAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // status
            StatusBadge(status = donation.status)
        }
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (color, text) = when (status) {
        "APPROUVE" -> MaterialTheme.colorScheme.primary to "Approuvé"
        "EN_ATTENTE" -> MaterialTheme.colorScheme.tertiary to "En attente"
        "REJETE" -> MaterialTheme.colorScheme.error to "Rejeté"
        else -> MaterialTheme.colorScheme.outline to status
    }

    Surface(
        shape = MaterialTheme.shapes.small,
        color = color.copy(alpha = 0.1f)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall,
            color = color
        )
    }
}

@Composable
private fun CreateDonationDialog(
    onDismiss: () -> Unit,
    onConfirm: (Double, String, String?) -> Unit
) {
    var amount by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("OFFRANDE") }
    val types = listOf("OFFRANDE", "DIME", "DON_SPECIAL", "PROJET")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nouveau don") },
        text = {
            Column {
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Montant (FC)") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(16.dp))
                
                Text("Type de don", style = MaterialTheme.typography.labelMedium)
                types.forEach { type ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedType == type,
                            onClick = { selectedType = type }
                        )
                        Text(type)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    amount.toDoubleOrNull()?.let {
                        onConfirm(it, selectedType, null)
                    }
                },
                enabled = amount.toDoubleOrNull() != null
            ) {
                Text("Créer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Annuler")
            }
        }
    )
}

@Composable
private fun EmptyDonationsView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.VolunteerActivism,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Aucun don enregistré",
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

// Utilitaires
private fun formatCurrency(amount: Double): String {
    return NumberFormat.getCurrencyInstance(Locale("fr", "FR")).format(amount)
}

private fun formatDate(appointmentDate: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val formatter = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale("fr", "FR"))
        parser.parse(date)?.let { formatter.format(it) } ?: date
    } catch (e: Exception) {
        date
    }
}
