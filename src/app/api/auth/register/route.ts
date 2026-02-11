/**
 * =============================================================================
 * MYCHURCHAPP
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
import postgres from 'postgres'

// Configuration PostgreSQL
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
})

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    // Vérifier si l'utilisateur existe déjà
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10)

    // Vérifier s'il y a déjà des utilisateurs dans la base
    const userCountResult = await sql`
      SELECT COUNT(*) as count FROM users
    `
    const isFirstUser = Number(userCountResult[0].count) === 0

    // Créer l'utilisateur
    const result = await sql`
      INSERT INTO users (email, password, name, phone, role, created_at)
      VALUES (
        ${email}, 
        ${passwordHash}, 
        ${`${firstName} ${lastName}`}, 
        ${phone || null}, 
        ${isFirstUser ? 'admin' : 'member'},
        NOW()
      )
      RETURNING id, email, name, role, phone, created_at
    `
    
    const user = result[0]

    // Créer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'mychurchapp-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key',
      { expiresIn: '7d' }
    )

    // Retourner les données utilisateur
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      message: 'Compte créé avec succès.'
    })

  } catch (error: any) {
    console.error('Erreur d\'inscription:', error)
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