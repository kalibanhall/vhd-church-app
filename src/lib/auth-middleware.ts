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

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { AUTH_CONFIG } from './auth-config'

export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
}

export async function verifyAuthentication(request: NextRequest): Promise<{
  success: boolean
  user?: AuthenticatedUser
  error?: string
  status?: number
}> {
  try {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get(AUTH_CONFIG.cookie.name)?.value

    if (!token) {
      return {
        success: false,
        error: 'Token d\'authentification manquant',
        status: 401
      }
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, AUTH_CONFIG.jwt.secret) as any

    if (!decoded.userId) {
      return {
        success: false,
        error: 'Token invalide - userId manquant',
        status: 401
      }
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        status: true
      }
    })

    if (!user) {
      return {
        success: false,
        error: 'Utilisateur introuvable',
        status: 404
      }
    }

    if (user.status === 'INACTIVE' || user.status === 'BANNED') {
      return {
        success: false,
        error: 'Compte utilisateur désactivé ou suspendu',
        status: 403
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    }

  } catch (error) {
    console.error('Erreur de vérification d\'authentification:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        error: 'Token expiré',
        status: 401
      }
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        error: 'Token invalide',
        status: 401
      }
    }

    return {
      success: false,
      error: 'Erreur interne d\'authentification',
      status: 500
    }
  }
}