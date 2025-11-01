package com.mychurchapp.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.mychurchapp.presentation.navigation.AppNavigation
import com.mychurchapp.presentation.navigation.Screen
import com.mychurchapp.presentation.theme.MyChurchAppTheme
import dagger.hilt.android.AndroidEntryPoint

/**
 * Activité principale de l'application
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            MyChurchAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    
                    // TODO: Vérifier si l'utilisateur est connecté pour choisir la destination
                    val startDestination = Screen.Login.route
                    
                    AppNavigation(
                        navController = navController,
                        startDestination = startDestination
                    )
                }
            }
        }
    }
}
