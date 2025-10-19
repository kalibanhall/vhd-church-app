import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Un administrateur existe déjà' },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, phone } = await request.json()

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10)

    // Créer le premier administrateur
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: 'ADMIN',
        status: 'ACTIVE', // Directement actif
        membershipDate: new Date(),
        membershipNumber: 'ADM001' // Premier admin
      }
    })

    // Retourner sans le mot de passe
    const { passwordHash: _, ...adminWithoutPassword } = admin

    return NextResponse.json({
      message: 'Premier administrateur créé avec succès',
      admin: adminWithoutPassword
    })

  } catch (error) {
    console.error('Erreur création admin:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}