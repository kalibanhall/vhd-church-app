/**
 * API Routes - Conversations Management
 * 
 * GET  /api/chat/conversations - Liste des conversations
 * POST /api/chat/conversations - Créer une conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/lib/services/messaging-service';

// Stockage temporaire
let conversations: any[] = [];

// Initialiser avec des conversations de démonstration
if (conversations.length === 0) {
  conversations = [
    {
      ...MessagingService.createDirectConversation(
        'user_1', 'Jean Dupont',
        'user_2', 'Marie Martin'
      ),
      id: 'conv_demo_1',
      lastMessage: {
        id: 'msg_1',
        content: 'Bonjour ! Comment vas-tu ?',
        senderId: 'user_2',
        senderName: 'Marie Martin',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    },
    {
      ...MessagingService.createGroupConversation(
        'Équipe Louange',
        'Discussion de l\'équipe de louange',
        'user_1', 'Jean Dupont',
        [
          { userId: 'user_2', userName: 'Marie Martin' },
          { userId: 'user_3', userName: 'Pierre Bernard' }
        ]
      ),
      id: 'conv_demo_2',
      lastMessage: {
        id: 'msg_2',
        content: 'Répétition samedi à 14h !',
        senderId: 'user_1',
        senderName: 'Jean Dupont',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // direct, group, channel

    let filteredConversations = [...conversations];

    // Filtrer par utilisateur
    if (userId) {
      filteredConversations = filteredConversations.filter(conv =>
        conv.participants.some((p: any) => p.userId === userId)
      );
    }

    // Filtrer par type
    if (type) {
      filteredConversations = filteredConversations.filter(conv => conv.type === type);
    }

    // Trier par dernière activité
    filteredConversations.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredConversations,
      total: filteredConversations.length
    });
  } catch (error) {
    console.error('[Conversations GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, description, creatorId, creatorName, participants } = body;

    if (!creatorId || !creatorName) {
      return NextResponse.json(
        { success: false, error: 'creatorId et creatorName sont requis' },
        { status: 400 }
      );
    }

    let conversation;

    if (type === 'direct') {
      if (!participants || participants.length !== 1) {
        return NextResponse.json(
          { success: false, error: 'Une conversation directe nécessite exactement un autre participant' },
          { status: 400 }
        );
      }

      // Vérifier si une conversation directe existe déjà
      const existingConv = conversations.find(conv =>
        conv.type === 'direct' &&
        conv.participants.some((p: any) => p.userId === creatorId) &&
        conv.participants.some((p: any) => p.userId === participants[0].userId)
      );

      if (existingConv) {
        return NextResponse.json({
          success: true,
          data: existingConv,
          existing: true
        });
      }

      conversation = MessagingService.createDirectConversation(
        creatorId, creatorName,
        participants[0].userId, participants[0].userName
      );
    } else if (type === 'group') {
      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Un nom est requis pour les groupes' },
          { status: 400 }
        );
      }

      conversation = MessagingService.createGroupConversation(
        name,
        description || '',
        creatorId,
        creatorName,
        participants || []
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Type de conversation invalide' },
        { status: 400 }
      );
    }

    conversations.push(conversation);

    return NextResponse.json({
      success: true,
      message: 'Conversation créée avec succès',
      data: conversation
    }, { status: 201 });
  } catch (error) {
    console.error('[Conversations POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la conversation' },
      { status: 500 }
    );
  }
}
