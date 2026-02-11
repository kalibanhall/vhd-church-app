/**
 * =============================================================================
 * API PROXY: VOLUNTEERS
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * Proxy vers le backend Render pour le bénévolat
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mychurchapp-backend.onrender.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teams = searchParams.get('teams')
    const myRegistrations = searchParams.get('my-registrations')
    const teamId = searchParams.get('teamId')
    
    let url = `${BACKEND_URL}/v1/volunteers`
    
    if (teams === 'true') {
      url = `${BACKEND_URL}/v1/volunteers/teams`
    } else if (myRegistrations === 'true') {
      url = `${BACKEND_URL}/v1/volunteers/my-registrations`
    } else if (teamId) {
      // Récupérer les registrations d'une équipe spécifique
      url = `${BACKEND_URL}/v1/volunteers/registrations?teamId=${teamId}`
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
    console.error('Volunteers proxy GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teams = searchParams.get('teams')
    const register = searchParams.get('register')
    
    let url = `${BACKEND_URL}/v1/volunteers`
    
    if (teams === 'true') {
      url = `${BACKEND_URL}/v1/volunteers/teams`
    } else if (register === 'true') {
      url = `${BACKEND_URL}/v1/volunteers/register`
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
    console.error('Volunteers proxy POST error:', error)
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
    const teams = searchParams.get('teams')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }
    
    let url = teams === 'true' 
      ? `${BACKEND_URL}/v1/volunteers/teams/${id}`
      : `${BACKEND_URL}/v1/volunteers/registrations/${id}`
    
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
    console.error('Volunteers proxy PUT error:', error)
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
    const teams = searchParams.get('teams')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }
    
    const url = teams === 'true'
      ? `${BACKEND_URL}/v1/volunteers/teams/${id}`
      : `${BACKEND_URL}/v1/volunteers/registrations/${id}`
    
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
    console.error('Volunteers proxy DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
