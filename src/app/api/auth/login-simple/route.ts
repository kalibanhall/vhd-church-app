import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'
import { AUTH_CONFIG, setAuthCookie } from '../../../../lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login Simple API appelée')
    
    const { email, password, rememberMe = false } = await request.json()
    console.log('📧 Tentative de connexion pour:', email)

    // Vérification simplifiée pour admin uniquement
    if (email === 'admin@vhd.app' && password === 'Qualis@2025') {
      
      // Récupérer l'utilisateur admin
      const user = await prisma.user.findUnique({
        where: { email: 'admin@vhd.app' }
      })
      
      if (!user) {
        return NextResponse.json({ error: 'Admin non trouvé' }, { status: 404 })
      }
      
      // Créer le token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        AUTH_CONFIG.jwt.secret as string,
        { expiresIn: rememberMe ? '30d' : '7d' }
      )

      // Retourner succès
      const { passwordHash, ...userWithoutPassword } = user
      
      const response = NextResponse.json({
        success: true,
        message: 'Connexion admin réussie',
        user: userWithoutPassword
      })

      return setAuthCookie(response, token, rememberMe)
      
    } else {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

  } catch (error: any) {
    console.error('❌ Erreur login simple:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error.message
    }, { status: 500 })
  }
}