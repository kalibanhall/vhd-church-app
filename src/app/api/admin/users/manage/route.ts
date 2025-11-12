import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import jwt from 'jsonwebtoken'

// Fonction pour extraire l'utilisateur du token JWT
async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return { error: 'Token d\'authentification requis', status: 401 }
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId?: string; id?: string }
    const userId = decoded.id || decoded.userId
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

// PATCH - Modifier le rôle d'un utilisateur
export async function PATCH(request: NextRequest) {
  try {
    // Vérification des permissions admin
    const auth = await checkAdminPermission(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { userId, role, status } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de l\'utilisateur à modifier requis' },
        { status: 400 }
      )
    }

    // Validation des rôles autorisés
    const validRoles = ['FIDELE', 'OUVRIER', 'PASTOR', 'ADMIN']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide. Utilisez: FIDELE, OUVRIER, PASTOR, ou ADMIN' },
        { status: 400 }
      )
    }

    // Validation des statuts autorisés
    const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide. Utilisez: ACTIVE, INACTIVE, PENDING, ou SUSPENDED' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur à modifier existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur à modifier non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher qu'un admin se retire ses propres droits
    if (userId === auth.user?.id && role && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas retirer vos propres droits administrateur' },
        { status: 403 }
      )
    }

    // Construire les données à mettre à jour
    const updateData: any = {}
    if (role) updateData.role = role
    if (status) updateData.status = status
    updateData.updatedAt = new Date()

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        membershipNumber: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: NextRequest) {
  try {
    // Vérification des permissions admin
    const auth = await checkAdminPermission(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { userId: userIdToDelete } = body

    if (!userIdToDelete) {
      return NextResponse.json(
        { error: 'ID de l\'utilisateur à supprimer requis' },
        { status: 400 }
      )
    }

    // Empêcher qu'un admin se supprime lui-même
    if (userIdToDelete === auth.user?.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 403 }
      )
    }

    // Vérifier que l'utilisateur à supprimer existe
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      select: { id: true, firstName: true, lastName: true, role: true }
    })

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'Utilisateur à supprimer non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'utilisateur (les relations CASCADE supprimeront automatiquement les données liées)
    await prisma.user.delete({
      where: { id: userIdToDelete }
    })

    return NextResponse.json({
      message: `Utilisateur ${userToDelete.firstName} ${userToDelete.lastName} supprimé avec succès`
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}