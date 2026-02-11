/**
 * @fileoverview Route proxy pour récupérer les statistiques d'un utilisateur
 * @author MyChurchApp Management System
 * @version 1.0.0
 * 
 * Récupère le nombre de dons, RDV, prières et témoignages d'un utilisateur
 */

import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      )
    }

    // Récupérer le token d'authentification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Appeler l'API backend
    const response = await fetch(`${API_BASE_URL}/user/${userId}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la récupération des statistiques' },
        { status: response.status }
      )
    }

    const stats = await response.json()
    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur dans user-stats-proxy:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
