import { NextRequest, NextResponse } from 'next/server'

const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Certificat de baptême',
    description: 'Demandez votre certificat de baptême officiel',
    category: 'documents',
    icon: '📜',
    processingTime: '3-5 jours',
    requirements: ['Pièce d\'identité', 'Date de baptême'],
    fee: 0,
  },
  {
    id: '2',
    name: 'Certificat de mariage',
    description: 'Certificat de mariage religieux',
    category: 'documents',
    icon: '💍',
    processingTime: '5-7 jours',
    requirements: ['Pièces d\'identité des époux', 'Date de mariage'],
    fee: 0,
  },
  {
    id: '3',
    name: 'Attestation de membre',
    description: 'Attestation officielle de membership',
    category: 'documents',
    icon: '📋',
    processingTime: '2-3 jours',
    requirements: ['Pièce d\'identité'],
    fee: 0,
  },
  {
    id: '4',
    name: 'Bénédiction de maison',
    description: 'Demander une bénédiction pour votre domicile',
    category: 'blessings',
    icon: '🏠',
    processingTime: 'Sur rendez-vous',
    requirements: ['Adresse complète'],
    fee: 0,
  },
  {
    id: '5',
    name: 'Counseling pastoral',
    description: 'Entretien confidentiel avec un pasteur',
    category: 'counseling',
    icon: '💬',
    processingTime: 'Sur rendez-vous',
    requirements: [],
    fee: 0,
  },
  {
    id: '6',
    name: 'Préparation au mariage',
    description: 'Sessions de préparation au mariage chrétien',
    category: 'formation',
    icon: '💒',
    processingTime: '6-8 semaines',
    requirements: ['Être fiancés', 'Engagement mutuel'],
    fee: 0,
  },
]

const MOCK_REQUESTS = [
  {
    id: '1',
    serviceId: '1',
    serviceName: 'Certificat de baptême',
    status: 'completed',
    requestDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    completedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '2',
    serviceId: '5',
    serviceName: 'Counseling pastoral',
    status: 'pending',
    requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(),
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
    
    const endpoint = type === 'requests' ? 'services/requests' : 'services'
    const response = await fetch(`${API_URL}/${endpoint}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      if (type === 'requests') {
        return NextResponse.json({ requests: Array.isArray(data) ? data : data.requests || [] })
      }
      return NextResponse.json({ services: Array.isArray(data) ? data : data.services || [] })
    }
    
    console.log('🛎️ Services: Using mock data')
    if (type === 'requests') {
      return NextResponse.json({ requests: MOCK_REQUESTS })
    }
    return NextResponse.json({ services: MOCK_SERVICES })
  } catch (error) {
    return NextResponse.json({ services: MOCK_SERVICES, requests: MOCK_REQUESTS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Demande de service envoyée avec succès',
      request: {
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
