package com.mychurchapp.presentation.testimonies

import androidx.compose.material.icons.filled.Description

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
import com.mychurchapp.data.models.Testimony
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import java.text.SimpleDateFormat
import java.util.*

/**
 * Écran de gestion des témoignages
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestimoniesScreen(
    onNavigateToDetails: (String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: TestimoniesViewModel = hiltViewModel()
) {
    val testimonies by viewModel.testimonies.collectAsState()
    val createState by viewModel.createState.collectAsState()
    var showCreateDialog by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf(TestimonyFilter.ALL) }

    val isRefreshing = testimonies is Resource.Loading

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
                title = { Text("Témoignages") },
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
                Icon(Icons.Default.Add, "Nouveau témoignage")
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

            // Liste des témoignages
            SwipeRefresh(
                state = rememberSwipeRefreshState(isRefreshing),
                onRefresh = { viewModel.refreshChannels() }
            ) {
                when (val state = testimonies) {
                    is Resource.Success -> {
                        val filteredTestimonies = filterTestimonies(state.data, selectedFilter)
                        if (filteredTestimonies.isEmpty()) {
                            EmptyTestimoniesView(selectedFilter)
                        } else {
                            TestimoniesList(
                                testimonies = filteredTestimonies,
                                onTestimonyClick = { onNavigateToDetails(it.id) },
                                onLikeClick = { viewModel.likeTestimony(it.id) }
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
            CreateTestimonyDialog(
                onDismiss = { showCreateDialog = false },
                onConfirm = { title, content, category ->
                    viewModel.createTestimony(title, content, category)
                },
                isLoading = createState is Resource.Loading
            )
        }
    }
}

@Composable
private fun FilterChips(
    selectedFilter: TestimonyFilter,
    onFilterSelected: (TestimonyFilter) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        TestimonyFilter.values().forEach { filter ->
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
private fun TestimoniesList(
    testimonies: List<Testimony>,
    onTestimonyClick: (Testimony) -> Unit,
    onLikeClick: (Testimony) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(testimonies, key = { it.id }) { testimony ->
            TestimonyCard(
                testimony = testimony,
                onClick = { onTestimonyClick(testimony) },
                onLikeClick = { onLikeClick(testimony) }
            )
        }
    }
}

@Composable
private fun TestimonyCard(
    testimony: Testimony,
    onClick: () -> Unit,
    onLikeClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // En-tête avec userId et catégorie
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
                        Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = testimony.userId,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
                testimony.category?.let { CategoryBadge(it) }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // title
            Text(
                text = testimony.title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            // content (aperçu)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = testimony.content,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 4
            )

            // Date et status
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
                            text = formatDate(testimony.appointmentDate),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Vues
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Visibility,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${testimony.vuesCount ?: 0}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Bouton J'aime
                IconButton(onClick = onLikeClick) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            Icons.Default.ThumbUp,
                            contentDescription = "J'aime",
                            modifier = Modifier.size(20.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "${testimony.likesCount ?: 0}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            // status de validation
            if (testimony.status.name == "PENDING") {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.1f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            Icons.Default.Schedule,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.tertiary
                        )
                        Text(
                            text = "En attente de validation",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.tertiary
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CategoryBadge(category: String) {
    val (color, text) = when (category) {
        "GUERISON" -> MaterialTheme.colorScheme.primary to "Guérison"
        "DELIVRANCE" -> MaterialTheme.colorScheme.secondary to "Délivrance"
        "PROVISION" -> MaterialTheme.colorScheme.tertiary to "Provision"
        "MARIAGE" -> MaterialTheme.colorScheme.error to "Mariage"
        "EMPLOI" -> MaterialTheme.colorScheme.primary to "Emploi"
        else -> MaterialTheme.colorScheme.outline to category
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
private fun CreateTestimonyDialog(
    onDismiss: () -> Unit,
    onConfirm: (title: String, content: String, category: String) -> Unit,
    isLoading: Boolean
) {
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("GUERISON") }
    var showCategoryMenu by remember { mutableStateOf(false) }

    val categories = listOf(
        "GUERISON" to "Guérison",
        "DELIVRANCE" to "Délivrance",
        "PROVISION" to "Provision",
        "MARIAGE" to "Mariage",
        "EMPLOI" to "Emploi",
        "AUTRE" to "Autre"
    )

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Nouveau témoignage") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("title") },
                    placeholder = { Text("title du témoignage") },
                    leadingIcon = {
                        Icon(Icons.Default.Title, null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading,
                    singleLine = true
                )

                // Sélecteur de catégorie
                ExposedDropdownMenuBox(
                    expanded = showCategoryMenu,
                    onExpandedChange = { showCategoryMenu = !showCategoryMenu }
                ) {
                    OutlinedTextField(
                        value = categories.find { it.first == selectedCategory }?.second ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Catégorie") },
                        trailingIcon = {
                            ExposedDropdownMenuDefaults.TrailingIcon(expanded = showCategoryMenu)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        enabled = !isLoading
                    )
                    ExposedDropdownMenu(
                        expanded = showCategoryMenu,
                        onDismissRequest = { showCategoryMenu = false }
                    ) {
                        categories.forEach { (value, label) ->
                            DropdownMenuItem(
                                text = { Text(label) },
                                onClick = {
                                    selectedCategory = value
                                    showCategoryMenu = false
                                }
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("content") },
                    placeholder = { Text("Partagez votre témoignage") },
                    leadingIcon = {
                        Icon(Icons.Default.Description, null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 5,
                    maxLines = 8,
                    enabled = !isLoading
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank() && content.isNotBlank()) {
                        onConfirm(title, content, selectedCategory)
                    }
                },
                enabled = !isLoading && title.isNotBlank() && content.isNotBlank()
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
private fun EmptyTestimoniesView(filter: TestimonyFilter) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.Star,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = when (filter) {
                    TestimonyFilter.ALL -> "Aucun témoignage"
                    TestimonyFilter.VALIDATED -> "Aucun témoignage validé"
                    TestimonyFilter.PENDING -> "Aucun témoignage en attente"
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
enum class TestimonyFilter(val label: String) {
    ALL("Tous"),
    VALIDATED("Validés"),
    PENDING("En attente")
}

private fun filterTestimonies(
    testimonies: List<Testimony>,
    filter: TestimonyFilter
): List<Testimony> {
    return when (filter) {
        TestimonyFilter.ALL -> testimonies
        TestimonyFilter.VALIDATED -> testimonies.filter { it.status == "VALIDE" }
        TestimonyFilter.PENDING -> testimonies.filter { it.status.name == "PENDING" }
    }
}

private fun formatDate(dateString: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val formatter = SimpleDateFormat("dd MMM yyyy", Locale("fr", "FR"))
        val appointmentDate = parser.parse(dateString)
        date?.let { formatter.format(it) } ?: dateString
    } catch (e: Exception) {
        dateString
    }
}
