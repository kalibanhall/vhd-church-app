/**
 * Route proxy pour la validation admin - Frontend
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json({ error: 'Type requis (prayers, testimonies)' }, { status: 400 })
    }

    // Selon le type, appeler la bonne route
    const endpoint = type === 'prayers' ? 'prayers' : 'testimonies'
    
    const response = await fetch(`${API_URL}/${endpoint}?status=pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de récupération des validations' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur admin/validation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des validations' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { type, id, status, rejectionReason } = body

    if (!type || !id || !status) {
      return NextResponse.json(
        { error: 'Type, ID et status requis' },
        { status: 400 }
      )
    }

    const endpoint = type === 'prayers' ? 'prayers' : 'testimonies'
    
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, rejectionReason }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de validation' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur admin/validation PATCH:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la validation' },
      { status: 500 }
    )
  }
}
