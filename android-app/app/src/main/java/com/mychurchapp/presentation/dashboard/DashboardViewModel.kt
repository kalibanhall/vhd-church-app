package com.mychurchapp.presentation.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.*
import com.mychurchapp.domain.repository.DashboardRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour le dashboard
 */
@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val dashboardRepository: DashboardRepository
) : ViewModel() {

    private val _dashboardStats = MutableStateFlow<Resource<AdminStats>?>(null)
    val dashboardStats: StateFlow<Resource<AdminStats>?> = _dashboardStats.asStateFlow()

    private val _analytics = MutableStateFlow<Resource<GrowthStats>?>(null)
    val analytics: StateFlow<Resource<GrowthStats>?> = _analytics.asStateFlow()

    private val _financialReport = MutableStateFlow<Resource<FinancialReport>?>(null)
    val financialReport: StateFlow<Resource<FinancialReport>?> = _financialReport.asStateFlow()

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        loadStats()
        loadAnalytics("month")
        loadFinancialReport("month")
    }

    private fun loadStats() {
        viewModelScope.launch {
            dashboardRepository.getDashboardStats().collect { resource ->
                _dashboardStats.value = resource
            }
        }
    }

    fun loadAnalytics(period: String) {
        viewModelScope.launch {
            dashboardRepository.getAnalytics(period).collect { resource ->
                _analytics.value = resource
            }
        }
    }

    fun loadFinancialReport(period: String) {
        viewModelScope.launch {
            dashboardRepository.getFinancialReport(period).collect { resource ->
                _financialReport.value = resource
            }
        }
    }

    fun refresh() {
        loadDashboardData()
    }
}
