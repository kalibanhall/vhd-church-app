/**
 * API Routes - Channels Management
 * 
 * GET  /api/chat/channels - Liste des canaux
 * POST /api/chat/channels - Créer un canal
 */

import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/lib/services/messaging-service';

// Initialiser avec les canaux par défaut
let channels = MessagingService.getDefaultChannels();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('isPublic');

    let filteredChannels = [...channels];

    if (category) {
      filteredChannels = filteredChannels.filter(ch => ch.category === category);
    }

    if (isPublic !== null) {
      filteredChannels = filteredChannels.filter(ch => ch.isPublic === (isPublic === 'true'));
    }

    return NextResponse.json({
      success: true,
      data: filteredChannels,
      total: filteredChannels.length,
      categories: ['general', 'ministry', 'prayer', 'announcement', 'social']
    });
  } catch (error) {
    console.error('[Channels GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des canaux' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, category, isPublic, isReadOnly } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Le nom du canal est requis' },
        { status: 400 }
      );
    }

    // Vérifier si le canal existe déjà
    if (channels.some(ch => ch.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Un canal avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    const newChannel = {
      id: `channel_${Date.now()}`,
      name,
      description: description || '',
      icon: icon || '💬',
      category: category || 'general',
      isPublic: isPublic !== false,
      isReadOnly: isReadOnly || false,
      memberCount: 0,
      createdAt: new Date()
    };

    channels.push(newChannel);

    return NextResponse.json({
      success: true,
      message: 'Canal créé avec succès',
      data: newChannel
    }, { status: 201 });
  } catch (error) {
    console.error('[Channels POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du canal' },
      { status: 500 }
    );
  }
}
