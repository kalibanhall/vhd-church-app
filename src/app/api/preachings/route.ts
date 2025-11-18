/**
 * Route proxy pour les prédications - Frontend
 * Redirige vers l'API backend /v1/preachings
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value
    
    const url = queryString ? `${API_URL}/preachings?${queryString}` : `${API_URL}/preachings`
    
    console.log('🔄 GET /api/preachings - Calling backend:', url)
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
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
    
    console.log('✅ Preachings data received:', { count: data?.length || data?.preachings?.length || 0 })

    // Normaliser les données du backend
    let preachings = Array.isArray(data) ? data : (data.preachings || data.data || [])
    
    // Mapper les champs pour assurer la compatibilité
    preachings = preachings.map((preaching: any) => ({
      ...preaching,
      pastor_name: preaching.pastor_name || preaching.pastorName || preaching.pastor?.name || '',
      sermon_date: preaching.sermon_date || preaching.sermonDate || preaching.date || preaching.preachingDate || new Date().toISOString(),
      media_type: preaching.media_type || preaching.mediaType || preaching.type || 'TEXT',
      media_url: preaching.media_url || preaching.mediaUrl || preaching.videoUrl || preaching.audioUrl || '',
      thumbnail_url: preaching.thumbnail_url || preaching.thumbnailUrl || '',
      view_count: preaching.view_count ?? preaching.viewCount ?? 0,
      is_published: preaching.is_published ?? preaching.isPublished ?? true
    }))

    return NextResponse.json({
      success: true,
      preachings: preachings
    })
  } catch (error: any) {
    console.error('❌ Preachings GET error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    console.log('🔄 POST /api/preachings - Calling backend')
    
    const response = await fetch(`${API_URL}/preachings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    console.log('✅ Create preaching response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de création de la prédication' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      ...data
    })
  } catch (error: any) {
    console.error('❌ Create preaching error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de prédication requis' },
        { status: 400 }
      )
    }
    
    console.log('🔄 PUT /api/preachings - Updating preaching:', id)
    
    const response = await fetch(`${API_URL}/preachings/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    const data = await response.json()
    
    console.log('✅ Update preaching response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de modification de la prédication' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      ...data
    })
  } catch (error: any) {
    console.error('❌ Update preaching error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de prédication requis' },
        { status: 400 }
      )
    }
    
    console.log('🔄 DELETE /api/preachings - Deleting preaching:', id)
    
    const response = await fetch(`${API_URL}/preachings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    console.log('✅ Delete preaching response:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de suppression de la prédication' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      ...data
    })
  } catch (error: any) {
    console.error('❌ Delete preaching error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
