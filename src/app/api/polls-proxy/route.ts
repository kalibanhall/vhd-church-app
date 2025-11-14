import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, createBearerToken } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    const url = queryString ? `${API_URL}/polls?${queryString}` : `${API_URL}/polls`
    
    console.log('🔍 GET /api/polls-proxy - Calling:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': createBearerToken(token),
        'Content-Type': 'application/json',
      },
    })

    console.log('📊 Polls response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Polls backend error:', errorText)
      return NextResponse.json(
        { error: errorText || 'Erreur de récupération des sondages', polls: [] },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Polls data received:', { count: data?.polls?.length || data?.length || 0 })
    
    // Normaliser la réponse
    const polls = data.polls || data || []
    
    return NextResponse.json({ 
      success: true,
      polls: Array.isArray(polls) ? polls : []
    })
  } catch (error: any) {
    console.error('❌ Polls GET proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur', polls: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const response = await fetch(`${API_URL}/polls`, {
      method: 'POST',
      headers: {
        'Authorization': createBearerToken(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de création de sondage' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Polls POST proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
