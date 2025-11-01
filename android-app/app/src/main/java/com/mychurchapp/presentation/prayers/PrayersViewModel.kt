package com.mychurchapp.presentation.prayers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.Prayer
import com.mychurchapp.domain.repository.PrayersRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion des prières
 */
@HiltViewModel
class PrayersViewModel @Inject constructor(
    private val prayersRepository: PrayersRepository
) : ViewModel() {

    private val _prayers = MutableStateFlow<Resource<List<Prayer>>?>(null)
    val prayers: StateFlow<Resource<List<Prayer>>?> = _prayers.asStateFlow()

    private val _createPrayerState = MutableStateFlow<Resource<Prayer>?>(null)
    val createPrayerState: StateFlow<Resource<Prayer>?> = _createPrayerState.asStateFlow()

    private val _supportState = MutableStateFlow<Resource<Unit>?>(null)
    val supportState: StateFlow<Resource<Unit>?> = _supportState.asStateFlow()

    init {
        loadPrayers()
    }

    fun loadPrayers() {
        viewModelScope.launch {
            prayersRepository.getPrayers().collect { resource ->
                _prayers.value = resource
            }
        }
    }

    fun createPrayer(
        titre: String,
        description: String,
        categorie: String,
        isAnonymous: Boolean = false
    ) {
        viewModelScope.launch {
            val prayer = Prayer(
                id = "",
                membreId = "", // Sera rempli par l'API
                titre = titre,
                description = description,
                categorie = categorie,
                statut = "EN_COURS",
                isAnonymous = isAnonymous,
                supportCount = 0,
                createdAt = "",
                updatedAt = null,
                reponse = null,
                reponduAt = null
            )
            
            prayersRepository.createPrayer(prayer).collect { resource ->
                _createPrayerState.value = resource
                if (resource is Resource.Success) {
                    loadPrayers()
                }
            }
        }
    }

    fun supportPrayer(prayerId: String) {
        viewModelScope.launch {
            prayersRepository.supportPrayer(prayerId).collect { resource ->
                _supportState.value = resource
                if (resource is Resource.Success) {
                    loadPrayers()
                }
            }
        }
    }

    fun refresh() {
        loadPrayers()
    }

    fun clearCreateState() {
        _createPrayerState.value = null
    }

    fun clearSupportState() {
        _supportState.value = null
    }
}
