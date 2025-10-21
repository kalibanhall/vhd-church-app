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
 * API d'initialisation automatique de l'admin
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API /api/init appelée')
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Application déjà initialisée',
        admin: {
          email: existingAdmin.email,
          firstName: existingAdmin.firstName,
          lastName: existingAdmin.lastName,
          role: existingAdmin.role
        },
        alreadyInitialized: true
      })
    }
    
    // Créer l'admin directement (plus simple que seed complexe)
    console.log('🌱 Création admin par défaut...')
    const passwordHash = await bcrypt.hash('Qualis@2025', 10)
    
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@vhd.app',
        passwordHash,
        firstName: 'Chris',
        lastName: 'Kasongo',
        phone: '+243123456789',
        role: 'ADMIN',
        status: 'ACTIVE',
        membershipDate: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Application initialisée avec succès !',
      admin: {
        email: newAdmin?.email,
        firstName: newAdmin?.firstName,
        lastName: newAdmin?.lastName,
        role: newAdmin?.role
      },
      credentials: {
        email: 'admin@vhd.app',
        password: 'Qualis@2025'
      },
      instructions: 'Utilisez ces identifiants pour vous connecter à /auth'
    })
    
  } catch (error: any) {
    console.error('❌ Erreur initialisation:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'initialisation',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Même logique pour POST (au cas où)
  return GET(request)
}