/**
 * =============================================================================
 * API PASTORS - RÉCUPÉRATION DES PASTEURS DISPONIBLES
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: API pour récupérer la liste des pasteurs disponibles pour
 * les rendez-vous. Utilisée par l'interface de prise de rendez-vous des membres.
 * 
 * Routes:
 * - GET: Liste des pasteurs avec statut ACTIVE et rôles PASTOR/ADMIN
 * 
 * Sécurité: Authentification JWT requise
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyAuthentication } from '../../../lib/auth-middleware'

/**
 * GET /api/pastors
 * Récupère la liste des pasteurs disponibles pour les rendez-vous
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/pastors appelée')
    
    const auth = await verifyAuthentication(request)
    console.log('Auth result:', auth.success ? '✅' : '❌')
    
    if (!auth.success) {
      console.log('❌ Auth error:', auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const user = auth.user!
    console.log('✅ User authenticated:', user.email, user.role)

    // Récupérer tous les pasteurs actifs pour les rendez-vous
    const pastors = await prisma.user.findMany({
      where: {
        role: { in: ['PASTOR', 'ADMIN'] },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        createdAt: true
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    console.log('👨‍💼 Pasteurs trouvés:', pastors.length)

    // Formater les données pour le frontend
    const formattedPastors = pastors.map(pastor => ({
      id: pastor.id,
      name: `${pastor.firstName} ${pastor.lastName}`,
      firstName: pastor.firstName,
      lastName: pastor.lastName,
      email: pastor.email,
      profileImageUrl: pastor.profileImageUrl,
      fullName: `${pastor.firstName} ${pastor.lastName}`
    }))

    return NextResponse.json({ 
      success: true, 
      pastors: formattedPastors 
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des pasteurs:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}