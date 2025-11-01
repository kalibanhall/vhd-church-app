package com.mychurchapp.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Modèle de message chat correspondant à la table `messages` de PostgreSQL
 */
@JsonClass(generateAdapter = true)
data class ChatMessage(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "senderId")
    val senderId: String,
    
    @Json(name = "senderName")
    val senderName: String,
    
    @Json(name = "senderAvatar")
    val senderAvatar: String? = null,
    
    @Json(name = "channelId")
    val channelId: String,
    
    @Json(name = "content")
    val content: String,
    
    @Json(name = "messageType")
    val messageType: MessageType,
    
    @Json(name = "fileUrl")
    val fileUrl: String? = null,
    
    @Json(name = "fileName")
    val fileName: String? = null,
    
    @Json(name = "replyToId")
    val replyToId: String? = null,
    
    @Json(name = "timestamp")
    val timestamp: String,
    
    @Json(name = "isEdited")
    val isEdited: Boolean = false,
    
    @Json(name = "editedAt")
    val editedAt: String? = null,
    
    @Json(name = "reactions")
    val reactions: List<ChatReaction>? = null,
    
    @Json(name = "isDeleted")
    val isDeleted: Boolean = false
)

enum class MessageType {
    @Json(name = "text")
    TEXT,
    
    @Json(name = "image")
    IMAGE,
    
    @Json(name = "file")
    FILE,
    
    @Json(name = "voice")
    VOICE
}

/**
 * Canal de chat
 */
@JsonClass(generateAdapter = true)
data class ChatChannel(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "name")
    val name: String,
    
    @Json(name = "description")
    val description: String? = null,
    
    @Json(name = "type")
    val type: ChannelType,
    
    @Json(name = "createdBy")
    val createdBy: String,
    
    @Json(name = "createdAt")
    val createdAt: String,
    
    @Json(name = "memberIds")
    val memberIds: List<String>,
    
    @Json(name = "lastMessage")
    val lastMessage: ChatMessage? = null,
    
    @Json(name = "lastActivity")
    val lastActivity: String,
    
    @Json(name = "isArchived")
    val isArchived: Boolean = false,
    
    @Json(name = "settings")
    val settings: ChannelSettings
)

enum class ChannelType {
    @Json(name = "public")
    PUBLIC,
    
    @Json(name = "private")
    PRIVATE,
    
    @Json(name = "announcement")
    ANNOUNCEMENT,
    
    @Json(name = "prayer")
    PRAYER
}

@JsonClass(generateAdapter = true)
data class ChannelSettings(
    @Json(name = "allowMessages")
    val allowMessages: Boolean = true,
    
    @Json(name = "allowFiles")
    val allowFiles: Boolean = true,
    
    @Json(name = "allowImages")
    val allowImages: Boolean = true,
    
    @Json(name = "moderatorOnly")
    val moderatorOnly: Boolean = false
)

/**
 * Réaction à un message
 */
@JsonClass(generateAdapter = true)
data class ChatReaction(
    @Json(name = "id")
    val id: String,
    
    @Json(name = "messageId")
    val messageId: String,
    
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "emoji")
    val emoji: String,
    
    @Json(name = "timestamp")
    val timestamp: String
)

/**
 * Statut en ligne
 */
@JsonClass(generateAdapter = true)
data class OnlineStatus(
    @Json(name = "userId")
    val userId: String,
    
    @Json(name = "status")
    val status: UserOnlineStatus,
    
    @Json(name = "lastSeen")
    val lastSeen: String
)

enum class UserOnlineStatus {
    @Json(name = "online")
    ONLINE,
    
    @Json(name = "offline")
    OFFLINE,
    
    @Json(name = "away")
    AWAY,
    
    @Json(name = "busy")
    BUSY
}
