/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID - DASHBOARD CONTAINER
 * =============================================================================
 * 
 * userId: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * notes: Container principal du Dashboard - EXACTEMENT comme le web
 * Correspond à: src/components/Dashboard.tsx
 * 
 * Fonctionnalités:
 * - Gestion de l'état activeTab (onglet actif)
 * - Intégration MainLayout (Header + Sidebar)
 * - Rendu conditionnel des pages selon activeTab
 * - Exactement les mêmes tabs que le web
 * 
 * =============================================================================
 */

package com.mychurchapp.presentation.dashboard

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import com.mychurchapp.domain.model.User
import com.mychurchapp.presentation.components.layout.MainLayout
import com.mychurchapp.presentation.user.*
import com.mychurchapp.presentation.admin.*
import com.mychurchapp.presentation.auth.AuthViewModel

/**
 * Container principal du Dashboard
 * Exactement comme Dashboard.tsx dans le web
 */
@Composable
fun DashboardContainer(
    onLogout: () -> Unit,
    authViewModel: AuthViewModel = hiltViewModel(),
    modifier: Modifier = Modifier
) {
    // État de l'onglet actif
    var activeTab by remember { mutableStateOf("home") }

    // Récupérer l'utilisateur connecté
    val user by authViewModel.currentUser.collectAsState()

    // Si pas d'utilisateur, afficher loading
    if (user == null) {
        LoadingView()
        return
    }

    // MainLayout avec Header + Sidebar + content
    MainLayout(
        user = user!!,
        activeTab = activeTab,
        onTabChange = { activeTab = it },
        onProfileClick = { activeTab = "profile" },
        onLogout = onLogout
    ) {
        // Rendu de la page selon activeTab - EXACTEMENT comme le web
        when (activeTab) {
            "home" -> HomePageSimple()
            
            "sermons" -> PreachingsPageSimple()
            
            "donations" -> DonationsPage()
            
            "appointments" -> {
                // Redirection selon le rôle (comme dans le web)
                if (user.role == UserRole.PASTOR || user.role == UserRole.ADMIN) {
                    AppointmentsManagement()
                } else {
                    MemberAppointments()
                }
            }
            
            "polls" -> PollsPage()
            
            "prayers" -> PrayersPage()
            
            "testimonies" -> TestimoniesPage()
            
            "chat" -> ChatPageReal()
            
            "profile" -> UserProfile()
            
            // Admin/Pastor routes
            "admin" -> {
                if (user.role == UserRole.ADMIN) {
                    AdminDashboard()
                } else {
                    HomePageSimple() // Fallback
                }
            }
            
            "analytics" -> {
                if (user.role == UserRole.ADMIN) {
                    AnalyticsPage()
                } else {
                    HomePageSimple()
                }
            }
            
            "members" -> {
                if (user.role == UserRole.ADMIN) {
                    MembersManagement()
                } else {
                    HomePageSimple()
                }
            }
            
            "events" -> {
                if (user.role == UserRole.ADMIN) {
                    EventsManagement()
                } else {
                    HomePageSimple()
                }
            }
            
            "polls-admin" -> {
                if (user.role == UserRole.ADMIN) {
                    PollsManagement()
                } else {
                    HomePageSimple()
                }
            }
            
            "notifications" -> {
                if (user.role == UserRole.ADMIN) {
                    NotificationsManagement()
                } else {
                    HomePageSimple()
                }
            }
            
            "validate-testimonies" -> {
                if (user.role == UserRole.ADMIN) {
                    PrayersTestimoniesValidation()
                } else {
                    HomePageSimple()
                }
            }
            
            "pastor-appointments" -> {
                if (user.role == UserRole.ADMIN || user.role == UserRole.PASTOR) {
                    AppointmentsManagement()
                } else {
                    HomePageSimple()
                }
            }
            
            else -> HomePageSimple() // Fallback
        }
    }
}

/**
 * Vue de chargement
 */
@Composable
private fun LoadingView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}
