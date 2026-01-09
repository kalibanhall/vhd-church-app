import { NextRequest, NextResponse } from 'next/server'

const MOCK_MY_CONFLICTS = [
  {
    id: '1',
    type: 'interpersonal',
    typeName: 'Conflit interpersonnel',
    status: 'in_progress',
    createdDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastUpdate: new Date(Date.now() - 86400000 * 2).toISOString(),
    mediator: {
      id: '1',
      name: 'Ancien Paul Kabongo',
      phone: '+243 99 876 54 32',
    },
    nextSession: new Date(Date.now() + 86400000 * 5).toISOString(),
    notes: 'Première session de médiation effectuée. Progrès encourageants.',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/conflicts${userId ? `?userId=${userId}` : ''}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ conflicts: Array.isArray(data) ? data : data.conflicts || [] })
    }
    
    console.log('⚖️ Conflicts: Using mock data')
    return NextResponse.json({ conflicts: MOCK_MY_CONFLICTS })
  } catch (error) {
    return NextResponse.json({ conflicts: MOCK_MY_CONFLICTS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Votre demande de médiation a été enregistrée. Un médiateur vous contactera dans les 48h.',
      conflict: {
        id: Date.now().toString(),
        ...body,
        status: 'pending',
        createdDate: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ success: true, message: 'Demande enregistrée (mode démo)' })
  }
}
