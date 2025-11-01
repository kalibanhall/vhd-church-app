package com.mychurchapp.presentation.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.ChatChannel
import com.mychurchapp.data.models.ChatMessage
import com.mychurchapp.domain.repository.ChatRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion du chat
 */
@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : ViewModel() {

    private val _channels = MutableStateFlow<Resource<List<ChatChannel>>?>(null)
    val channels: StateFlow<Resource<List<ChatChannel>>?> = _channels.asStateFlow()

    private val _messages = MutableStateFlow<Resource<List<ChatMessage>>?>(null)
    val messages: StateFlow<Resource<List<ChatMessage>>?> = _messages.asStateFlow()

    private val _sendMessageState = MutableStateFlow<Resource<ChatMessage>?>(null)
    val sendMessageState: StateFlow<Resource<ChatMessage>?> = _sendMessageState.asStateFlow()

    private val _selectedChannel = MutableStateFlow<ChatChannel?>(null)
    val selectedChannel: StateFlow<ChatChannel?> = _selectedChannel.asStateFlow()

    private val _messageText = MutableStateFlow("")
    val messageText: StateFlow<String> = _messageText.asStateFlow()

    init {
        loadChannels()
    }

    fun loadChannels() {
        viewModelScope.launch {
            chatRepository.getChannels().collect { resource ->
                _channels.value = resource
            }
        }
    }

    fun selectChannel(channel: ChatChannel) {
        _selectedChannel.value = channel
        loadMessages(channel.id)
    }

    fun loadMessages(channelId: String) {
        viewModelScope.launch {
            chatRepository.getMessages(channelId).collect { resource ->
                _messages.value = resource
            }
        }
    }

    fun updateMessageText(text: String) {
        _messageText.value = text
    }

    fun sendMessage(channelId: String, content: String) {
        if (content.isBlank()) return
        
        viewModelScope.launch {
            chatRepository.sendMessage(channelId, content).collect { resource ->
                _sendMessageState.value = resource
                if (resource is Resource.Success) {
                    // Vider le champ de texte
                    _messageText.value = ""
                    // Recharger les messages
                    loadMessages(channelId)
                }
            }
        }
    }

    fun sendCurrentMessage() {
        _selectedChannel.value?.let { channel ->
            sendMessage(channel.id, _messageText.value)
        }
    }

    fun refreshChannels() {
        loadChannels()
    }

    fun refreshMessages() {
        _selectedChannel.value?.let { channel ->
            loadMessages(channel.id)
        }
    }

    fun clearSendState() {
        _sendMessageState.value = null
    }
}
