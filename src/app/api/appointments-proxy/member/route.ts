/**
 * Route proxy pour les rendez-vous des membres - Frontend
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
    const queryString = searchParams.toString()
    
    const url = queryString 
      ? `${API_URL}/appointments/member?${queryString}` 
      : `${API_URL}/appointments/member`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Member appointments error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Erreur de récupération des rendez-vous' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Ensure consistent response format
    return NextResponse.json({
      success: true,
      appointments: Array.isArray(data) ? data : (data.appointments || data.data || [])
    })
  } catch (error: any) {
    console.error('❌ Member appointments proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
