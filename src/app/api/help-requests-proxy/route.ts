/**
 * =============================================================================
 * API PROXY: HELP REQUESTS
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * Proxy vers le backend Render pour les demandes d'aide
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
    const admin = searchParams.get('admin')
    
    let url = `${BACKEND_URL}/v1/help-requests`
    
    if (admin === 'true' && stats === 'true') {
      url = `${BACKEND_URL}/v1/help-requests/admin/stats`
    } else if (id) {
      url = `${BACKEND_URL}/v1/help-requests/${id}`
    } else {
      // Passer les paramètres de filtre
      const params = new URLSearchParams()
      const type = searchParams.get('type')
      const status = searchParams.get('status')
      const urgency = searchParams.get('urgency')
      
      if (type) params.append('type', type)
      if (status) params.append('status', status)
      if (urgency) params.append('urgency', urgency)
      if (admin === 'true') params.append('admin', 'true')
      
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
    console.error('Help requests proxy GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = `${BACKEND_URL}/v1/help-requests`
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
    console.error('Help requests proxy POST error:', error)
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
    const assign = searchParams.get('assign')
    const respond = searchParams.get('respond')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }
    
    let url = `${BACKEND_URL}/v1/help-requests/${id}`
    
    if (assign === 'true') {
      url = `${BACKEND_URL}/v1/help-requests/${id}/assign`
    } else if (respond === 'true') {
      url = `${BACKEND_URL}/v1/help-requests/${id}/respond`
    }
    
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
    console.error('Help requests proxy PUT error:', error)
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
    
    const url = `${BACKEND_URL}/v1/help-requests/${id}`
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
    console.error('Help requests proxy DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
