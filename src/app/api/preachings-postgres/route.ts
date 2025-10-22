import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
})

export async function GET() {
  try {
    const preachings = await sql`
      SELECT id, title, description, preacher, date, video_url, audio_url, created_at
      FROM preachings 
      ORDER BY date DESC
    `

    return NextResponse.json({
      success: true,
      preachings: preachings.map(preaching => ({
        id: preaching.id,
        title: preaching.title,
        description: preaching.description,
        preacher: preaching.preacher,
        date: preaching.date,
        videoUrl: preaching.video_url,
        audioUrl: preaching.audio_url,
        createdAt: preaching.created_at
      }))
    })
  } catch (error) {
    console.error('Preachings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des prédications' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, preacher, date, videoUrl, audioUrl } = await req.json()

    if (!title || !preacher || !date) {
      return NextResponse.json(
        { error: 'Titre, prédicateur et date requis' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO preachings (title, description, preacher, date, video_url, audio_url)
      VALUES (${title}, ${description}, ${preacher}, ${date}, ${videoUrl || null}, ${audioUrl || null})
      RETURNING id, title, description, preacher, date, video_url, audio_url, created_at
    `

    const preaching = result[0]

    return NextResponse.json({
      success: true,
      preaching: {
        id: preaching.id,
        title: preaching.title,
        description: preaching.description,
        preacher: preaching.preacher,
        date: preaching.date,
        videoUrl: preaching.video_url,
        audioUrl: preaching.audio_url,
        createdAt: preaching.created_at
      }
    })
  } catch (error) {
    console.error('Create preaching error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la prédication' },
      { status: 500 }
    )
  }
}