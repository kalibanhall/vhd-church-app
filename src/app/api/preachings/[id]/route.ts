/**
 * Route proxy pour suppression d'une prédication spécifique - Frontend
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    console.log('🔄 DELETE /api/preachings/[id] - Deleting preaching:', id)
    
    const response = await fetch(`${API_URL}/preachings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend delete error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Erreur de suppression de la prédication' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log('✅ Delete preaching response:', response.status)

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    console.log('🔄 PUT /api/preachings/[id] - Updating preaching:', id)
    
    const response = await fetch(`${API_URL}/preachings/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend update error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Erreur de modification de la prédication' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log('✅ Update preaching response:', response.status)

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value
    
    console.log('🔄 GET /api/preachings/[id] - Getting preaching:', id)
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_URL}/preachings/${id}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend get error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Erreur de récupération de la prédication' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log('✅ Get preaching response:', response.status)

    return NextResponse.json({
      success: true,
      ...data
    })
  } catch (error: any) {
    console.error('❌ Get preaching error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
