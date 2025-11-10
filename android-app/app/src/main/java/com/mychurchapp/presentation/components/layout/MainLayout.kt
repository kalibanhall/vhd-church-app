/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID - MAIN LAYOUT
 * =============================================================================
 * 
 * userId: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * notes: Layout principal de l'application - EXACTEMENT comme le web
 * Correspond à: src/components/Dashboard.tsx
 * 
 * Structure:
 * - Header (barre supérieure avec menu, recherche, notifications, profil)
 * - Sidebar (navigation latérale, repliée par défaut)
 * - content principal
 * 
 * Comportement:
 * - Sidebar repliée par défaut (comme Gmail)
 * - Auto-repli après sélection (sauf en mode admin)
 * - Overlay quand sidebar ouverte (sur mobile)
 * 
 * =============================================================================
 */

package com.mychurchapp.presentation.components.layout

import androidx.compose.ui.unit.dp

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.mychurchapp.domain.model.User

/**
 * Layout principal de l'application
 * Exactement comme Dashboard.tsx dans le web
 */
@Composable
fun MainLayout(
    user: User,
    activeTab: String,
    onTabChange: (String) -> Unit,
    onProfileClick: () -> Unit,
    onLogout: () -> Unit,
    content: @Composable () -> Unit
) {
    // État de la sidebar - Repliée par défaut comme Gmail (exactement comme le web)
    var isSidebarCollapsed by remember { mutableStateOf(true) }

    // Vérifier si on est dans l'espace admin (cohérent avec Sidebar.tsx)
    val adminOnlyTabs = listOf("admin", "analytics", "members", "events", "polls-admin", "notifications", "validate-testimonies")
    val isInAdminSpace = adminOnlyTabs.contains(activeTab)

    // Fonction pour gérer le changement d'onglet avec auto-repli
    val handleTabChange: (String) -> Unit = { tab ->
        onTabChange(tab)
        // Auto-repli après sélection seulement si pas en mode admin strict
        if (!adminOnlyTabs.contains(tab)) {
            isSidebarCollapsed = true
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Sidebar - Navigation latérale
        Sidebar(
            activeTab = activeTab,
            onTabChange = handleTabChange,
            user = user,
            isCollapsed = isSidebarCollapsed,
            onToggleCollapse = { isSidebarCollapsed = !isSidebarCollapsed }
        )

        // content principal
        Column(modifier = Modifier.fillMaxSize()) {
            // Header - Barre supérieure
            Header(
                user = user,
                onMenuClick = { isSidebarCollapsed = !isSidebarCollapsed },
                onProfileClick = onProfileClick,
                onTabChange = handleTabChange,
                onLogout = onLogout,
                hideMenuButton = false
            )

            // content de la page
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(
                        start = if (!isSidebarCollapsed) 256.dp else 0.dp
                    )
            ) {
                content()
            }
        }
    }
}
