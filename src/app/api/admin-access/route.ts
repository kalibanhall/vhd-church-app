import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Vérification simple pour admin uniquement
    if (email === 'admin@vhd.app' && password === 'Qualis@2025') {
      
      // Vérifier que l'admin existe en base
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@vhd.app' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true
        }
      })
      
      if (adminUser && adminUser.role === 'ADMIN') {
        return NextResponse.json({
          success: true,
          message: 'Accès admin autorisé',
          user: adminUser,
          accessType: 'admin-direct'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Compte administrateur non trouvé'
        }, { status: 404 })
      }
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Identifiants administrateur incorrects'
      }, { status: 401 })
    }
    
  } catch (error) {
    console.error('Erreur admin access:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}