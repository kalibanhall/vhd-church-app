import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '../../../lib/fallback-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const past = searchParams.get('past') === 'true';
    const homepage = searchParams.get('homepage') === 'true';

    let events = fallbackData.events;
    
    const now = new Date();
    
    if (upcoming || homepage) {
      events = events.filter(event => new Date(event.startDate) >= now);
    } else if (past) {
      events = events.filter(event => new Date(event.startDate) < now);
    }
    
    return NextResponse.json({
      success: true,
      events,
      fallback: true,
      message: 'Application en mode dégradé - Base de données en configuration'
    });

  } catch (error: any) {
    console.error('❌ Erreur events fallback:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des événements',
      events: []
    }, { status: 500 });
  }
}