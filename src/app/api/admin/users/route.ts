/**
 * Route proxy pour la gestion des utilisateurs admin - Frontend
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const url = queryString ? `${API_URL}/members?${queryString}` : `${API_URL}/members`

    console.log('🔍 GET /api/admin/users - Calling backend:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📊 Backend response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend error:', errorText)
      return NextResponse.json(
        { error: errorText || 'Erreur de récupération des utilisateurs' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Data received:', { count: data?.users?.length || data?.data?.length || 0 })

    // Normaliser la réponse - le backend peut retourner {users: []} ou {data: []} ou []
    const users = data.users || data.data || data || []
    
    return NextResponse.json({ 
      success: true,
      users: Array.isArray(users) ? users : [],
      data: Array.isArray(users) ? users : []
    })
  } catch (error) {
    console.error('❌ Erreur admin/users GET:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des utilisateurs', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${API_URL}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de création utilisateur' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur admin/users POST:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création utilisateur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...userData } = body

    const response = await fetch(`${API_URL}/members/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de mise à jour utilisateur' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur admin/users PUT:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour utilisateur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    const response = await fetch(`${API_URL}/members/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de suppression utilisateur' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur admin/users DELETE:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression utilisateur' },
      { status: 500 }
    )
  }
}
