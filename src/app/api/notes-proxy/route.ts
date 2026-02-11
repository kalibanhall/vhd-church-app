/**
 * =============================================================================
 * API PROXY: NOTES
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * Proxy vers le backend Render pour les notes personnelles
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mychurchapp-backend.onrender.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const stats = searchParams.get('stats')
    
    let url = `${BACKEND_URL}/v1/notes`
    
    if (stats === 'true') {
      url = `${BACKEND_URL}/v1/notes/stats/summary`
    } else if (id) {
      url = `${BACKEND_URL}/v1/notes/${id}`
    } else {
      // Passer les paramètres de filtre
      const params = new URLSearchParams()
      const type = searchParams.get('type')
      const favorite = searchParams.get('favorite')
      const search = searchParams.get('search')
      
      if (type) params.append('type', type)
      if (favorite) params.append('favorite', favorite)
      if (search) params.append('search', search)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }

    const authHeader = request.headers.get('authorization')
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Notes proxy GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = `${BACKEND_URL}/v1/notes`
    const authHeader = request.headers.get('authorization')
    const body = await request.json()
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Notes proxy POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const favorite = searchParams.get('favorite')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }
    
    const url = favorite === 'true' 
      ? `${BACKEND_URL}/v1/notes/${id}/favorite`
      : `${BACKEND_URL}/v1/notes/${id}`
    
    const authHeader = request.headers.get('authorization')
    const body = await request.json().catch(() => ({}))
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Notes proxy PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }
    
    const url = `${BACKEND_URL}/v1/notes/${id}`
    const authHeader = request.headers.get('authorization')
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Notes proxy DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
