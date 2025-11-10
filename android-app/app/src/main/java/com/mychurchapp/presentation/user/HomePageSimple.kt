/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID - HOME PAGE
 * =============================================================================
 * 
 * userId: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * notes: Page d'accueil - EXACTEMENT comme le web
 * Correspond à: src/components/user/HomePageSimple.tsx
 * 
 * =============================================================================
 */

package com.mychurchapp.presentation.user

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.mychurchapp.presentation.auth.AuthViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun HomePageSimple(
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val user by authViewModel.currentUser.collectAsState()
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFDBEAFE), // blue-100
                        Color(0xFFE0E7FF)  // indigo-100
                    )
                )
            )
    ) {
        // En-tête de bienvenue
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shadowElevation = 1.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Bienvenue au VHD",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 32.sp
                        ),
                        color = Color(0xFF111827),
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = if (user != null) {
                            "Bonjour ${user!!.firstName} ! Nous sommes des ministeres par lesquels Dieu convertit le POTENTIEL en l'EXTRAORDINAIRE."
                        } else {
                            "Nous sommes des ministeres par lesquels Dieu convertit le POTENTIEL en l'EXTRAORDINAIRE."
                        },
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontSize = 18.sp
                        ),
                        color = Color(0xFF6B7280),
                        textAlign = TextAlign.Center
                    )
                }
            }
        }

        // Section informations - Contact
        item {
            Spacer(modifier = Modifier.height(24.dp))
            
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(32.dp)
            ) {
                // Contact Card
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color.White,
                    shape = RoundedCornerShape(16.dp),
                    shadowElevation = 4.dp
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp)
                    ) {
                        Text(
                            text = "📞 Nous Contacter",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold
                            ),
                            color = Color(0xFF111827)
                        )
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Column(
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = "📍", fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "24, avenue, Commune de Mont Ngafula, Kinshasa, RD Congo",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF374151)
                                )
                            }
                            
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = "📞", fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "0895 360 658",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF374151)
                                )
                            }
                            
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = "📧", fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "contact@vaillantshommesdedavid.org",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF374151)
                                )
                            }
                        }
                    }
                }
                
                // Horaires Card
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color.White,
                    shape = RoundedCornerShape(16.dp),
                    shadowElevation = 4.dp
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp)
                    ) {
                        Text(
                            text = "⏰ Horaires Habituels",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold
                            ),
                            color = Color(0xFF111827)
                        )
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Column(
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Column {
                                Text(
                                    text = "Culte Financièrement Prospère",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = FontWeight.Medium
                                    ),
                                    color = Color(0xFF111827)
                                )
                                Text(
                                    text = "Mardi 17h00 - 19h30",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF6B7280)
                                )
                            }
                            
                            Column {
                                Text(
                                    text = "Culte Métamorphose",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = FontWeight.Medium
                                    ),
                                    color = Color(0xFF111827)
                                )
                                Text(
                                    text = "Jeudi 17h00 - 19h30",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF6B7280)
                                )
                            }
                            
                            Column {
                                Text(
                                    text = "Libère ton Potentiel",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = FontWeight.Medium
                                    ),
                                    color = Color(0xFF111827)
                                )
                                Text(
                                    text = "Dimanche 17h00 - 19h30",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF6B7280)
                                )
                            }
                        }
                    }
                }
                
                // Message pour admin/pasteur si pas d'événements
                if (user?.role == "ADMIN" || user?.role == "PASTOR") {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Color.White,
                        shape = RoundedCornerShape(16.dp),
                        shadowElevation = 4.dp
                    ) {
                        Column(
                            modifier = Modifier.padding(48.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = "📅", fontSize = 48.sp)
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Text(
                                text = "Gestion des événements",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold
                                ),
                                color = Color(0xFF111827),
                                textAlign = TextAlign.Center
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            Text(
                                text = "Rendez-vous dans le tableau de bord pour planifier de nouveaux événements.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color(0xFF4F46E5),
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

// Placeholder pour les autres composants utilisateur
@Composable
fun PreachingsPageSimple() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "🎬 Prédications",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Text(
                text = "Liste des prédications audio et vidéo",
                style = MaterialTheme.typography.bodyLarge,
                color = Color(0xFF6B7280),
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "🎥", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Fonctionnalité à venir",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF111827)
                    )
                    Text(
                        text = "Accès aux prédications audio/vidéo",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6B7280)
                    )
                }
            }
        }
    }
}

@Composable
fun DonationsPage() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "💰 Soutien à l'œuvre",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Text(
                text = "Soutenez l'œuvre de Dieu par vos dons",
                style = MaterialTheme.typography.bodyLarge,
                color = Color(0xFF6B7280),
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            // Types de dons
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                DonationTypeCard("Offrande", "Contribution volontaire", "🎁")
                DonationTypeCard("Dîme", "10% de vos revenus", "📊")
                DonationTypeCard("Projet", "Construction et développement", "🏗️")
            }
        }
    }
}

@Composable
private fun DonationTypeCard(title: String, notes: String, emoji: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White,
        shape = RoundedCornerShape(12.dp),
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = emoji, fontSize = 32.sp)
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = Color(0xFF111827)
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF6B7280)
                )
            }
        }
    }
}

@Composable
fun PollsPage() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "📊 Sondages",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "📋", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Aucun sondage actif",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF111827)
                    )
                }
            }
        }
    }
}

@Composable
fun PrayersPage() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "🙏 Demandes de Prière",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Text(
                text = "Partagez vos intentions de prière avec la communauté",
                style = MaterialTheme.typography.bodyLarge,
                color = Color(0xFF6B7280),
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color(0xFFEEF2FF),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(
                        text = "💙 Soumettre une intention",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = Color(0xFF3730A3)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Vos demandes seront traitées avec confidentialité",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6366F1)
                    )
                }
            }
        }
    }
}

@Composable
fun TestimoniesPage() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "✨ Témoignages",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Text(
                text = "Partagez comment Dieu a transformé votre vie",
                style = MaterialTheme.typography.bodyLarge,
                color = Color(0xFF6B7280),
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "🌟", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Partagez votre témoignage",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF111827)
                    )
                }
            }
        }
    }
}

@Composable
fun ChatPageReal() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "💬 Discussion Communauté",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "💬", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Chat communautaire",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF111827)
                    )
                    Text(
                        text = "Fonctionnalité à venir",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6B7280)
                    )
                }
            }
        }
    }
}

@Composable
fun UserProfile() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "👤 Mon Profil",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFF3B82F6), Color(0xFF2563EB))
                                ),
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "👤", fontSize = 40.sp)
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Informations du profil",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF111827)
                    )
                }
            }
        }
    }
}

@Composable
fun MemberAppointments() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(24.dp)
    ) {
        item {
            Text(
                text = "📅 Mes Rendez-vous",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color(0xFF111827),
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Text(
                text = "Gérez vos rendez-vous avec les pasteurs",
                style = MaterialTheme.typography.bodyLarge,
                color = Color(0xFF6B7280),
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "📅", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Prendre rendez-vous",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF111827)
                    )
                }
            }
        }
    }
}
