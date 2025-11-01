package com.mychurchapp.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.mychurchapp.presentation.auth.LoginScreen
import com.mychurchapp.presentation.dashboard.DashboardContainer
import com.mychurchapp.presentation.members.MembersScreen
import com.mychurchapp.presentation.donations.DonationsScreen
import com.mychurchapp.presentation.detail.*

/**
 * Routes de navigation
 */
sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Dashboard : Screen("dashboard")
    object Members : Screen("members")
    object MemberDetails : Screen("member_details/{memberId}") {
        fun createRoute(memberId: String) = "member_details/$memberId"
    }
    object SermonDetails : Screen("sermon_details/{sermonId}") {
        fun createRoute(sermonId: String) = "sermon_details/$sermonId"
    }
    object EventDetails : Screen("event_details/{eventId}") {
        fun createRoute(eventId: String) = "event_details/$eventId"
    }
    object TestimonyDetails : Screen("testimony_details/{testimonyId}") {
        fun createRoute(testimonyId: String) = "testimony_details/$testimonyId"
    }
    object Donations : Screen("donations")
    object Events : Screen("events")
    object Sermons : Screen("sermons")
    object Appointments : Screen("appointments")
    object Prayers : Screen("prayers")
    object Testimonies : Screen("testimonies")
    object Chat : Screen("chat")
    object Profile : Screen("profile")
    object Settings : Screen("settings")
}

/**
 * Graphe de navigation principal
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
        // Authentification
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // Dashboard - Utilise le nouveau DashboardContainer avec MainLayout
        composable(Screen.Dashboard.route) {
            DashboardContainer(
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // Membres
        composable(Screen.Members.route) {
            MembersScreen(
                onNavigateToDetails = { memberId ->
                    navController.navigate(Screen.MemberDetails.createRoute(memberId))
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // Dons
        composable(Screen.Donations.route) {
            DonationsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // Détails du sermon avec ExoPlayer
        composable(
            route = Screen.SermonDetails.route,
            arguments = listOf(
                navArgument("sermonId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val sermonId = backStackEntry.arguments?.getString("sermonId") ?: ""
            SermonDetailsScreen(
                sermonId = sermonId,
                onBackClick = { navController.popBackStack() }
            )
        }

        // Détails de l'événement
        composable(
            route = Screen.EventDetails.route,
            arguments = listOf(
                navArgument("eventId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val eventId = backStackEntry.arguments?.getString("eventId") ?: ""
            EventDetailsScreen(
                eventId = eventId,
                onBackClick = { navController.popBackStack() }
            )
        }

        // Détails du témoignage
        composable(
            route = Screen.TestimonyDetails.route,
            arguments = listOf(
                navArgument("testimonyId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val testimonyId = backStackEntry.arguments?.getString("testimonyId") ?: ""
            TestimonyDetailsScreen(
                testimonyId = testimonyId,
                onBackClick = { navController.popBackStack() }
            )
        }

        // Détails du membre
        composable(
            route = Screen.MemberDetails.route,
            arguments = listOf(
                navArgument("memberId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val memberId = backStackEntry.arguments?.getString("memberId") ?: ""
            MemberDetailsScreen(
                memberId = memberId,
                onBackClick = { navController.popBackStack() },
                isAdmin = true // TODO: Récupérer depuis AuthState
            )
        }

        // TODO: Ajouter les autres écrans
        // Events, Sermons, Appointments, Prayers, Testimonies, Chat, Profile, Settings
    }
}
