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
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

// Fonction pour vérifier les permissions utilisateur
async function checkUserPermission(userId: string, action: 'read' | 'create' | 'moderate') {
  if (!userId) {
    return { error: 'ID utilisateur requis', status: 401 }
  }

  try {
    const users = await sql`SELECT id, role, first_name, last_name FROM users WHERE id = ${userId} LIMIT 1`
    const user = users[0]

    if (!user) {
      return { error: 'Utilisateur non trouvé', status: 404 }
    }

    // Permissions par action
    if (action === 'moderate' && !['ADMIN', 'PASTOR', 'OUVRIER'].includes(user.role)) {
      return { error: 'Accès non autorisé - Droits de modération requis', status: 403 }
    }

    return { user, status: 200 }
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error)
    return { error: 'Erreur serveur', status: 500 }
  }
}

// GET - Récupérer les témoignages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') // 'pending', 'approved', 'all'
    const userOnly = searchParams.get('userOnly') === 'true'

    // Vérification des permissions
    const auth = await checkUserPermission(userId || '', 'read')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Construction de la requête
    let whereClause: any = {}

    // Filtres par statut
    if (status === 'pending') {
      whereClause.isApproved = false
    } else if (status === 'approved') {
      whereClause.isApproved = true
    }

    // Filtrer par utilisateur si demandé
    if (userOnly) {
      whereClause.userId = userId
    } else {
      // Pour les témoignages approuvés seulement (sauf pour modération)
      if (status !== 'pending') {
        whereClause.isApproved = true
        whereClause.isPublished = true
      }
    }

    // Construction dynamique de la requête SQL
    let sqlWhere = []
    let sqlParams = []
    if (whereClause.isApproved !== undefined) {
      sqlWhere.push('t.is_approved = $' + (sqlParams.length + 1))
      sqlParams.push(whereClause.isApproved)
    }
    if (whereClause.isPublished !== undefined) {
      sqlWhere.push('t.is_published = $' + (sqlParams.length + 1))
      sqlParams.push(whereClause.isPublished)
    }
    if (whereClause.userId) {
      sqlWhere.push('t.user_id = $' + (sqlParams.length + 1))
      sqlParams.push(whereClause.userId)
    }
    const whereSQL = sqlWhere.length ? 'WHERE ' + sqlWhere.join(' AND ') : ''
    const testimonies = await sql.unsafe(`
      SELECT t.*, u.first_name, u.last_name
      FROM testimonies t
      JOIN users u ON t.user_id = u.id
      ${whereSQL}
      ORDER BY t.created_at DESC
    `, ...sqlParams)
    const formattedTestimonies = testimonies.map((testimony: any) => ({
      id: testimony.id,
      title: testimony.title,
      content: testimony.content,
      isAnonymous: testimony.is_anonymous || false,
      isApproved: testimony.is_approved,
      isPublished: testimony.is_published,
      status: testimony.is_approved ? 'APPROVED' : 'PENDING',
      testimonyDate: testimony.created_at,
      likeCount: testimony.like_count || 0,
      commentCount: testimony.comment_count || 0,
      viewCount: testimony.view_count || 0,
      userId: testimony.user_id,
      userName: testimony.is_anonymous ? 'Anonyme' : `${testimony.first_name} ${testimony.last_name}`,
      canEdit: testimony.user_id === userId || auth.user?.role === 'ADMIN' || auth.user?.role === 'PASTEUR'
    }))
    return NextResponse.json(formattedTestimonies)

  } catch (error) {
    console.error('Erreur lors de la récupération des témoignages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des témoignages' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau témoignage
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Vérification des permissions
    const auth = await checkUserPermission(userId || '', 'create')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { title, content, isAnonymous } = body

    // Validation des données
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titre et contenu requis' },
        { status: 400 }
      )
    }

    // Créer le témoignage
    const result = await sql`
      INSERT INTO testimonies (title, content, is_anonymous, is_approved, is_published, user_id, category, created_at)
      VALUES (${title}, ${content}, ${isAnonymous || false}, false, false, ${userId}, 'HEALING', NOW())
      RETURNING *
    `
    const testimony = result[0]
    const userInfo = await sql`SELECT first_name, last_name FROM users WHERE id = ${userId}`
    return NextResponse.json({
      ...testimony,
      userName: testimony.is_anonymous ? 'Anonyme' : `${userInfo[0].first_name} ${userInfo[0].last_name}`
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du témoignage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du témoignage' },
      { status: 500 }
    )
  }
}

// PATCH - Modérer un témoignage (approuver/rejeter)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const testimonyId = searchParams.get('id')

    // Vérification des permissions de modération
    const auth = await checkUserPermission(userId || '', 'moderate')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!testimonyId) {
      return NextResponse.json(
        { error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action } = body // 'approve' ou 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez "approve" ou "reject"' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    const result = await sql`
      UPDATE testimonies SET
        is_approved = ${action === 'approve'},
        is_published = ${action === 'approve'},
        approved_by = ${action === 'approve' ? userId : null},
        approved_at = ${action === 'approve' ? new Date() : null},
        published_at = ${action === 'approve' ? new Date() : null}
      WHERE id = ${testimonyId}
      RETURNING *
    `
    return NextResponse.json(result[0])

  } catch (error) {
    console.error('Erreur lors de la modération du témoignage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modération du témoignage' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un témoignage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const testimonyId = searchParams.get('id')

    // Vérification des permissions
    const auth = await checkUserPermission(userId || '', 'moderate')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!testimonyId) {
      return NextResponse.json(
        { error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }

    await sql`DELETE FROM testimonies WHERE id = ${testimonyId}`
    return NextResponse.json({ message: 'Témoignage supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du témoignage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du témoignage' },
      { status: 500 }
    )
  }
}