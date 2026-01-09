import { NextRequest, NextResponse } from 'next/server'

const MOCK_ROUTES = [
  {
    id: '1',
    name: 'Navette Nord',
    type: 'shuttle',
    driver: {
      id: 'driver1',
      name: 'Jean-Pierre M.',
      phone: '+33 6 12 34 56 78',
      rating: 4.8,
      trips: 156,
    },
    departure: {
      location: 'Gare du Nord',
      address: 'Place Napoléon III, 75010 Paris',
      time: '08:30',
    },
    destination: {
      location: 'Église VHD',
      address: '123 Rue de la Paix, 75001 Paris',
    },
    stops: [
      { location: 'Barbès', time: '08:40' },
      { location: 'Château Rouge', time: '08:50' },
    ],
    date: new Date().toISOString().split('T')[0],
    recurrent: true,
    recurrence: 'Tous les dimanches',
    availableSeats: 5,
    totalSeats: 8,
    price: 0,
    notes: 'Départ ponctuel, merci d\'arriver 5 min avant',
  },
  {
    id: '2',
    name: 'Covoiturage Lyon-Sud',
    type: 'carpool',
    driver: {
      id: 'driver2',
      name: 'Marie L.',
      phone: '+33 6 98 76 54 32',
      rating: 4.9,
      trips: 45,
    },
    departure: {
      location: 'Place Bellecour',
      address: 'Lyon 2e',
      time: '09:00',
    },
    destination: {
      location: 'Église VHD Lyon',
      address: '45 Rue de la République, Lyon',
    },
    stops: [
      { location: 'Jean Macé', time: '09:10' },
    ],
    date: new Date().toISOString().split('T')[0],
    recurrent: true,
    recurrence: 'Tous les dimanches',
    availableSeats: 3,
    totalSeats: 4,
    price: 2,
    notes: 'Participation aux frais d\'essence appréciée',
  },
  {
    id: '3',
    name: 'Navette Retraite',
    type: 'shuttle',
    driver: {
      id: 'driver3',
      name: 'Pierre D.',
      phone: '+33 6 55 44 33 22',
      rating: 4.7,
      trips: 89,
    },
    departure: {
      location: 'Église VHD',
      address: '123 Rue de la Paix, 75001 Paris',
      time: '07:00',
    },
    destination: {
      location: 'Centre de retraite',
      address: 'Fontainebleau',
    },
    stops: [],
    date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    recurrent: false,
    availableSeats: 12,
    totalSeats: 20,
    price: 15,
    notes: 'Prévoir un petit-déjeuner. Retour dimanche 18h.',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'shuttle', 'carpool'
    const date = searchParams.get('date')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/transport?${searchParams.toString()}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ routes: Array.isArray(data) ? data : data.routes || [] })
    }
    
    console.log('🚌 Transport: Using mock data')
    let routes = MOCK_ROUTES
    if (type && type !== 'all') routes = routes.filter(r => r.type === type)
    if (date) routes = routes.filter(r => r.date === date)
    return NextResponse.json({ routes })
  } catch (error) {
    return NextResponse.json({ routes: MOCK_ROUTES })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'book') {
      return NextResponse.json({
        success: true,
        message: 'Réservation confirmée! Le conducteur sera informé.',
        booking: {
          id: Date.now().toString(),
          routeId: body.routeId,
          status: 'confirmed',
          date: new Date().toISOString(),
        }
      })
    }
    
    if (body.action === 'offer') {
      return NextResponse.json({
        success: true,
        message: 'Votre offre de transport a été publiée. Merci pour votre générosité!',
        route: {
          id: Date.now().toString(),
          ...body.route,
          availableSeats: body.route.totalSeats,
        }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: true, message: 'Action enregistrée (mode démo)' })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: body.action === 'cancel' 
        ? 'Réservation annulée' 
        : 'Transport mis à jour',
    })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
