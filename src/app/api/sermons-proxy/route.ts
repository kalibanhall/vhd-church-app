import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    // Corriger l'endpoint: /preachings au lieu de /sermons
    const url = queryString ? `${API_URL}/preachings?${queryString}` : `${API_URL}/preachings`
    
    console.log('🔄 Proxying GET preachings request to:', url)
    
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend preachings error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Erreur de récupération des prédications' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log('✅ Backend preachings response:', response.status, 'data sample:', data?.slice?.(0, 1) || data)

    // Normaliser les données du backend pour le frontend
    let sermons = Array.isArray(data) ? data : (data.data || data.preachings || [])
    
    // Mapper les champs pour assurer la compatibilité
    sermons = sermons.map((sermon: any) => ({
      ...sermon,
      // Normaliser le nom du pasteur
      pastor_name: sermon.pastor_name || sermon.pastorName || sermon.pastor?.name || sermon.pastor?.firstName + ' ' + sermon.pastor?.lastName || '',
      // Normaliser la date
      sermon_date: sermon.sermon_date || sermon.sermonDate || sermon.date || sermon.preachingDate || new Date().toISOString(),
      // Normaliser les autres champs
      media_type: sermon.media_type || sermon.mediaType || sermon.type || 'TEXT',
      media_url: sermon.media_url || sermon.mediaUrl || sermon.videoUrl || sermon.audioUrl || '',
      thumbnail_url: sermon.thumbnail_url || sermon.thumbnailUrl || '',
      view_count: sermon.view_count ?? sermon.viewCount ?? 0,
      is_published: sermon.is_published ?? sermon.isPublished ?? true
    }))

    // Mapper data.data vers sermons pour compatibilité frontend
    return NextResponse.json({
      success: true,
      sermons: sermons
    })
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
    
    console.log('🔄 Proxying POST preachings request to:', `${API_URL}/preachings`)
    
    const response = await fetch(`${API_URL}/preachings`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    console.log('✅ Backend create preaching response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de création de la prédication' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Create preaching proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
