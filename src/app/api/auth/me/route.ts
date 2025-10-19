import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication } from '../../../../lib/auth-middleware'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthentication(request)
    
    if (!authResult.success) {
      return NextResponse.json({ 
        error: authResult.error 
      }, { status: authResult.status || 401 })
    }

    // Récupérer les données complètes de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: authResult.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        profileImageUrl: true,
        membershipNumber: true,
        membershipDate: true,
        createdAt: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      user 
    })
  } catch (error) {
    console.error('Erreur auth/me:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}