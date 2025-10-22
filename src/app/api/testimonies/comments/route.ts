import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

// GET - Récupérer les commentaires d'un témoignage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testimonyId = searchParams.get('testimonyId')

    if (!testimonyId) {
      return NextResponse.json(
        { error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }

    const comments = await sql`
      SELECT c.*, u.id as user_id, u.first_name, u.last_name
      FROM testimony_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.testimony_id = ${testimonyId}
      ORDER BY c.created_at DESC
    `
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: {
        id: comment.user_id,
        name: `${comment.first_name} ${comment.last_name}`
      }
    }))
    return NextResponse.json(formattedComments)

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    )
  }
}

// POST - Ajouter un commentaire à un témoignage
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const testimonyId = searchParams.get('testimonyId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 401 }
      )
    }

    if (!testimonyId) {
      return NextResponse.json(
        { error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Le contenu du commentaire est requis' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO testimony_comments (testimony_id, user_id, content, created_at, updated_at)
      VALUES (${testimonyId}, ${userId}, ${content.trim()}, NOW(), NOW())
      RETURNING *
    `
    const comment = result[0]
    const userInfo = await sql`SELECT id, first_name, last_name FROM users WHERE id = ${userId}`
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: {
        id: userInfo[0].id,
        name: `${userInfo[0].first_name} ${userInfo[0].last_name}`
      }
    }
    return NextResponse.json(formattedComment, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    )
  }
}