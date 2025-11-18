/**
 * Route proxy pour les pasteurs disponibles - Frontend
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

    console.log('🔄 GET /api/pastors/available - Calling backend')

    // Récupérer les membres avec rôle PASTOR disponibles pour rendez-vous
    const response = await fetch(`${API_URL}/members?role=PASTOR,PASTEUR&status=ACTIVE`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Backend error:', response.status, data)
      return NextResponse.json(
        { error: data.error || 'Erreur de récupération des pasteurs' },
        { status: response.status }
      )
    }

    console.log('✅ Available pastors retrieved:', { count: data?.users?.length || data?.data?.length || 0 })

    // Normaliser la réponse
    const pastors = data.users || data.data || data || []

    return NextResponse.json({
      success: true,
      pastors: Array.isArray(pastors) ? pastors : []
    })
  } catch (error: any) {
    console.error('❌ Pastors available error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des pasteurs' },
      { status: 500 }
    )
  }
}
