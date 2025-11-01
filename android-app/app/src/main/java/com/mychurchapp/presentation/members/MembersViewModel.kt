package com.mychurchapp.presentation.members

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mychurchapp.data.models.*
import com.mychurchapp.domain.repository.MembersRepository
import com.mychurchapp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour la gestion des membres
 */
@HiltViewModel
class MembersViewModel @Inject constructor(
    private val membersRepository: MembersRepository
) : ViewModel() {

    private val _members = MutableStateFlow<Resource<PaginatedResponse<User>>?>(null)
    val members: StateFlow<Resource<PaginatedResponse<User>>?> = _members.asStateFlow()

    private val _selectedMember = MutableStateFlow<Resource<User>?>(null)
    val selectedMember: StateFlow<Resource<User>?> = _selectedMember.asStateFlow()

    private val _memberAttendance = MutableStateFlow<Resource<List<Attendance>>?>(null)
    val memberAttendance: StateFlow<Resource<List<Attendance>>?> = _memberAttendance.asStateFlow()

    private val _memberDonations = MutableStateFlow<Resource<List<Donation>>?>(null)
    val memberDonations: StateFlow<Resource<List<Donation>>?> = _memberDonations.asStateFlow()

    private val _searchResults = MutableStateFlow<Resource<List<User>>?>(null)
    val searchResults: StateFlow<Resource<List<User>>?> = _searchResults.asStateFlow()

    init {
        loadMembers()
    }

    fun loadMembers(
        page: Int = 1,
        limit: Int = 20,
        search: String? = null,
        status: String? = null,
        role: String? = null
    ) {
        viewModelScope.launch {
            membersRepository.getMembers(page, limit, search, status, role).collect { resource ->
                _members.value = resource
            }
        }
    }

    fun loadMemberById(id: String) {
        viewModelScope.launch {
            membersRepository.getMemberById(id).collect { resource ->
                _selectedMember.value = resource
            }
        }
    }

    fun loadMemberAttendance(id: String) {
        viewModelScope.launch {
            membersRepository.getMemberAttendance(id).collect { resource ->
                _memberAttendance.value = resource
            }
        }
    }

    fun loadMemberDonations(id: String) {
        viewModelScope.launch {
            membersRepository.getMemberDonations(id).collect { resource ->
                _memberDonations.value = resource
            }
        }
    }

    fun searchMembers(query: String) {
        if (query.isBlank()) {
            _searchResults.value = null
            return
        }
        
        viewModelScope.launch {
            membersRepository.searchMembers(query).collect { resource ->
                _searchResults.value = resource
            }
        }
    }

    fun refresh() {
        loadMembers()
    }
}
