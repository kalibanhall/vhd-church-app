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
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: 'MEMBER', // Par défaut, les nouveaux utilisateurs sont des membres
        status: 'PENDING', // En attente d'approbation par un admin
        membershipDate: new Date(),
        membershipNumber: `MEM${Date.now().toString().slice(-6)}` // Numéro unique
      }
    })

    // Créer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Retourner les données utilisateur (sans le mot de passe)
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
      message: 'Compte créé avec succès. En attente d\'approbation par un administrateur.'
    })

  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}