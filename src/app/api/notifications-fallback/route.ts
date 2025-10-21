import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '../../../lib/fallback-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread') === 'true';
    
    // Pour l'instant, toujours retourner un tableau vide pour les notifications
    return NextResponse.json({
      success: true,
      notifications: [],
      fallback: true,
      message: 'Notifications temporairement désactivées - Base de données en configuration'
    });

  } catch (error: any) {
    console.error('❌ Erreur notifications fallback:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des notifications',
      notifications: []
    }, { status: 500 });
  }
}