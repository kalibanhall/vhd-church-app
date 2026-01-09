/**
 * =============================================================================
 * SERVICE DE MESSAGERIE ET CHAT - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Messagerie instantanée entre membres
 * - Discussions de groupe
 * - Canaux thématiques
 * - Annonces de l'église
 * - Notifications en temps réel
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

// Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  attachments?: MessageAttachment[];
  replyTo?: string;
  readBy: string[];
  createdAt: Date;
  updatedAt?: Date;
  isDeleted: boolean;
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  description?: string;
  avatar?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  lastActivity: Date;
  createdAt: Date;
  createdBy: string;
  isArchived: boolean;
  settings: ConversationSettings;
}

export interface ConversationParticipant {
  userId: string;
  userName: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  lastSeen?: Date;
  isMuted: boolean;
  unreadCount: number;
}

export interface ConversationSettings {
  allowReactions: boolean;
  allowReplies: boolean;
  allowFiles: boolean;
  allowImages: boolean;
  maxFileSize: number; // en Mo
  onlyAdminsCanPost?: boolean;
  notificationsEnabled: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'general' | 'ministry' | 'prayer' | 'announcement' | 'social';
  isPublic: boolean;
  isReadOnly: boolean;
  memberCount: number;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'members' | 'leaders' | 'ministry' | 'custom';
  ministryIds?: string[];
  expiresAt?: Date;
  isPinned: boolean;
  readBy: string[];
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// SERVICE DE MESSAGERIE
// ============================================================================

export class MessagingService {
  
  /**
   * Créer une nouvelle conversation directe
   */
  static createDirectConversation(
    userId1: string,
    userName1: string,
    userId2: string,
    userName2: string
  ): Conversation {
    const now = new Date();
    
    return {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'direct',
      participants: [
        {
          userId: userId1,
          userName: userName1,
          role: 'member',
          joinedAt: now,
          isMuted: false,
          unreadCount: 0
        },
        {
          userId: userId2,
          userName: userName2,
          role: 'member',
          joinedAt: now,
          isMuted: false,
          unreadCount: 0
        }
      ],
      lastActivity: now,
      createdAt: now,
      createdBy: userId1,
      isArchived: false,
      settings: {
        allowReactions: true,
        allowReplies: true,
        allowFiles: true,
        allowImages: true,
        maxFileSize: 10,
        notificationsEnabled: true
      }
    };
  }

  /**
   * Créer une conversation de groupe
   */
  static createGroupConversation(
    name: string,
    description: string,
    creatorId: string,
    creatorName: string,
    participants: Array<{ userId: string; userName: string }>
  ): Conversation {
    const now = new Date();
    
    return {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'group',
      name,
      description,
      participants: [
        {
          userId: creatorId,
          userName: creatorName,
          role: 'admin',
          joinedAt: now,
          isMuted: false,
          unreadCount: 0
        },
        ...participants.map(p => ({
          userId: p.userId,
          userName: p.userName,
          role: 'member' as const,
          joinedAt: now,
          isMuted: false,
          unreadCount: 0
        }))
      ],
      lastActivity: now,
      createdAt: now,
      createdBy: creatorId,
      isArchived: false,
      settings: {
        allowReactions: true,
        allowReplies: true,
        allowFiles: true,
        allowImages: true,
        maxFileSize: 25,
        notificationsEnabled: true
      }
    };
  }

  /**
   * Créer un message
   */
  static createMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: Message['type'] = 'text',
    attachments?: MessageAttachment[],
    replyTo?: string
  ): Message {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId,
      senderName,
      content,
      type,
      attachments,
      replyTo,
      readBy: [senderId],
      createdAt: new Date(),
      isDeleted: false,
      reactions: []
    };
  }

  /**
   * Formater un message pour l'affichage
   */
  static formatMessageTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  /**
   * Vérifier si un utilisateur peut envoyer un message
   */
  static canSendMessage(
    conversation: Conversation,
    userId: string
  ): { allowed: boolean; reason?: string } {
    const participant = conversation.participants.find(p => p.userId === userId);
    
    if (!participant) {
      return { allowed: false, reason: 'Vous n\'êtes pas membre de cette conversation' };
    }

    if (conversation.isArchived) {
      return { allowed: false, reason: 'Cette conversation est archivée' };
    }

    if (conversation.settings.onlyAdminsCanPost && participant.role === 'member') {
      return { allowed: false, reason: 'Seuls les administrateurs peuvent poster dans ce canal' };
    }

    return { allowed: true };
  }

  /**
   * Obtenir les canaux par défaut de l'église
   */
  static getDefaultChannels(): Channel[] {
    return [
      {
        id: 'channel_general',
        name: 'Général',
        description: 'Discussions générales de la communauté',
        icon: '💬',
        category: 'general',
        isPublic: true,
        isReadOnly: false,
        memberCount: 0,
        createdAt: new Date()
      },
      {
        id: 'channel_announcements',
        name: 'Annonces',
        description: 'Annonces officielles de l\'église',
        icon: '📢',
        category: 'announcement',
        isPublic: true,
        isReadOnly: true,
        memberCount: 0,
        createdAt: new Date()
      },
      {
        id: 'channel_prayer',
        name: 'Prières',
        description: 'Partagez vos intentions de prière',
        icon: '🙏',
        category: 'prayer',
        isPublic: true,
        isReadOnly: false,
        memberCount: 0,
        createdAt: new Date()
      },
      {
        id: 'channel_youth',
        name: 'Jeunesse',
        description: 'Canal du ministère jeunesse',
        icon: '🌟',
        category: 'ministry',
        isPublic: true,
        isReadOnly: false,
        memberCount: 0,
        createdAt: new Date()
      },
      {
        id: 'channel_worship',
        name: 'Louange',
        description: 'Canal de l\'équipe de louange',
        icon: '🎵',
        category: 'ministry',
        isPublic: true,
        isReadOnly: false,
        memberCount: 0,
        createdAt: new Date()
      },
      {
        id: 'channel_social',
        name: 'Café virtuel',
        description: 'Échanges informels et convivialité',
        icon: '☕',
        category: 'social',
        isPublic: true,
        isReadOnly: false,
        memberCount: 0,
        createdAt: new Date()
      }
    ];
  }
}

// ============================================================================
// SERVICE D'ANNONCES
// ============================================================================

export class AnnouncementService {
  
  /**
   * Créer une annonce
   */
  static createAnnouncement(
    title: string,
    content: string,
    authorId: string,
    authorName: string,
    options: {
      priority?: Announcement['priority'];
      targetAudience?: Announcement['targetAudience'];
      ministryIds?: string[];
      expiresAt?: Date;
      isPinned?: boolean;
    } = {}
  ): Announcement {
    return {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      authorId,
      authorName,
      priority: options.priority || 'normal',
      targetAudience: options.targetAudience || 'all',
      ministryIds: options.ministryIds,
      expiresAt: options.expiresAt,
      isPinned: options.isPinned || false,
      readBy: [],
      createdAt: new Date()
    };
  }

  /**
   * Obtenir la couleur de priorité
   */
  static getPriorityColor(priority: Announcement['priority']): string {
    const colors = {
      low: '#6b7280',
      normal: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444'
    };
    return colors[priority];
  }

  /**
   * Obtenir le badge de priorité
   */
  static getPriorityBadge(priority: Announcement['priority']): { text: string; class: string } {
    const badges = {
      low: { text: 'Info', class: 'bg-gray-100 text-gray-800' },
      normal: { text: 'Normal', class: 'bg-blue-100 text-blue-800' },
      high: { text: 'Important', class: 'bg-amber-100 text-amber-800' },
      urgent: { text: 'Urgent', class: 'bg-red-100 text-red-800' }
    };
    return badges[priority];
  }

  /**
   * Filtrer les annonces par audience
   */
  static filterByAudience(
    announcements: Announcement[],
    userId: string,
    userRole: string,
    userMinistries: string[]
  ): Announcement[] {
    return announcements.filter(ann => {
      // Annonces expirées
      if (ann.expiresAt && new Date(ann.expiresAt) < new Date()) {
        return false;
      }

      switch (ann.targetAudience) {
        case 'all':
          return true;
        case 'members':
          return userRole !== 'VISITOR';
        case 'leaders':
          return ['ADMIN', 'PASTOR', 'LEADER'].includes(userRole);
        case 'ministry':
          return ann.ministryIds?.some(id => userMinistries.includes(id)) || false;
        case 'custom':
          return true; // Logique personnalisée à implémenter
        default:
          return true;
      }
    });
  }
}

const messagingExports = {
  MessagingService,
  AnnouncementService
};

export default messagingExports;
