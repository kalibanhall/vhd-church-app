/**
 * API Routes - Messages Management
 * 
 * GET  /api/chat/messages - Liste des messages d'une conversation
 * POST /api/chat/messages - Envoyer un message
 */

import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/lib/services/messaging-service';

// Stockage temporaire des messages
let messages: any[] = [];

// Initialiser avec des messages de démonstration
if (messages.length === 0) {
  messages = [
    {
      id: 'msg_demo_1',
      conversationId: 'conv_demo_1',
      senderId: 'user_1',
      senderName: 'Jean Dupont',
      content: 'Salut Marie ! Tu as vu le programme de dimanche ?',
      type: 'text',
      readBy: ['user_1', 'user_2'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isDeleted: false,
      reactions: [{ emoji: '👍', userId: 'user_2', userName: 'Marie Martin' }]
    },
    {
      id: 'msg_demo_2',
      conversationId: 'conv_demo_1',
      senderId: 'user_2',
      senderName: 'Marie Martin',
      content: 'Oui ! J\'ai hâte d\'y être 😊',
      type: 'text',
      readBy: ['user_1', 'user_2'],
      createdAt: new Date(Date.now() - 82800000).toISOString(),
      isDeleted: false,
      reactions: []
    },
    {
      id: 'msg_demo_3',
      conversationId: 'conv_demo_1',
      senderId: 'user_2',
      senderName: 'Marie Martin',
      content: 'Bonjour ! Comment vas-tu ?',
      type: 'text',
      readBy: ['user_2'],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isDeleted: false,
      reactions: []
    },
    {
      id: 'msg_demo_4',
      conversationId: 'conv_demo_2',
      senderId: 'user_1',
      senderName: 'Jean Dupont',
      content: 'Répétition samedi à 14h !',
      type: 'text',
      readBy: ['user_1', 'user_2'],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isDeleted: false,
      reactions: [
        { emoji: '✅', userId: 'user_2', userName: 'Marie Martin' },
        { emoji: '✅', userId: 'user_3', userName: 'Pierre Bernard' }
      ]
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const before = searchParams.get('before'); // Pour pagination
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId est requis' },
        { status: 400 }
      );
    }

    let filteredMessages = messages.filter(msg => 
      msg.conversationId === conversationId && !msg.isDeleted
    );

    // Pagination
    if (before) {
      const beforeDate = new Date(before);
      filteredMessages = filteredMessages.filter(msg => 
        new Date(msg.createdAt) < beforeDate
      );
    }

    // Trier par date (plus récent en dernier)
    filteredMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Limiter
    const paginatedMessages = filteredMessages.slice(-limit);

    return NextResponse.json({
      success: true,
      data: paginatedMessages,
      total: filteredMessages.length,
      hasMore: filteredMessages.length > limit
    });
  } catch (error) {
    console.error('[Messages GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderId, senderName, content, type = 'text', attachments, replyTo } = body;

    // Validation
    if (!conversationId || !senderId || !senderName || !content) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const newMessage = MessagingService.createMessage(
      conversationId,
      senderId,
      senderName,
      content,
      type,
      attachments,
      replyTo
    );

    messages.push({
      ...newMessage,
      createdAt: newMessage.createdAt.toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Message envoyé',
      data: {
        ...newMessage,
        createdAt: newMessage.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[Messages POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, action, userId, emoji } = body;

    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    if (action === 'react') {
      // Ajouter/retirer une réaction
      if (!emoji || !userId) {
        return NextResponse.json(
          { success: false, error: 'emoji et userId sont requis' },
          { status: 400 }
        );
      }

      const reactions = messages[messageIndex].reactions || [];
      const existingIndex = reactions.findIndex(
        (r: any) => r.emoji === emoji && r.userId === userId
      );

      if (existingIndex !== -1) {
        reactions.splice(existingIndex, 1);
      } else {
        reactions.push({ emoji, userId, userName: body.userName || 'Utilisateur' });
      }

      messages[messageIndex].reactions = reactions;

      return NextResponse.json({
        success: true,
        message: 'Réaction mise à jour',
        data: messages[messageIndex]
      });
    }

    if (action === 'read') {
      // Marquer comme lu
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'userId est requis' },
          { status: 400 }
        );
      }

      if (!messages[messageIndex].readBy.includes(userId)) {
        messages[messageIndex].readBy.push(userId);
      }

      return NextResponse.json({
        success: true,
        message: 'Message marqué comme lu',
        data: messages[messageIndex]
      });
    }

    if (action === 'delete') {
      // Supprimer (soft delete)
      messages[messageIndex].isDeleted = true;
      messages[messageIndex].content = 'Message supprimé';

      return NextResponse.json({
        success: true,
        message: 'Message supprimé',
        data: messages[messageIndex]
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Messages PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du message' },
      { status: 500 }
    );
  }
}
