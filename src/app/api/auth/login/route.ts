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
    const { email, password, rememberMe = false } = await request.json()

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

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

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