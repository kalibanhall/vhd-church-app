import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      )
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    console.log('🔄 Proxying auth/me request to:', `${API_URL}/auth/me`)
    
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    console.log('✅ Backend auth/me response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Non authentifié' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Auth/me proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de vérification' },
      { status: 500 }
    )
  }
}
