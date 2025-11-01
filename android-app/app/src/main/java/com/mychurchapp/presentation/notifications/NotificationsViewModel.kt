package com.mychurchapp.presentation.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.*
import com.mychurchapp.domain.repository.NotificationsRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion des notifications
 */
@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val notificationsRepository: NotificationsRepository
) : ViewModel() {

    private val _notifications = MutableStateFlow<Resource<PaginatedResponse<Notification>>?>(null)
    val notifications: StateFlow<Resource<PaginatedResponse<Notification>>?> = _notifications.asStateFlow()

    private val _unreadCount = MutableStateFlow<Resource<Int>?>(null)
    val unreadCount: StateFlow<Resource<Int>?> = _unreadCount.asStateFlow()

    init {
        loadNotifications()
        loadUnreadCount()
    }

    fun loadNotifications(
        page: Int = 1,
        limit: Int = 20,
        isRead: Boolean? = null
    ) {
        viewModelScope.launch {
            notificationsRepository.getNotifications(page, limit, isRead).collect { resource ->
                _notifications.value = resource
            }
        }
    }

    fun loadUnreadCount() {
        viewModelScope.launch {
            notificationsRepository.getUnreadCount().collect { resource ->
                _unreadCount.value = resource
            }
        }
    }

    fun markAsRead(id: String) {
        viewModelScope.launch {
            notificationsRepository.markAsRead(id).collect { resource ->
                if (resource is Resource.Success) {
                    loadNotifications()
                    loadUnreadCount()
                }
            }
        }
    }

    fun markAllAsRead() {
        viewModelScope.launch {
            notificationsRepository.markAllAsRead().collect { resource ->
                if (resource is Resource.Success) {
                    loadNotifications()
                    loadUnreadCount()
                }
            }
        }
    }

    fun registerFcmToken(token: String) {
        viewModelScope.launch {
            notificationsRepository.registerFcmToken(token).collect { resource ->
                // Token enregistré
            }
        }
    }

    fun refresh() {
        loadNotifications()
        loadUnreadCount()
    }
}
