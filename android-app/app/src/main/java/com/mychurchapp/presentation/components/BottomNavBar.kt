package com.mychurchapp.presentation.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState

/**
 * Bottom Navigation Bar avec 5 tabs principales
 */
@Composable
fun BottomNavBar(
    navController: NavController,
    currentRoute: String?
) {
    NavigationBar {
        BottomNavItem.values().forEach { item ->
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label
                    )
                },
                label = { Text(item.label) },
                selected = currentRoute == item.route,
                onClick = {
                    if (currentRoute != item.route) {
                        navController.navigate(item.route) {
                            // Pop up to start destination to avoid building large stack
                            popUpTo(navController.graph.startDestinationId) {
                                saveState = true
                            }
                            // Avoid multiple copies of same destination
                            launchSingleTop = true
                            // Restore state when reselecting item
                            restoreState = true
                        }
                    }
                }
            )
        }
    }
}

/**
 * Items de la Bottom Navigation
 */
enum class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String
) {
    DASHBOARD(
        route = "dashboard",
        icon = Icons.Default.Dashboard,
        label = "Accueil"
    ),
    MEMBERS(
        route = "members",
        icon = Icons.Default.People,
        label = "Membres"
    ),
    EVENTS(
        route = "events",
        icon = Icons.Default.Event,
        label = "Événements"
    ),
    CHAT(
        route = "chat",
        icon = Icons.Default.Chat,
        label = "Messages"
    ),
    PROFILE(
        route = "profile",
        icon = Icons.Default.Person,
        label = "Profil"
    )
}

/**
 * Helper pour obtenir le current route
 */
@Composable
fun NavController.currentRoute(): String? {
    return currentBackStackEntryAsState().value?.destination?.route
}
