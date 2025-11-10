package com.mychurchapp.presentation.chat

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
import com.mychurchapp.data.models.ChatChannel
import com.mychurchapp.data.models.ChatMessage
import com.mychurchapp.utils.Resource
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import java.text.SimpleDateFormat
import java.util.*

/**
 * Écran de chat (liste des channels)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    onNavigateToChannel: (String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: ChatViewModel = hiltViewModel()
) {
    val channels by viewModel.channels.collectAsState()
    var showCreateDialog by remember { mutableStateOf(false) }

    val isRefreshing = channels is Resource.Loading

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Messages") },
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
                Icon(Icons.Default.Add, "Nouveau channel")
            }
        }
    ) { paddingValues ->
        SwipeRefresh(
            state = rememberSwipeRefreshState(isRefreshing),
            onRefresh = { viewModel.refresh() },
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = channels) {
                is Resource.Success -> {
                    if (state.data.isEmpty()) {
                        EmptyChannelsView()
                    } else {
                        ChannelsList(
                            channels = state.data,
                            onChannelClick = { onNavigateToChannel(it.id) }
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

@Composable
private fun ChannelsList(
    channels: List<ChatChannel>,
    onChannelClick: (ChatChannel) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(vertical = 8.dp)
    ) {
        items(channels, key = { it.id }) { channel ->
            ChannelItem(
                channel = channel,
                onClick = { onChannelClick(channel) }
            )
            Divider()
        }
    }
}

@Composable
private fun ChannelItem(
    channel: ChatChannel,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Avatar du channel
            Surface(
                modifier = Modifier.size(48.dp),
                shape = MaterialTheme.shapes.medium,
                color = when (channel.type) {
                    "GENERAL" -> MaterialTheme.colorScheme.primary
                    "GROUPE" -> MaterialTheme.colorScheme.secondary
                    "PRIVE" -> MaterialTheme.colorScheme.tertiary
                    else -> MaterialTheme.colorScheme.outline
                }
            ) {
                Box(
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = when (channel.type) {
                            "GENERAL" -> Icons.Default.Public
                            "GROUPE" -> Icons.Default.Group
                            "PRIVE" -> Icons.Default.Lock
                            else -> Icons.Default.Chat
                        },
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onPrimary
                    )
                }
            }

            // Info du channel
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = channel.nom,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    // Horodatage du dernier message
                    channel.lastMessageAt?.let {
                        Text(
                            text = formatTime(it),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Dernier message ou description
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = channel.lastMessage ?: channel.notes ?: "Aucun message",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        modifier = Modifier.weight(1f)
                    )

                    // Badge de messages non lus
                    if (channel.unreadCount > 0) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Badge {
                            Text(
                                text = if (channel.unreadCount > 99) "99+" else channel.unreadCount.toString(),
                                style = MaterialTheme.typography.labelSmall
                            )
                        }
                    }
                }

                // Nombre de membres
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.People,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${channel.membersCount} membres",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

/**
 * Écran de conversation d'un channel
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatConversationScreen(
    channelId: String,
    onNavigateBack: () -> Unit,
    viewModel: ChatViewModel = hiltViewModel()
) {
    val messages by viewModel.messages.collectAsState()
    val sendState by viewModel.sendState.collectAsState()
    var messageText by remember { mutableStateOf("") }

    LaunchedEffect(channelId) {
        viewModel.loadMessages(channelId)
        viewModel.connectWebSocket(channelId)
    }

    DisposableEffect(Unit) {
        onDispose {
            viewModel.disconnectWebSocket()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Chat") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                }
            )
        },
        bottomBar = {
            MessageInput(
                text = messageText,
                onTextChange = { messageText = it },
                onSendClick = {
                    if (messageText.isNotBlank()) {
                        viewModel.sendMessage(channelId, messageText)
                        messageText = ""
                    }
                },
                isLoading = sendState is Resource.Loading
            )
        }
    ) { paddingValues ->
        when (val state = messages) {
            is Resource.Success -> {
                if (state.data.isEmpty()) {
                    EmptyMessagesView()
                } else {
                    MessagesList(
                        messages = state.data,
                        modifier = Modifier.padding(paddingValues)
                    )
                }
            }
            is Resource.Error -> {
                ErrorView(message = state.message) {
                    viewModel.loadMessages(channelId)
                }
            }
            is Resource.Loading -> LoadingView()
            null -> LoadingView()
        }
    }
}

@Composable
private fun MessagesList(
    messages: List<ChatMessage>,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        reverseLayout = true // Messages les plus récents en bas
    ) {
        items(messages.reversed(), key = { it.id }) { message ->
            MessageBubble(message = message)
        }
    }
}

@Composable
private fun MessageBubble(message: ChatMessage) {
    // Déterminer si c'est notre message (simplification)
    val isOwnMessage = false // TODO: Comparer avec l'ID de l'utilisateur actuel

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isOwnMessage) Arrangement.End else Arrangement.Start
    ) {
        Column(
            modifier = Modifier.widthIn(max = 300.dp)
        ) {
            // Nom de l'userId (si ce n'est pas nous)
            if (!isOwnMessage) {
                Text(
                    text = message.userId,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
            }

            // Bulle de message
            Surface(
                shape = MaterialTheme.shapes.medium,
                color = if (isOwnMessage) 
                    MaterialTheme.colorScheme.primaryContainer 
                else 
                    MaterialTheme.colorScheme.secondaryContainer
            ) {
                Column(
                    modifier = Modifier.padding(12.dp)
                ) {
                    Text(
                        text = message.content,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = formatTime(message.createdAt),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun MessageInput(
    text: String,
    onTextChange: (String) -> Unit,
    onSendClick: () -> Unit,
    isLoading: Boolean
) {
    Surface(
        tonalElevation = 3.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.Bottom,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = text,
                onValueChange = onTextChange,
                modifier = Modifier.weight(1f),
                placeholder = { Text("Écrire un message...") },
                maxLines = 4,
                enabled = !isLoading
            )

            IconButton(
                onClick = onSendClick,
                enabled = !isLoading && text.isNotBlank()
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(
                        Icons.Default.Send,
                        contentDescription = "Envoyer",
                        tint = if (text.isNotBlank()) 
                            MaterialTheme.colorScheme.primary 
                        else 
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun EmptyChannelsView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.Chat,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Aucun channel de discussion",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun EmptyMessagesView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.ChatBubbleOutline,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Aucun message",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "Soyez le premier à écrire !",
                style = MaterialTheme.typography.bodyMedium,
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

private fun formatTime(timestamp: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val now = Date()
        val appointmentDate = parser.parse(timestamp) ?: return timestamp
        
        val diffInMillis = now.time - date.time
        val diffInHours = diffInMillis / (1000 * 60 * 60)
        
        when {
            diffInHours < 1 -> {
                val diffInMinutes = diffInMillis / (1000 * 60)
                "${diffInMinutes}m"
            }
            diffInHours < 24 -> "${diffInHours}h"
            else -> {
                val formatter = SimpleDateFormat("dd/MM", Locale.getDefault())
                formatter.format(date)
            }
        }
    } catch (e: Exception) {
        timestamp
    }
}
