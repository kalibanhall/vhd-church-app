package com.mychurchapp.presentation.members

import androidx.compose.foundation.clickable
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
import com.mychurchapp.data.models.User
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState

/**
 * Écran de gestion des membres
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MembersScreen(
    onNavigateToDetails: (String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: MembersViewModel = hiltViewModel()
) {
    val members by viewModel.members.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var showFilterDialog by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf<String?>(null) }

    val isRefreshing = members is Resource.Loading

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Membres") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                },
                actions = {
                    IconButton(onClick = { showFilterDialog = true }) {
                        Icon(Icons.Default.FilterList, "Filtrer")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* Ajouter membre */ }
            ) {
                Icon(Icons.Default.Add, "Ajouter membre")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Barre de recherche
            SearchBar(
                query = searchQuery,
                onQueryChange = {
                    searchQuery = it
                    viewModel.searchMembers(it)
                },
                modifier = Modifier.padding(16.dp)
            )

            // Liste des membres
            SwipeRefresh(
                state = rememberSwipeRefreshState(isRefreshing),
                onRefresh = { viewModel.refreshChannels() }
            ) {
                when (val state = members) {
                    is Resource.Success -> {
                        if (state.data.isEmpty()) {
                            EmptyMembersView()
                        } else {
                            MembersList(
                                members = state.data,
                                onMemberClick = { onNavigateToDetails(it.id) }
                            )
                        }
                    }
                    is Resource.Error -> {
                        ErrorView(message = state.message) {
                            viewModel.refreshChannels()
                        }
                    }
                    is Resource.Loading -> {
                        LoadingView()
                    }
                    null -> LoadingView()
                }
            }
        }
    }

    // Dialog de filtres
    if (showFilterDialog) {
        FilterDialog(
            selectedFilter = selectedFilter,
            onFilterSelected = {
                selectedFilter = it
                viewModel.searchMembers(searchQuery, it)
                showFilterDialog = false
            },
            onDismiss = { showFilterDialog = false }
        )
    }
}

@Composable
private fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        modifier = modifier.fillMaxWidth(),
        placeholder = { Text("Rechercher un membre...") },
        leadingIcon = {
            Icon(Icons.Default.Search, "Rechercher")
        },
        trailingIcon = {
            if (query.isNotEmpty()) {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(Icons.Default.Close, "Effacer")
                }
            }
        },
        singleLine = true
    )
}

@Composable
private fun MembersList(
    members: List<User>,
    onMemberClick: (User) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(members, key = { it.id }) { member ->
            MemberCard(
                member = member,
                onClick = { onMemberClick(member) }
            )
        }
    }
}

@Composable
private fun MemberCard(
    member: User,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Surface(
                modifier = Modifier.size(56.dp),
                shape = MaterialTheme.shapes.medium,
                color = MaterialTheme.colorScheme.primaryContainer
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = member.lastName.firstOrNull()?.uppercase() ?: "?",
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Infos
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${member.lastName} ${member.firstName}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = member.email,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                member.telephone?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Badge rôle
            RoleBadge(role = member.userRole)
        }
    }
}

@Composable
private fun RoleBadge(role: String) {
    val (color, text) = when (role) {
        "ADMIN" -> MaterialTheme.colorScheme.error to "Admin"
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
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall,
            color = color
        )
    }
}

@Composable
private fun FilterDialog(
    selectedFilter: String?,
    onFilterSelected: (String?) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Filtrer par rôle") },
        text = {
            Column {
                FilterOption("Tous", null, selectedFilter, onFilterSelected)
                FilterOption("Admins", "ADMIN", selectedFilter, onFilterSelected)
                FilterOption("Pasteurs", "PASTEUR", selectedFilter, onFilterSelected)
                FilterOption("Ouvriers", "OUVRIER", selectedFilter, onFilterSelected)
                FilterOption("Membres", "MEMBRE", selectedFilter, onFilterSelected)
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Fermer")
            }
        }
    )
}

@Composable
private fun FilterOption(
    label: String,
    value: String?,
    selectedFilter: String?,
    onSelected: (String?) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelected(value) }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selectedFilter == value,
            onClick = { onSelected(value) }
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(label)
    }
}

@Composable
private fun EmptyMembersView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.People,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Aucun membre trouvé",
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
