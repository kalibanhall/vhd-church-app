package com.mychurchapp.presentation.detail

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestimonyDetailsScreen(
    testimonyId: String,
    onBackClick: () -> Unit
) {
    // Simuler les données du témoignage
    val testimony = remember {
        Testimony(
            id = testimonyId,
            userName = "Marie MUKENDI",
            userPhotoUrl = "https://i.pravatar.cc/150?img=5",
            title = "Dieu a guéri ma mère d'un cancer",
            content = """
                Gloire à Dieu ! Je veux partager avec vous un témoignage puissant de la fidélité de Dieu.
                
                Il y a 6 mois, ma mère a été diagnostiquée avec un cancer du sein de stade 3. Les médecins nous ont dit que les chances de survie étaient très faibles et qu'elle devait commencer la chimiothérapie immédiatement.
                
                Nous avons prié sans cesse. L'église tout entière s'est mobilisée dans l'intercession. Le pasteur est venu prier pour elle à l'hôpital. Nous avons jeûné pendant 21 jours.
                
                Après 3 mois de traitement et de prières, un miracle s'est produit ! Les nouveaux examens ont montré que la tumeur avait complètement disparu. Les médecins étaient stupéfaits et ne pouvaient pas l'expliquer médicalement.
                
                Aujourd'hui, ma mère est en parfaite santé. Dieu est fidèle ! Il répond aux prières. Ne cessez jamais de croire en sa puissance miraculeuse.
                
                Que Dieu soit glorifié ! 🙏
            """.trimIndent(),
            category = "GUERISON",
            date = System.currentTimeMillis() - (14 * 24 * 60 * 60 * 1000),
            likes = 458,
            commentsCount = 67,
            shares = 23,
            isPinned = true
        )
    }
    
    val comments = remember {
        listOf(
            Comment(
                id = "1",
                userName = "Jean KALOMBO",
                userPhotoUrl = "https://i.pravatar.cc/150?img=12",
                content = "Gloire à Dieu ! Quel témoignage puissant ! Que le Seigneur continue de bénir votre famille.",
                date = System.currentTimeMillis() - (12 * 60 * 60 * 1000)
            ),
            Comment(
                id = "2",
                userName = "Sarah TSHIANI",
                userPhotoUrl = "https://i.pravatar.cc/150?img=9",
                content = "Amen ! Dieu est vraiment fidèle. Merci de partager ce témoignage qui fortifie notre foi.",
                date = System.currentTimeMillis() - (10 * 60 * 60 * 1000)
            ),
            Comment(
                id = "3",
                userName = "Pierre KABONGO",
                userPhotoUrl = "https://i.pravatar.cc/150?img=8",
                content = "Gloire à Dieu ! Ce témoignage m'encourage énormément. Je prie pour la guérison de mon père.",
                date = System.currentTimeMillis() - (8 * 60 * 60 * 1000)
            )
        )
    }
    
    var likedByUser by remember { mutableStateOf(false) }
    var currentLikes by remember { mutableIntStateOf(testimony.likes) }
    var showCommentDialog by remember { mutableStateOf(false) }
    var commentText by remember { mutableStateOf("") }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Témoignage") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Partager */ }) {
                        Icon(Icons.Default.Share, "Partager")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // En-tête du témoignage
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF9FAFB))
                        .padding(16.dp)
                ) {
                    // Auteur
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        AsyncImage(
                            model = testimony.userPhotoUrl,
                            contentDescription = null,
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                        )
                        
                        Spacer(modifier = Modifier.width(12.dp))
                        
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = testimony.userName,
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = formatDate(testimony.date),
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF6B7280)
                            )
                        }
                        
                        if (testimony.isPinned) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFFDCFCE7)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.PushPin,
                                        contentDescription = null,
                                        tint = Color(0xFF10B981),
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Épinglé",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = Color(0xFF10B981)
                                    )
                                }
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Titre
                    Text(
                        text = testimony.title,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Catégorie
                    AssistChip(
                        onClick = { },
                        label = { Text(getCategoryLabel(testimony.category)) },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Category,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    )
                }
            }
            
            // Contenu
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = testimony.content,
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color(0xFF1F2937),
                        lineHeight = MaterialTheme.typography.bodyLarge.fontSize.value.dp * 1.6f
                    )
                }
            }
            
            // Actions
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                ) {
                    Divider()
                    
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        // J'aime
                        TextButton(
                            onClick = {
                                likedByUser = !likedByUser
                                currentLikes += if (likedByUser) 1 else -1
                            }
                        ) {
                            Icon(
                                if (likedByUser) Icons.Filled.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = null,
                                tint = if (likedByUser) Color(0xFFEF4444) else Color(0xFF6B7280)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("$currentLikes J'aime")
                        }
                        
                        // Commenter
                        TextButton(onClick = { showCommentDialog = true }) {
                            Icon(Icons.Default.Comment, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("${testimony.commentsCount} Commentaires")
                        }
                        
                        // Partager
                        TextButton(onClick = { /* Partager */ }) {
                            Icon(Icons.Default.Share, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("${testimony.shares} Partages")
                        }
                    }
                    
                    Divider()
                }
            }
            
            // Section commentaires
            item {
                Text(
                    text = "Commentaires (${comments.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(16.dp)
                )
            }
            
            // Liste des commentaires
            items(comments) { comment ->
                CommentItem(comment)
            }
            
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
        
        // Dialogue d'ajout de commentaire
        if (showCommentDialog) {
            AlertDialog(
                onDismissRequest = { showCommentDialog = false },
                title = { Text("Ajouter un commentaire") },
                text = {
                    OutlinedTextField(
                        value = commentText,
                        onValueChange = { commentText = it },
                        placeholder = { Text("Écrivez votre commentaire...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            // Ajouter le commentaire
                            showCommentDialog = false
                            commentText = ""
                        }
                    ) {
                        Text("Publier")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showCommentDialog = false }) {
                        Text("Annuler")
                    }
                }
            )
        }
    }
}

@Composable
fun CommentItem(comment: Comment) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        AsyncImage(
            model = comment.userPhotoUrl,
            contentDescription = null,
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Column(modifier = Modifier.weight(1f)) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFF3F4F6)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = comment.userName,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = comment.content,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF4B5563)
                    )
                }
            }
            
            Text(
                text = formatRelativeTime(comment.date),
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(start = 12.dp, top = 4.dp)
            )
        }
    }
}

// Modèles de données
data class Testimony(
    val id: String,
    val userName: String,
    val userPhotoUrl: String,
    val title: String,
    val content: String,
    val category: String,
    val date: Long,
    val likes: Int,
    val commentsCount: Int,
    val shares: Int,
    val isPinned: Boolean
)

data class Comment(
    val id: String,
    val userName: String,
    val userPhotoUrl: String,
    val content: String,
    val date: Long
)

// Fonctions utilitaires
private fun getCategoryLabel(category: String): String {
    return when (category) {
        "GUERISON" -> "Guérison"
        "MIRACLE" -> "Miracle"
        "REPONSE_PRIERE" -> "Réponse à la prière"
        "DELIVRANCE" -> "Délivrance"
        "PROVISION" -> "Provision"
        else -> category
    }
}

private fun formatDate(timestamp: Long): String {
    val sdf = SimpleDateFormat("dd MMMM yyyy", Locale.FRENCH)
    return sdf.format(Date(timestamp))
}

private fun formatRelativeTime(timestamp: Long): String {
    val now = System.currentTimeMillis()
    val diff = now - timestamp
    
    val hours = diff / (1000 * 60 * 60)
    val days = diff / (1000 * 60 * 60 * 24)
    
    return when {
        hours < 1 -> "À l'instant"
        hours < 24 -> "Il y a ${hours}h"
        days < 7 -> "Il y a ${days}j"
        else -> formatDate(timestamp)
    }
}
