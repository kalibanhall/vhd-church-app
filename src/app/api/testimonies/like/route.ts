import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

// POST - Ajouter/Retirer un like sur un témoignage
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

    // Vérifier si l'utilisateur a déjà liké ce témoignage
    const existingLikes = await sql`SELECT id FROM testimony_likes WHERE testimony_id = ${testimonyId} AND user_id = ${userId} LIMIT 1`
    const existingLike = existingLikes[0]

    if (existingLike) {
      // Si existe déjà, supprimer le like (toggle)
      await sql`DELETE FROM testimony_likes WHERE id = ${existingLike.id}`
      return NextResponse.json({ 
        message: 'Like retiré',
        action: 'removed'
      })
    } else {
      // Ajouter le like
      await sql`INSERT INTO testimony_likes (testimony_id, user_id) VALUES (${testimonyId}, ${userId})`
      return NextResponse.json({ 
        message: 'Like ajouté',
        action: 'added'
      })
    }

  } catch (error) {
    console.error('Erreur lors de la gestion du like:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la gestion du like' },
      { status: 500 }
    )
  }
}