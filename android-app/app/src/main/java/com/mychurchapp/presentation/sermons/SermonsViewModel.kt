package com.mychurchapp.presentation.sermons

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.Sermon
import com.mychurchapp.domain.repository.SermonsRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion des prédications
 */
@HiltViewModel
class SermonsViewModel @Inject constructor(
    private val sermonsRepository: SermonsRepository
) : ViewModel() {

    private val _sermons = MutableStateFlow<Resource<List<Sermon>>?>(null)
    val sermons: StateFlow<Resource<List<Sermon>>?> = _sermons.asStateFlow()

    private val _selectedSermon = MutableStateFlow<Resource<Sermon>?>(null)
    val selectedSermon: StateFlow<Resource<Sermon>?> = _selectedSermon.asStateFlow()

    private val _downloadState = MutableStateFlow<Resource<Unit>?>(null)
    val downloadState: StateFlow<Resource<Unit>?> = _downloadState.asStateFlow()

    // État du lecteur
    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPosition = MutableStateFlow(0L)
    val currentPosition: StateFlow<Long> = _currentPosition.asStateFlow()

    private val _duration = MutableStateFlow(0L)
    val duration: StateFlow<Long> = _duration.asStateFlow()

    init {
        loadSermons()
    }

    fun loadSermons() {
        viewModelScope.launch {
            sermonsRepository.getSermons().collect { resource ->
                _sermons.value = resource
            }
        }
    }

    fun getSermonById(sermonId: String) {
        viewModelScope.launch {
            sermonsRepository.getSermonById(sermonId).collect { resource ->
                _selectedSermon.value = resource
            }
        }
    }

    fun downloadSermon(sermonId: String) {
        viewModelScope.launch {
            sermonsRepository.downloadSermon(sermonId).collect { resource ->
                _downloadState.value = resource
            }
        }
    }

    // Contrôles du lecteur
    fun playPause() {
        _isPlaying.value = !_isPlaying.value
    }

    fun seekTo(position: Long) {
        _currentPosition.value = position
    }

    fun updateProgress(position: Long, duration: Long) {
        _currentPosition.value = position
        _duration.value = duration
    }

    fun refresh() {
        loadSermons()
    }

    fun clearDownloadState() {
        _downloadState.value = null
    }
}
