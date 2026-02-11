/**
 * Route proxy pour les templates de notifications - Frontend
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { NextRequest, NextResponse } from 'next/server'

// Templates de notifications prédéfinis
const NOTIFICATION_TEMPLATES = [
  {
    id: 'welcome',
    title: 'Bienvenue',
    message: 'Bienvenue dans la famille MyChurchApp ! Nous sommes heureux de vous accueillir.',
    type: 'info'
  },
  {
    id: 'event_reminder',
    title: 'Rappel d\'événement',
    message: 'N\'oubliez pas notre événement qui aura lieu {{date}} à {{location}}.',
    type: 'info'
  },
  {
    id: 'prayer_approved',
    title: 'Prière approuvée',
    message: 'Votre intention de prière a été approuvée et sera partagée avec la communauté.',
    type: 'success'
  },
  {
    id: 'testimony_approved',
    title: 'Témoignage approuvé',
    message: 'Votre témoignage a été approuvé. Merci de partager votre foi !',
    type: 'success'
  },
  {
    id: 'donation_thanks',
    title: 'Merci pour votre don',
    message: 'Merci pour votre généreuse contribution de {{amount}} {{currency}}. Que Dieu vous bénisse !',
    type: 'success'
  },
  {
    id: 'appointment_confirmed',
    title: 'Rendez-vous confirmé',
    message: 'Votre rendez-vous avec {{pastor}} le {{date}} à {{time}} est confirmé.',
    type: 'success'
  },
  {
    id: 'appointment_reminder',
    title: 'Rappel de rendez-vous',
    message: 'Rappel : Vous avez un rendez-vous demain à {{time}} avec {{pastor}}.',
    type: 'warning'
  },
  {
    id: 'custom',
    title: 'Message personnalisé',
    message: '',
    type: 'info'
  }
]

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      templates: NOTIFICATION_TEMPLATES
    })
  } catch (error) {
    console.error('Erreur admin/notifications/templates:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des templates' },
      { status: 500 }
    )
  }
}
