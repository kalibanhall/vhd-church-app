package com.mychurchapp.presentation.appointments

import com.mychurchapp.data.models.CreateAppointmentRequest

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.Appointment
import com.mychurchapp.domain.repository.AppointmentsRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion des rendez-vous
 */
@HiltViewModel
class AppointmentsViewModel @Inject constructor(
    private val appointmentsRepository: AppointmentsRepository
) : ViewModel() {

    private val _appointments = MutableStateFlow<Resource<List<Appointment>>?>(null)
    val appointments: StateFlow<Resource<List<Appointment>>?> = _appointments.asStateFlow()

    private val _createAppointmentState = MutableStateFlow<Resource<Appointment>?>(null)
    val createAppointmentState: StateFlow<Resource<Appointment>?> = _createAppointmentState.asStateFlow()

    private val _confirmationState = MutableStateFlow<Resource<Unit>?>(null)
    val confirmationState: StateFlow<Resource<Unit>?> = _confirmationState.asStateFlow()

    init {
        loadAppointments()
    }

    fun loadAppointments() {
        viewModelScope.launch {
            appointmentsRepository.getAppointments().collect { resource ->
                _appointments.value = resource
            }
        }
    }

    fun createAppointment(
        pastorId: String,
        date: String,
        time: String,
        purpose: String,
        description: String?
    ) {
        viewModelScope.launch {
            val appointment = Appointment(
                id = "",
                userId = "", // Sera rempli par l'API
                pastorId = pastorId,
                date = date,
                startTime = time,
                purpose = purpose,
                description = description,
                status = "EN_ATTENTE",
                createdAt = "",
                updatedAt = null
            )
            
            appointmentsRepository.createAppointment(appointment).collect { resource ->
                _createAppointmentState.value = resource
                if (resource is Resource.Success) {
                    loadAppointments()
                }
            }
        }
    }

    fun confirmAppointment(appointmentId: String) {
        viewModelScope.launch {
            appointmentsRepository.confirmAppointment(appointmentId).collect { resource ->
                _confirmationState.value = resource
                if (resource is Resource.Success) {
                    loadAppointments()
                }
            }
        }
    }

    fun refresh() {
        loadAppointments()
    }

    fun clearCreateState() {
        _createAppointmentState.value = null
    }

    fun clearConfirmationState() {
        _confirmationState.value = null
    }
}
