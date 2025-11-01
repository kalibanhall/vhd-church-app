package com.mychurchapp.presentation.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.*
import com.mychurchapp.domain.repository.ProfileRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour le profil utilisateur
 */
@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val profileRepository: ProfileRepository
) : ViewModel() {

    private val _profile = MutableStateFlow<Resource<User>?>(null)
    val profile: StateFlow<Resource<User>?> = _profile.asStateFlow()

    private val _updateState = MutableStateFlow<Resource<User>?>(null)
    val updateState: StateFlow<Resource<User>?> = _updateState.asStateFlow()

    private val _uploadPhotoState = MutableStateFlow<Resource<String>?>(null)
    val uploadPhotoState: StateFlow<Resource<String>?> = _uploadPhotoState.asStateFlow()

    private val _stats = MutableStateFlow<Resource<Map<String, Int>>?>(null)
    val stats: StateFlow<Resource<Map<String, Int>>?> = _stats.asStateFlow()

    init {
        loadProfile()
        loadStats()
    }

    fun loadProfile() {
        viewModelScope.launch {
            profileRepository.getProfile().collect { resource ->
                _profile.value = resource
            }
        }
    }

    fun loadStats() {
        viewModelScope.launch {
            profileRepository.getStats().collect { resource ->
                _stats.value = resource
            }
        }
    }

    fun updateProfile(
        firstName: String? = null,
        lastName: String? = null,
        phone: String? = null,
        address: String? = null,
        birthDate: String? = null,
        maritalStatus: String? = null,
        profession: String? = null,
        emergencyContactName: String? = null,
        emergencyContactPhone: String? = null
    ) {
        viewModelScope.launch {
            val request = UpdateProfileRequest(
                firstName = firstName,
                lastName = lastName,
                phone = phone,
                address = address,
                birthDate = birthDate,
                maritalStatus = maritalStatus,
                profession = profession,
                emergencyContactName = emergencyContactName,
                emergencyContactPhone = emergencyContactPhone
            )
            
            profileRepository.updateProfile(request).collect { resource ->
                _updateState.value = resource
                
                if (resource is Resource.Success) {
                    loadProfile() // Recharger le profil
                }
            }
        }
    }

    fun uploadPhoto(photo: ByteArray) {
        viewModelScope.launch {
            profileRepository.uploadPhoto(photo).collect { resource ->
                _uploadPhotoState.value = resource
                
                if (resource is Resource.Success) {
                    loadProfile() // Recharger le profil
                }
            }
        }
    }

    fun resetUpdateState() {
        _updateState.value = null
    }

    fun resetUploadPhotoState() {
        _uploadPhotoState.value = null
    }

    fun refresh() {
        loadProfile()
        loadStats()
    }
}
