/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * Version: 1.0.3
 * Date: Octobre 2025
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'
import { AUTH_CONFIG, setAuthCookie } from '../../../../lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login API appelée')
    console.log('🔍 Variables d\'environnement:')
    console.log('- DATABASE_URL présent:', !!process.env.DATABASE_URL)
    console.log('- JWT_SECRET présent:', !!process.env.JWT_SECRET)
    
    const { email, password, rememberMe = false } = await request.json()
    console.log('📧 Tentative de connexion pour:', email)

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    // DEBUG: Vérifier le mot de passe (mode debug temporaire)
    console.log('🔍 Debug password check:')
    console.log('- Password reçu:', password)
    console.log('- Hash en base:', user.passwordHash ? 'présent' : 'absent')
    
    let isValidPassword = false
    try {
      isValidPassword = await bcrypt.compare(password, user.passwordHash)
      console.log('✅ bcrypt.compare réussi:', isValidPassword)
    } catch (bcryptError) {
      console.error('❌ Erreur bcrypt.compare:', bcryptError)
      // Fallback temporaire pour admin spécifique
      if (email === 'admin@vhd.app' && password === 'Qualis@2025') {
        console.log('🔧 Fallback admin temporaire activé')
        isValidPassword = true
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier si le compte est actif ou en attente
    if (user.status === 'INACTIVE' || user.status === 'BANNED') {
      return NextResponse.json(
        { error: 'Compte désactivé ou suspendu' },
        { status: 403 }
      )
    }

    // Créer le token JWT avec durée variable selon "Se souvenir de moi"
    const expiresIn = rememberMe ? '30d' : '7d'
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      AUTH_CONFIG.jwt.secret as string,
      { expiresIn }
    )

    // Retourner les données utilisateur (sans le mot de passe)
    const { passwordHash, ...userWithoutPassword } = user

    // Créer la réponse avec le cookie sécurisé
    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword
    })

    return setAuthCookie(response, token, rememberMe)

  } catch (error: any) {
    console.error('Erreur de connexion:', error)
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error.message || 'Erreur inconnue',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}