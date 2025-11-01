package com.mychurchapp.presentation.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import kotlinx.coroutines.launch

/**
 * Scaffold principal de l'application avec BottomNav et Drawer
 * Utilisé pour tous les écrans principaux après login
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScaffold(
    navController: NavController,
    currentRoute: String?,
    title: String,
    userPhotoUrl: String? = null,
    userName: String = "Utilisateur",
    userRole: String = "MEMBRE",
    showBottomBar: Boolean = true,
    floatingActionButton: @Composable () -> Unit = {},
    actions: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            AppDrawer(
                navController = navController,
                currentRoute = currentRoute,
                userPhotoUrl = userPhotoUrl,
                userName = userName,
                userRole = userRole,
                onCloseDrawer = {
                    scope.launch { drawerState.close() }
                }
            )
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(title) },
                    navigationIcon = {
                        IconButton(
                            onClick = {
                                scope.launch {
                                    if (drawerState.isClosed) {
                                        drawerState.open()
                                    } else {
                                        drawerState.close()
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Menu,
                                contentDescription = "Menu"
                            )
                        }
                    },
                    actions = actions
                )
            },
            bottomBar = {
                if (showBottomBar) {
                    BottomNavBar(
                        navController = navController,
                        currentRoute = currentRoute
                    )
                }
            },
            floatingActionButton = floatingActionButton,
            content = content
        )
    }
}

/**
 * Version simplifiée sans Drawer (pour écrans secondaires)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecondaryScaffold(
    title: String,
    onNavigateBack: () -> Unit,
    actions: @Composable () -> Unit = {},
    floatingActionButton: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Retour"
                        )
                    }
                },
                actions = actions
            )
        },
        floatingActionButton = floatingActionButton,
        content = content
    )
}

/**
 * Action de notification dans TopBar
 */
@Composable
fun NotificationAction(
    notificationCount: Int = 0,
    onClick: () -> Unit
) {
    IconButton(onClick = onClick) {
        BadgedBox(
            badge = {
                if (notificationCount > 0) {
                    Badge {
                        Text(
                            text = if (notificationCount > 99) "99+" else notificationCount.toString()
                        )
                    }
                }
            }
        ) {
            Icon(
                imageVector = Icons.Default.Notifications,
                contentDescription = "Notifications"
            )
        }
    }
}
