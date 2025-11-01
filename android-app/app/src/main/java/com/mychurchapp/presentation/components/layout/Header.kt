/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID - HEADER COMPONENT
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Barre supérieure de l'application - EXACTEMENT comme le web
 * Correspond à: src/components/layout/Header.tsx
 * 
 * Fonctionnalités:
 * - Bouton menu (hamburger) pour ouvrir/fermer sidebar
 * - Barre de recherche avec suggestions
 * - Panneau de notifications
 * - Profil utilisateur avec photo
 * - Bouton déconnexion avec confirmation
 * 
 * =============================================================================
 */

package com.mychurchapp.presentation.components.layout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import com.mychurchapp.domain.model.User

/**
 * Élément de résultat de recherche
 */
data class SearchResult(
    val id: String,
    val text: String,
    val action: String = "tab", // "tab" ou "url"
    val target: String = ""
)

/**
 * Composant Header - Barre supérieure de l'application
 * Exactement comme Header.tsx dans le web
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Header(
    user: User,
    onMenuClick: () -> Unit,
    onProfileClick: () -> Unit,
    onTabChange: (String) -> Unit,
    onLogout: () -> Unit,
    hideMenuButton: Boolean = false,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var showSuggestions by remember { mutableStateOf(false) }
    var showLogoutConfirm by remember { mutableStateOf(false) }
    var showNotifications by remember { mutableStateOf(false) }

    // Résultats de recherche - Exactement comme dans le web
    val baseSearchResults = listOf(
        SearchResult("home", "Accueil", "tab", "home"),
        SearchResult("sermons", "Prédications", "tab", "sermons"),
        SearchResult("donations", "Faire un don", "tab", "donations"),
        SearchResult("appointments", "Prendre rendez-vous", "tab", "appointments"),
        SearchResult("prayers", "Demandes de prière", "tab", "prayers"),
        SearchResult("testimonies", "Témoignages", "tab", "testimonies"),
        SearchResult("chat", "Chat communauté", "tab", "chat"),
        SearchResult("profile", "Mon profil", "url", "/profile")
    )

    // Ajouter liens admin si nécessaire
    val searchResults = remember(user.role) {
        if (user.role == "ADMIN") {
            baseSearchResults + listOf(
                SearchResult("manage-members", "Gérer les membres", "url", "/admin/members"),
                SearchResult("moderation", "Modération", "url", "/admin/moderation")
            )
        } else {
            baseSearchResults
        }
    }

    // Filtrer selon la recherche
    val filteredResults = remember(searchQuery) {
        if (searchQuery.isNotEmpty()) {
            searchResults.filter { 
                it.text.contains(searchQuery, ignoreCase = true) 
            }
        } else {
            searchResults
        }
    }

    // Header principal
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = Color.White,
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Bouton Menu (hamburger) - Exactement comme le web
                if (!hideMenuButton) {
                    IconButton(
                        onClick = onMenuClick,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Menu,
                            contentDescription = "Menu",
                            tint = Color(0xFF6B7280)
                        )
                    }
                }

                // Barre de recherche - Exactement comme le web
                Box(
                    modifier = Modifier.weight(1f)
                ) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .onFocusChanged { 
                                showSuggestions = it.isFocused 
                            },
                        placeholder = { Text("Rechercher...") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Filled.Search,
                                contentDescription = null,
                                tint = Color(0xFF9CA3AF)
                            )
                        },
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFFD1D5DB)
                        ),
                        singleLine = true
                    )

                    // Dropdown suggestions - Exactement comme le web
                    if (showSuggestions) {
                        DropdownMenu(
                            expanded = showSuggestions,
                            onDismissRequest = { showSuggestions = false },
                            modifier = Modifier
                                .fillMaxWidth(0.9f)
                                .heightIn(max = 400.dp)
                        ) {
                            if (filteredResults.isNotEmpty()) {
                                if (searchQuery.isNotEmpty()) {
                                    Text(
                                        text = "${filteredResults.size} résultat(s) trouvé(s)",
                                        modifier = Modifier.padding(16.dp),
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF6B7280)
                                    )
                                    Divider()
                                }
                                
                                filteredResults.forEach { result ->
                                    DropdownMenuItem(
                                        text = { Text(result.text) },
                                        onClick = {
                                            if (result.action == "tab") {
                                                onTabChange(result.target)
                                            } else {
                                                onProfileClick()
                                            }
                                            searchQuery = ""
                                            showSuggestions = false
                                        }
                                    )
                                }
                            } else {
                                Text(
                                    text = "Aucun résultat trouvé",
                                    modifier = Modifier.padding(16.dp),
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF6B7280)
                                )
                            }
                        }
                    }
                }

                // Notifications - Exactement comme le web
                BadgedBox(
                    badge = {
                        Badge(
                            containerColor = Color(0xFFEF4444)
                        ) {
                            Text("3", color = Color.White)
                        }
                    }
                ) {
                    IconButton(
                        onClick = { showNotifications = true }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Notifications,
                            contentDescription = "Notifications",
                            tint = Color(0xFF6B7280)
                        )
                    }
                }

                // Profil utilisateur - Exactement comme le web
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable(onClick = onProfileClick)
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Photo de profil ou icône par défaut
                    if (user.profileImageUrl != null) {
                        AsyncImage(
                            model = user.profileImageUrl,
                            contentDescription = "Photo de profil",
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .border(2.dp, Color(0xFFBFDBFE), CircleShape),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(
                                    androidx.compose.ui.graphics.Brush.linearGradient(
                                        colors = listOf(Color(0xFF3B82F6), Color(0xFF2563EB))
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Person,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }

                    // Nom et rôle
                    Column {
                        Text(
                            text = "${user.firstName} ${user.lastName}",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.SemiBold
                            ),
                            color = Color(0xFF111827)
                        )
                        Text(
                            text = user.role.lowercase().replaceFirstChar { it.uppercase() },
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                    }
                }

                // Bouton Déconnexion - Exactement comme le web
                TextButton(
                    onClick = { showLogoutConfirm = true },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = Color(0xFFDC2626)
                    )
                ) {
                    Icon(
                        imageVector = Icons.Filled.ExitToApp,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Déconnexion",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontWeight = FontWeight.Medium
                        )
                    )
                }
            }
        }
    }

    // Modal de confirmation déconnexion - Exactement comme le web
    if (showLogoutConfirm) {
        Dialog(onDismissRequest = { showLogoutConfirm = false }) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(12.dp),
                color = Color.White
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Icône
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFFEE2E2)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.ExitToApp,
                            contentDescription = null,
                            tint = Color(0xFFDC2626),
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Titre
                    Text(
                        text = "Confirmer la déconnexion",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = Color(0xFF111827)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Message
                    Text(
                        text = "Êtes-vous sûr de vouloir vous déconnecter ? Toutes les données non sauvegardées seront perdues.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6B7280),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Boutons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { showLogoutConfirm = false },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Annuler")
                        }

                        Button(
                            onClick = {
                                showLogoutConfirm = false
                                onLogout()
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFDC2626)
                            )
                        ) {
                            Text("Se déconnecter")
                        }
                    }
                }
            }
        }
    }
}
