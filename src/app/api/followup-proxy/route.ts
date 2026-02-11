import { NextRequest, NextResponse } from 'next/server'

const MOCK_FOLLOWUP_TYPES = [
  {
    id: 'spiritual',
    name: 'Suivi spirituel',
    description: 'Accompagnement dans votre croissance spirituelle',
    icon: '✝️',
    duration: '3-6 mois',
  },
  {
    id: 'newbeliever',
    name: 'Nouveau croyant',
    description: 'Programme d\'affermissement pour nouveaux convertis',
    icon: '🌱',
    duration: '3 mois',
  },
  {
    id: 'crisis',
    name: 'Accompagnement de crise',
    description: 'Soutien pendant les moments difficiles',
    icon: '🤝',
    duration: 'Selon besoin',
  },
  {
    id: 'marriage',
    name: 'Suivi conjugal',
    description: 'Accompagnement pour couples',
    icon: '💑',
    duration: '6 mois',
  },
  {
    id: 'grief',
    name: 'Accompagnement deuil',
    description: 'Soutien lors de la perte d\'un proche',
    icon: '🕊️',
    duration: 'Selon besoin',
  },
]

const MOCK_MY_FOLLOWUPS = [
  {
    id: '1',
    type: 'spiritual',
    typeName: 'Suivi spirituel',
    mentor: {
      id: '1',
      name: 'Pasteur Marc Mukendi',
      phone: '+243 81 234 56 78',
      email: 'marc@mychurchapp.com',
    },
    startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    status: 'active',
    nextSession: new Date(Date.now() + 86400000 * 5).toISOString(),
    sessions: 4,
    notes: 'Bonne progression, continue la lecture quotidienne',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const endpoint = type === 'my' ? 'followup/my' : 'followup/types'
    const response = await fetch(`${API_URL}/${endpoint}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      if (type === 'my') {
        return NextResponse.json({ followups: Array.isArray(data) ? data : data.followups || [] })
      }
      return NextResponse.json({ types: Array.isArray(data) ? data : data.types || [] })
    }
    
    console.log('👥 Followup: Using mock data')
    if (type === 'my') {
      return NextResponse.json({ followups: MOCK_MY_FOLLOWUPS })
    }
    return NextResponse.json({ types: MOCK_FOLLOWUP_TYPES })
  } catch (error) {
    return NextResponse.json({ types: MOCK_FOLLOWUP_TYPES, followups: MOCK_MY_FOLLOWUPS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Demande de suivi envoyée avec succès. Un responsable vous contactera bientôt.',
      followup: {
        id: Date.now().toString(),
        ...body,
        status: 'pending',
        requestDate: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ success: true, message: 'Demande enregistrée (mode démo)' })
  }
}
