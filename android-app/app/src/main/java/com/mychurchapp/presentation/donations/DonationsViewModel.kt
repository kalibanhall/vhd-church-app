package com.mychurchapp.presentation.donations

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.*
import com.mychurchapp.domain.repository.DonationsRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion des dons
 */
@HiltViewModel
class DonationsViewModel @Inject constructor(
    private val donationsRepository: DonationsRepository
) : ViewModel() {

    private val _donations = MutableStateFlow<Resource<PaginatedResponse<Donation>>?>(null)
    val donations: StateFlow<Resource<PaginatedResponse<Donation>>?> = _donations.asStateFlow()

    private val _donationStats = MutableStateFlow<Resource<FinancialReport>?>(null)
    val donationStats: StateFlow<Resource<FinancialReport>?> = _donationStats.asStateFlow()

    private val _projects = MutableStateFlow<Resource<List<DonationProject>>?>(null)
    val projects: StateFlow<Resource<List<DonationProject>>?> = _projects.asStateFlow()

    private val _selectedProject = MutableStateFlow<Resource<DonationProject>?>(null)
    val selectedProject: StateFlow<Resource<DonationProject>?> = _selectedProject.asStateFlow()

    private val _createDonationState = MutableStateFlow<Resource<Donation>?>(null)
    val createDonationState: StateFlow<Resource<Donation>?> = _createDonationState.asStateFlow()

    init {
        loadDonations()
        loadProjects()
        loadStats()
    }

    fun loadDonations(
        page: Int = 1,
        limit: Int = 20,
        userId: String? = null,
        type: String? = null,
        startDate: String? = null,
        endDate: String? = null
    ) {
        viewModelScope.launch {
            donationsRepository.getDonations(page, limit, userId, type, startDate, endDate).collect { resource ->
                _donations.value = resource
            }
        }
    }

    fun loadStats(period: String = "month") {
        viewModelScope.launch {
            donationsRepository.getDonationStats(period).collect { resource ->
                _donationStats.value = resource
            }
        }
    }

    fun loadProjects(status: String? = "active") {
        viewModelScope.launch {
            donationsRepository.getProjects(status).collect { resource ->
                _projects.value = resource
            }
        }
    }

    fun loadProjectById(id: String) {
        viewModelScope.launch {
            donationsRepository.getProjectById(id).collect { resource ->
                _selectedProject.value = resource
            }
        }
    }

    fun createDonation(
        amount: Double,
        donationType: String,
        paymentMethod: String,
        projectId: String? = null,
        notes: String? = null
    ) {
        viewModelScope.launch {
            val request = CreateDonationRequest(
                amount = amount,
                donationType = donationType,
                paymentMethod = paymentMethod,
                projectId = projectId,
                notes = notes
            )
            
            donationsRepository.createDonation(request).collect { resource ->
                _createDonationState.value = resource
                
                if (resource is Resource.Success) {
                    loadDonations() // Recharger la liste
                    loadStats() // Mettre à jour les stats
                }
            }
        }
    }

    fun resetCreateDonationState() {
        _createDonationState.value = null
    }

    fun refresh() {
        loadDonations()
        loadStats()
        loadProjects()
    }
}
