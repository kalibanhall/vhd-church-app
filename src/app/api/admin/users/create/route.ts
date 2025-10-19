import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Fonction pour extraire l'utilisateur du token JWT
async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return { error: 'Token d\'authentification requis', status: 401 }
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, firstName: true, lastName: true }
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé', status: 404 }
    }

    return { user, status: 200 }
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error)
    return { error: 'Token invalide', status: 401 }
  }
}

// Fonction pour vérifier les permissions admin
async function checkAdminPermission(request: NextRequest) {
  const authResult = await getUserFromToken(request)
  
  if (authResult.error) {
    return authResult
  }

  if (authResult.user?.role !== 'ADMIN') {
    return { error: 'Accès non autorisé - Droits administrateur requis', status: 403 }
  }

  return authResult
}

// POST - Ajouter un nouveau membre (admin seulement)
export async function POST(request: NextRequest) {
  try {
    // Vérification des permissions admin
    const auth = await checkAdminPermission(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      role = 'FIDELE',
      address,
      profession,
      maritalStatus = 'SINGLE'
    } = body

    // Validation des champs requis
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Les champs prénom, nom, email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10)

    // Générer un numéro de membre unique
    const membershipNumber = `${role.substring(0,3).toUpperCase()}${Date.now().toString().slice(-4)}`

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: role,
        status: 'ACTIVE', // Les membres ajoutés par admin sont actifs par défaut
        membershipDate: new Date(),
        membershipNumber,
        address: address || null,
        profession: profession || null,
        maritalStatus: maritalStatus,
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        membershipNumber: true,
        membershipDate: true,
        address: true,
        profession: true
      }
    })

    return NextResponse.json({
      message: 'Membre ajouté avec succès',
      user: user
    })

  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du membre' },
      { status: 500 }
    )
  }
}