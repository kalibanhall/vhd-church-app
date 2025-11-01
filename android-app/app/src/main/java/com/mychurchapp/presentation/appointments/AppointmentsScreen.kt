package com.mychurchapp.presentation.appointments

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
import com.mychurchapp.data.models.Appointment
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import java.text.SimpleDateFormat
import java.util.*

/**
 * Écran de gestion des rendez-vous
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppointmentsScreen(
    onNavigateBack: () -> Unit,
    viewModel: AppointmentsViewModel = hiltViewModel()
) {
    val appointments by viewModel.appointments.collectAsState()
    val createState by viewModel.createState.collectAsState()
    var showCreateDialog by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf(AppointmentFilter.ALL) }

    val isRefreshing = appointments is Resource.Loading

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
                title = { Text("Rendez-vous") },
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
                Icon(Icons.Default.Add, "Nouveau rendez-vous")
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

            // Liste des rendez-vous
            SwipeRefresh(
                state = rememberSwipeRefreshState(isRefreshing),
                onRefresh = { viewModel.refresh() }
            ) {
                when (val state = appointments) {
                    is Resource.Success -> {
                        val filteredAppointments = filterAppointments(state.data, selectedFilter)
                        if (filteredAppointments.isEmpty()) {
                            EmptyAppointmentsView(selectedFilter)
                        } else {
                            AppointmentsList(
                                appointments = filteredAppointments,
                                onCancelClick = { viewModel.cancelAppointment(it.id) }
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

        // Dialog de création
        if (showCreateDialog) {
            CreateAppointmentDialog(
                onDismiss = { showCreateDialog = false },
                onConfirm = { date, heure, motif ->
                    viewModel.createAppointment(date, heure, motif)
                },
                isLoading = createState is Resource.Loading
            )
        }
    }
}

@Composable
private fun FilterChips(
    selectedFilter: AppointmentFilter,
    onFilterSelected: (AppointmentFilter) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        AppointmentFilter.values().forEach { filter ->
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
private fun AppointmentsList(
    appointments: List<Appointment>,
    onCancelClick: (Appointment) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(appointments, key = { it.id }) { appointment ->
            AppointmentCard(
                appointment = appointment,
                onCancelClick = { onCancelClick(appointment) }
            )
        }
    }
}

@Composable
private fun AppointmentCard(
    appointment: Appointment,
    onCancelClick: () -> Unit
) {
    var showCancelDialog by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // En-tête avec statut
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Rendez-vous avec le pasteur",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                StatusBadge(appointment.statut)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Date et heure
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.CalendarToday,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = formatDate(appointment.date),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.width(16.dp))
                Icon(
                    Icons.Default.AccessTime,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = appointment.heure,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }

            // Motif
            appointment.motif?.let {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Motif",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            // Bouton annuler (seulement si EN_ATTENTE)
            if (appointment.statut == "EN_ATTENTE") {
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedButton(
                    onClick = { showCancelDialog = true },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Icon(
                        Icons.Default.Cancel,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Annuler le rendez-vous")
                }
            }
        }
    }

    // Dialog de confirmation d'annulation
    if (showCancelDialog) {
        AlertDialog(
            onDismissRequest = { showCancelDialog = false },
            title = { Text("Annuler le rendez-vous ?") },
            text = { Text("Voulez-vous vraiment annuler ce rendez-vous ?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        onCancelClick()
                        showCancelDialog = false
                    },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Annuler")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCancelDialog = false }) {
                    Text("Garder")
                }
            }
        )
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (color, icon, text) = when (status) {
        "EN_ATTENTE" -> Triple(
            MaterialTheme.colorScheme.tertiary,
            Icons.Default.Schedule,
            "En attente"
        )
        "CONFIRME" -> Triple(
            MaterialTheme.colorScheme.primary,
            Icons.Default.CheckCircle,
            "Confirmé"
        )
        "ANNULE" -> Triple(
            MaterialTheme.colorScheme.error,
            Icons.Default.Cancel,
            "Annulé"
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
private fun CreateAppointmentDialog(
    onDismiss: () -> Unit,
    onConfirm: (date: String, heure: String, motif: String) -> Unit,
    isLoading: Boolean
) {
    var selectedDate by remember { mutableStateOf("") }
    var selectedTime by remember { mutableStateOf("") }
    var motif by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Nouveau rendez-vous") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = selectedDate,
                    onValueChange = { selectedDate = it },
                    label = { Text("Date") },
                    placeholder = { Text("YYYY-MM-DD") },
                    leadingIcon = {
                        Icon(Icons.Default.CalendarToday, null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading
                )

                OutlinedTextField(
                    value = selectedTime,
                    onValueChange = { selectedTime = it },
                    label = { Text("Heure") },
                    placeholder = { Text("HH:MM") },
                    leadingIcon = {
                        Icon(Icons.Default.AccessTime, null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading
                )

                OutlinedTextField(
                    value = motif,
                    onValueChange = { motif = it },
                    label = { Text("Motif") },
                    placeholder = { Text("Décrivez le motif du rendez-vous") },
                    leadingIcon = {
                        Icon(Icons.Default.Description, null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 5,
                    enabled = !isLoading
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (selectedDate.isNotBlank() && selectedTime.isNotBlank() && motif.isNotBlank()) {
                        onConfirm(selectedDate, selectedTime, motif)
                    }
                },
                enabled = !isLoading && selectedDate.isNotBlank() && 
                         selectedTime.isNotBlank() && motif.isNotBlank()
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Créer")
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
private fun EmptyAppointmentsView(filter: AppointmentFilter) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.EventNote,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = when (filter) {
                    AppointmentFilter.ALL -> "Aucun rendez-vous"
                    AppointmentFilter.PENDING -> "Aucun rendez-vous en attente"
                    AppointmentFilter.CONFIRMED -> "Aucun rendez-vous confirmé"
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
enum class AppointmentFilter(val label: String) {
    ALL("Tous"),
    PENDING("En attente"),
    CONFIRMED("Confirmés")
}

private fun filterAppointments(
    appointments: List<Appointment>,
    filter: AppointmentFilter
): List<Appointment> {
    return when (filter) {
        AppointmentFilter.ALL -> appointments
        AppointmentFilter.PENDING -> appointments.filter { it.statut == "EN_ATTENTE" }
        AppointmentFilter.CONFIRMED -> appointments.filter { it.statut == "CONFIRME" }
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
