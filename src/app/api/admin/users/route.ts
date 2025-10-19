import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Vérification simple du rôle utilisateur (sans token)
async function checkUserRole(request: NextRequest, requiredRoles?: string[]) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Si pas d'userId fourni, accès public (lecture seulement)
    if (!userId) {
      return { user: null }
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return { error: 'Utilisateur introuvable', status: 404 }
    }

    // Vérifier les rôles si spécifiés (ADMIN, OUVRIER, PASTEUR peuvent tout faire)
    if (requiredRoles && !['ADMIN', 'OUVRIER', 'PASTEUR'].includes(user.role)) {
      return { 
        error: `Accès réservé aux administrateurs, ouvriers et pasteurs. Votre rôle: ${user.role}`, 
        status: 403 
      }
    }

    return { user }
  } catch (error) {
    return { error: 'Erreur lors de la vérification', status: 500 }
  }
}

// Obtenir tous les utilisateurs (ADMIN, OUVRIER, PASTEUR)
export async function GET(request: NextRequest) {
  const auth = await checkUserRole(request, ['ADMIN', 'OUVRIER', 'PASTEUR'])
  
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        membershipDate: true,
        membershipNumber: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// Mettre à jour le rôle/statut d'un utilisateur (ADMIN, OUVRIER, PASTEUR)
export async function PATCH(request: NextRequest) {
  const auth = await checkUserRole(request, ['ADMIN', 'OUVRIER', 'PASTEUR'])
  
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  try {
    const { userId, role, status } = await request.json()

    // Empêcher de modifier son propre compte
    if (userId === auth.user!.id) {
      return NextResponse.json(
        { error: 'Impossible de modifier son propre compte' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(status && { status })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        membershipNumber: true
      }
    })

    return NextResponse.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}