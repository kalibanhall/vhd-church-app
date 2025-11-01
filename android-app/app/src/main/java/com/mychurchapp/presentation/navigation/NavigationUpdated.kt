package com.mychurchapp.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.mychurchapp.presentation.auth.LoginScreen
import com.mychurchapp.presentation.dashboard.DashboardScreen
import com.mychurchapp.presentation.dashboard.DashboardScreenWithNav
import com.mychurchapp.presentation.members.MembersScreen
import com.mychurchapp.presentation.members.MembersScreenWithNav
import com.mychurchapp.presentation.donations.DonationsScreen
import com.mychurchapp.presentation.profile.ProfileScreen
import com.mychurchapp.presentation.events.EventsScreen
import com.mychurchapp.presentation.sermons.SermonsScreen
import com.mychurchapp.presentation.appointments.AppointmentsScreen
import com.mychurchapp.presentation.prayers.PrayersScreen
import com.mychurchapp.presentation.testimonies.TestimoniesScreen
import com.mychurchapp.presentation.chat.ChatScreen
import com.mychurchapp.presentation.chat.ChatConversationScreen
import com.mychurchapp.presentation.notifications.NotificationsScreen

/**
 * Routes de navigation - Phase 2 COMPLETE
 */
sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Dashboard : Screen("dashboard")
    object Members : Screen("members")
    object Donations : Screen("donations")
    object Profile : Screen("profile")
    object Events : Screen("events")
    object EventDetails : Screen("events/{eventId}") {
        fun createRoute(eventId: String) = "events/$eventId"
    }
    object Sermons : Screen("sermons")
    object SermonDetails : Screen("sermons/{sermonId}") {
        fun createRoute(sermonId: String) = "sermons/$sermonId"
    }
    object Appointments : Screen("appointments")
    object Prayers : Screen("prayers")
    object Testimonies : Screen("testimonies")
    object TestimonyDetails : Screen("testimonies/{testimonyId}") {
        fun createRoute(testimonyId: String) = "testimonies/$testimonyId"
    }
    object Chat : Screen("chat")
    object ChatConversation : Screen("chat/{channelId}") {
        fun createRoute(channelId: String) = "chat/$channelId"
    }
    object Notifications : Screen("notifications")
}

/**
 * Navigation principale de l'app
 */
@Composable
fun AppNavigation(
    navController: NavHostController,
    startDestination: String = Screen.Login.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Authentication
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // Dashboard (avec BottomNav et Drawer intégrés)
        composable(Screen.Dashboard.route) {
            DashboardScreenWithNav(
                navController = navController
            )
        }

        // Members (avec BottomNav)
        composable(Screen.Members.route) {
            MembersScreenWithNav(
                navController = navController
            )
        }

        // Donations
        composable(Screen.Donations.route) {
            DonationsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // Profile
        composable(Screen.Profile.route) {
            ProfileScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                }
            )
        }

        // Events
        composable(Screen.Events.route) {
            EventsScreen(
                onNavigateToDetails = { eventId ->
                    navController.navigate(Screen.EventDetails.createRoute(eventId))
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(
            route = Screen.EventDetails.route,
            arguments = listOf(navArgument("eventId") { type = NavType.StringType })
        ) {
            // TODO: Créer EventDetailsScreen
        }

        // Sermons
        composable(Screen.Sermons.route) {
            SermonsScreen(
                onNavigateToDetails = { sermonId ->
                    navController.navigate(Screen.SermonDetails.createRoute(sermonId))
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(
            route = Screen.SermonDetails.route,
            arguments = listOf(navArgument("sermonId") { type = NavType.StringType })
        ) {
            // TODO: Créer SermonDetailsScreen avec ExoPlayer
        }

        // Appointments
        composable(Screen.Appointments.route) {
            AppointmentsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // Prayers
        composable(Screen.Prayers.route) {
            PrayersScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // Testimonies
        composable(Screen.Testimonies.route) {
            TestimoniesScreen(
                onNavigateToDetails = { testimonyId ->
                    navController.navigate(Screen.TestimonyDetails.createRoute(testimonyId))
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(
            route = Screen.TestimonyDetails.route,
            arguments = listOf(navArgument("testimonyId") { type = NavType.StringType })
        ) {
            // TODO: Créer TestimonyDetailsScreen avec commentaires
        }

        // Chat
        composable(Screen.Chat.route) {
            ChatScreen(
                onNavigateToChannel = { channelId ->
                    navController.navigate(Screen.ChatConversation.createRoute(channelId))
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(
            route = Screen.ChatConversation.route,
            arguments = listOf(navArgument("channelId") { type = NavType.StringType })
        ) { backStackEntry ->
            val channelId = backStackEntry.arguments?.getString("channelId") ?: ""
            ChatConversationScreen(
                channelId = channelId,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // Notifications
        composable(Screen.Notifications.route) {
            NotificationsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onNavigateToDetail = { type, id ->
                    // Navigation selon le type de notification
                    when (type) {
                        "NOUVEL_EVENEMENT" -> navController.navigate(Screen.EventDetails.createRoute(id))
                        "NOUVEAU_SERMON" -> navController.navigate(Screen.SermonDetails.createRoute(id))
                        "NOUVEAU_TEMOIGNAGE" -> navController.navigate(Screen.TestimonyDetails.createRoute(id))
                        "NOUVEAU_MESSAGE" -> navController.navigate(Screen.ChatConversation.createRoute(id))
                        else -> {}
                    }
                }
            )
        }
    }
}
