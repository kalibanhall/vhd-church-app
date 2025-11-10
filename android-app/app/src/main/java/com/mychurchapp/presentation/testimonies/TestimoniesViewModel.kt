package com.mychurchapp.presentation.testimonies

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.Testimony
import com.mychurchapp.domain.repository.TestimoniesRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion des témoignages
 */
@HiltViewModel
class TestimoniesViewModel @Inject constructor(
    private val testimoniesRepository: TestimoniesRepository
) : ViewModel() {

    private val _testimonies = MutableStateFlow<Resource<List<Testimony>>?>(null)
    val testimonies: StateFlow<Resource<List<Testimony>>?> = _testimonies.asStateFlow()

    private val _createTestimonyState = MutableStateFlow<Resource<Testimony>?>(null)
    val createTestimonyState: StateFlow<Resource<Testimony>?> = _createTestimonyState.asStateFlow()

    private val _likeState = MutableStateFlow<Resource<Unit>?>(null)
    val likeState: StateFlow<Resource<Unit>?> = _likeState.asStateFlow()

    init {
        loadTestimonies()
    }

    fun loadTestimonies() {
        viewModelScope.launch {
            testimoniesRepository.getTestimonies().collect { resource ->
                _testimonies.value = resource
            }
        }
    }

    fun createTestimony(
        title: String,
        content: String,
        category: String,
        isAnonymous: Boolean = false
    ) {
        viewModelScope.launch {
            val testimony = Testimony(
                id = "",
                userId = "", // Sera rempli par l'API
                title = title,
                content = content,
                category = category,
                status = "EN_ATTENTE",
                isAnonymous = isAnonymous,
                likes = 0,
                createdAt = "",
                updatedAt = null,
                approvedAt = null,
                approvedBy = null
            )
            
            testimoniesRepository.createTestimony(testimony).collect { resource ->
                _createTestimonyState.value = resource
                if (resource is Resource.Success) {
                    loadTestimonies()
                }
            }
        }
    }

    fun likeTestimony(testimonyId: String) {
        viewModelScope.launch {
            testimoniesRepository.likeTestimony(testimonyId).collect { resource ->
                _likeState.value = resource
                if (resource is Resource.Success) {
                    loadTestimonies()
                }
            }
        }
    }

    fun refresh() {
        loadTestimonies()
    }

    fun clearCreateState() {
        _createTestimonyState.value = null
    }

    fun clearLikeState() {
        _likeState.value = null
    }
}
