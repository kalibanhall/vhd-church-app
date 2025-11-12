import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
})

export async function GET() {
  try {
    const events = await sql`
      SELECT id, title, description, event_date, event_type, location, status, 
             show_on_homepage, created_at, updated_at
      FROM events 
      ORDER BY event_date ASC
    `

    return NextResponse.json({
      success: true,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.event_date,
        eventType: event.event_type,
        location: event.location,
        status: event.status,
        showOnHomepage: event.show_on_homepage,
        createdAt: event.created_at,
        updatedAt: event.updated_at
      }))
    })
  } catch (error) {
    console.error('Events error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, eventDate, eventType, location } = await req.json()

    if (!title || !eventDate) {
      return NextResponse.json(
        { error: 'Titre et date requis' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO events (title, description, event_date, event_type, location, 
                          created_by, status, show_on_homepage)
      VALUES (${title}, ${description}, ${eventDate}, ${eventType || 'WORSHIP_SERVICE'}, 
              ${location}, 'system', 'SCHEDULED', true)
      RETURNING id, title, description, event_date, event_type, location, status, 
                show_on_homepage, created_at, updated_at
    `

    const event = result[0]

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.event_date,
        eventType: event.event_type,
        location: event.location,
        status: event.status,
        showOnHomepage: event.show_on_homepage,
        createdAt: event.created_at,
        updatedAt: event.updated_at
      }
    })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    )
  }
}