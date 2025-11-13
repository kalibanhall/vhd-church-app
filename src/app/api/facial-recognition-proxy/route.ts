import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    console.log('🔄 Proxying facial recognition request to:', `${API_URL}/facial-recognition`)
    
    const response = await fetch(`${API_URL}/facial-recognition`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    console.log('✅ Backend facial recognition response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur lors de l\'enregistrement facial' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Facial recognition proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    const url = userId ? `${API_URL}/facial-recognition?userId=${userId}` : `${API_URL}/facial-recognition`
    
    console.log('🔄 Proxying GET facial recognition request to:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    console.log('✅ Backend facial recognition GET response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur lors de la récupération des données faciales' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Facial recognition GET proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
