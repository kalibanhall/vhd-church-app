package com.mychurchapp.presentation.events

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.Event
import com.mychurchapp.domain.repository.EventsRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion des événements
 */
@HiltViewModel
class EventsViewModel @Inject constructor(
    private val eventsRepository: EventsRepository
) : ViewModel() {

    private val _events = MutableStateFlow<Resource<List<Event>>?>(null)
    val events: StateFlow<Resource<List<Event>>?> = _events.asStateFlow()

    private val _selectedEvent = MutableStateFlow<Resource<Event>?>(null)
    val selectedEvent: StateFlow<Resource<Event>?> = _selectedEvent.asStateFlow()

    private val _registrationState = MutableStateFlow<Resource<Unit>?>(null)
    val registrationState: StateFlow<Resource<Unit>?> = _registrationState.asStateFlow()

    init {
        loadEvents()
    }

    fun loadEvents() {
        viewModelScope.launch {
            eventsRepository.getEvents().collect { resource ->
                _events.value = resource
            }
        }
    }

    fun getEventById(eventId: String) {
        viewModelScope.launch {
            eventsRepository.getEventById(eventId).collect { resource ->
                _selectedEvent.value = resource
            }
        }
    }

    fun registerForEvent(eventId: String) {
        viewModelScope.launch {
            eventsRepository.registerForEvent(eventId).collect { resource ->
                _registrationState.value = resource
                if (resource is Resource.Success) {
                    // Recharger les événements après inscription
                    loadEvents()
                }
            }
        }
    }

    fun createEvent(event: Event) {
        viewModelScope.launch {
            eventsRepository.createEvent(event).collect { resource ->
                if (resource is Resource.Success) {
                    loadEvents()
                }
            }
        }
    }

    fun refresh() {
        loadEvents()
    }

    fun clearRegistrationState() {
        _registrationState.value = null
    }
}
