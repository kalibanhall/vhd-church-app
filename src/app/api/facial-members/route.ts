/**
 * Route proxy pour les membres avec reconnaissance faciale - Frontend
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
    const withFaceDescriptor = searchParams.get('withFaceDescriptor')
    const withoutFaceDescriptor = searchParams.get('withoutFaceDescriptor')

    // Construire les paramètres
    let queryParams = ''
    if (withFaceDescriptor === 'true') {
      queryParams = '?withFaceDescriptor=true'
    } else if (withoutFaceDescriptor === 'true') {
      queryParams = '?withoutFaceDescriptor=true'
    }

    const response = await fetch(`${API_URL}/facial-recognition/members${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de récupération des membres' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur facial-members:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des membres' },
      { status: 500 }
    )
  }
}
