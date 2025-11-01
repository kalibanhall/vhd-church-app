package com.mychurchapp.utils

/**
 * Classe wrapper pour gérer les états de ressource (Loading, Success, Error)
 * Pattern standard pour gérer les réponses réseau
 */
sealed class Resource<out T> {
    data class Success<out T>(val data: T) : Resource<T>()
    data class Error(val message: String, val code: Int? = null) : Resource<Nothing>()
    object Loading : Resource<Nothing>()

    val isLoading: Boolean
        get() = this is Loading

    val isSuccess: Boolean
        get() = this is Success

    val isError: Boolean
        get() = this is Error
}

/**
 * Extension pour obtenir les données ou null
 */
fun <T> Resource<T>.getDataOrNull(): T? {
    return when (this) {
        is Resource.Success -> data
        else -> null
    }
}

/**
 * Extension pour obtenir le message d'erreur ou null
 */
fun <T> Resource<T>.getErrorMessageOrNull(): String? {
    return when (this) {
        is Resource.Error -> message
        else -> null
    }
}
