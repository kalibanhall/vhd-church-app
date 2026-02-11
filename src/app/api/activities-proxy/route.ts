/**
 * =============================================================================
 * API PROXY: ACTIVITIES
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * Proxy vers le backend Render pour les activités
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mychurchapp-backend.onrender.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const registrations = searchParams.get('registrations')
    
    let url = `${BACKEND_URL}/v1/activities`
    
    if (id && registrations === 'true') {
      url = `${BACKEND_URL}/v1/activities/${id}/registrations`
    } else if (id) {
      url = `${BACKEND_URL}/v1/activities/${id}`
    } else {
      // Passer les paramètres de filtre
      const params = new URLSearchParams()
      const type = searchParams.get('type')
      const status = searchParams.get('status')
      const upcoming = searchParams.get('upcoming')
      
      if (type) params.append('type', type)
      if (status) params.append('status', status)
      if (upcoming) params.append('upcoming', upcoming)
      
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
    console.error('Activities proxy GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const action = searchParams.get('action')
    
    let url = `${BACKEND_URL}/v1/activities`
    
    // Inscription à une activité
    if (id && action === 'register') {
      url = `${BACKEND_URL}/v1/activities/${id}/register`
    }
    
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
    console.error('Activities proxy POST error:', error)
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
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }
    
    const url = `${BACKEND_URL}/v1/activities/${id}`
    const authHeader = request.headers.get('authorization')
    const body = await request.json()
    
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
    console.error('Activities proxy PUT error:', error)
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
    const action = searchParams.get('action')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }
    
    let url = `${BACKEND_URL}/v1/activities/${id}`
    
    // Désinscription
    if (action === 'unregister') {
      url = `${BACKEND_URL}/v1/activities/${id}/register`
    }
    
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
    console.error('Activities proxy DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
