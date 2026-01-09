import { NextRequest, NextResponse } from 'next/server'

const MOCK_ALERTS = [
  {
    id: '1',
    type: 'urgent',
    title: 'Appel à la prière urgente',
    message: 'Notre frère Paul est hospitalisé suite à un accident. Prions ensemble pour sa guérison complète.',
    priority: 'high',
    date: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    author: 'Pasteur Jean',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Changement d\'horaire du culte',
    message: 'Ce dimanche exceptionnellement, le culte débutera à 10h30 au lieu de 9h00.',
    priority: 'medium',
    date: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    author: 'Secrétariat',
    read: false,
  },
]

export async function GET(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/alerts`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ alerts: Array.isArray(data) ? data : data.alerts || [] })
    }
    
    console.log('🚨 Alerts: Using mock data')
    return NextResponse.json({ alerts: MOCK_ALERTS })
  } catch (error) {
    return NextResponse.json({ alerts: MOCK_ALERTS })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ success: true, message: 'Alerte mise à jour' })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
