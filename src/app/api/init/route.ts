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
import { runSeed } from '../../../../prisma/seed'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API /api/init appelée - Version Debug v2')
    console.log('🔍 Variables d\'environnement:')
    console.log('- DATABASE_URL présent:', !!process.env.DATABASE_URL)
    console.log('- JWT_SECRET présent:', !!process.env.JWT_SECRET)
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    
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
    
    // Exécuter le seed pour créer l'admin
    console.log('🌱 Initialisation de la base de données...')
    await runSeed()
    
    // Récupérer l'admin créé
    const newAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
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