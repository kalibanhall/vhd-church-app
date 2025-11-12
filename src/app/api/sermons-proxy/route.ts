import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    const url = queryString ? `${API_URL}/sermons?${queryString}` : `${API_URL}/sermons`
    
    console.log('🔄 Proxying GET sermons request to:', url)
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = token
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const data = await response.json()
    
    console.log('✅ Backend sermons response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de récupération des prédications' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Sermons proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

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
    
    console.log('🔄 Proxying POST sermons request to:', `${API_URL}/sermons`)
    
    const response = await fetch(`${API_URL}/sermons`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    console.log('✅ Backend create sermon response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de création de la prédication' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Create sermon proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
