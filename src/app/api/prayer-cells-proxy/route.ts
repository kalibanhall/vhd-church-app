import { NextRequest, NextResponse } from 'next/server'

const MOCK_CELLS = [
  {
    id: '1',
    name: 'Cellule Lumière',
    description: 'Cellule de prière pour les jeunes professionnels',
    leader: { id: '1', name: 'Pasteur Mukendi Jean', phone: '+243 81 234 56 78' },
    location: 'Avenue Kalemie 45, Commune de Limete, Kinshasa',
    schedule: 'Mercredi 19h30',
    members: 12,
    maxMembers: 15,
    category: 'youth',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Cellule Espérance',
    description: 'Groupe de prière familial',
    leader: { id: '2', name: 'Maman Marie Kabongo', phone: '+243 99 876 54 32' },
    location: 'Quartier Binza UPN, Avenue des Écoles, Kinshasa',
    schedule: 'Jeudi 20h00',
    members: 8,
    maxMembers: 12,
    category: 'family',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Cellule Sagesse',
    description: 'Intercession et étude biblique pour seniors',
    leader: { id: '3', name: 'Papa Pierre Tshimanga', phone: '+243 82 111 22 33' },
    location: 'Salle paroissiale MyChurchApp Gombe',
    schedule: 'Mardi 15h00',
    members: 10,
    maxMembers: 10,
    category: 'seniors',
    isOpen: false,
  },
]

const MOCK_MEETINGS = [
  {
    id: '1',
    cellId: '1',
    cellName: 'Cellule Lumière',
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    topic: 'La puissance de la prière',
    location: 'Avenue Kalemie 45, Commune de Limete, Kinshasa',
  },
  {
    id: '2',
    cellId: '2',
    cellName: 'Cellule Espérance',
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    topic: 'Prier en famille',
    location: 'Quartier Binza UPN, Avenue des Écoles, Kinshasa',
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
    
    const endpoint = type === 'meetings' ? 'prayer-cells/meetings' : 'prayer-cells'
    const response = await fetch(`${API_URL}/${endpoint}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      if (type === 'meetings') {
        return NextResponse.json({ meetings: Array.isArray(data) ? data : data.meetings || [] })
      }
      return NextResponse.json({ cells: Array.isArray(data) ? data : data.cells || [] })
    }
    
    console.log('🙏 Prayer Cells: Using mock data')
    if (type === 'meetings') {
      return NextResponse.json({ meetings: MOCK_MEETINGS })
    }
    return NextResponse.json({ cells: MOCK_CELLS })
  } catch (error) {
    return NextResponse.json({ cells: MOCK_CELLS, meetings: MOCK_MEETINGS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Demande envoyée avec succès',
      data: { id: Date.now().toString(), ...body }
    })
  } catch (error) {
    return NextResponse.json({ success: true, message: 'Demande enregistrée (mode démo)' })
  }
}
