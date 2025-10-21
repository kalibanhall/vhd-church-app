import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '../../../lib/fallback-data';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      preachings: fallbackData.preachings,
      fallback: true,
      message: 'Application en mode dégradé - Base de données en configuration'
    });

  } catch (error: any) {
    console.error('❌ Erreur preachings fallback:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des prédications',
      preachings: []
    }, { status: 500 });
  }
}