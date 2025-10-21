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
    console.log('🚀 API /api/init appelée - Version Simplifiée v3')
    console.log('🔍 Variables d\'environnement:')
    console.log('- DATABASE_URL présent:', !!process.env.DATABASE_URL)
    console.log('- JWT_SECRET présent:', !!process.env.JWT_SECRET)
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    
    // Test de connexion simple
    const userCount = await prisma.user.count()
    console.log('📊 Nombre d\'utilisateurs:', userCount)
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin existant trouvé')
      return NextResponse.json({
        success: true,
        message: 'Application déjà initialisée - Admin existant',
        admin: {
          email: existingAdmin.email,
          firstName: existingAdmin.firstName,
          lastName: existingAdmin.lastName,
          role: existingAdmin.role
        },
        stats: { userCount },
        alreadyInitialized: true
      })
    }
    
    // Créer l'admin directement sans seed complexe
    console.log('🌱 Création admin simple...')
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('Qualis@2025', 10)
    
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@vhd.app',
        passwordHash: hashedPassword,
        firstName: 'Chris',
        lastName: 'Kasongo',
        role: 'ADMIN',
        status: 'ACTIVE',
        phone: '+243123456789',
        membershipDate: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Admin créé avec succès !',
      admin: {
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: newAdmin.role
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