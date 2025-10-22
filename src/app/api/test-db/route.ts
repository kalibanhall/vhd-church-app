import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
})

export async function GET() {
  try {
    // Vérifier la connexion à la base de données
    const result = await sql`SELECT NOW() as current_time`
    
    // Compter les utilisateurs
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`
    
    // Récupérer quelques utilisateurs pour test
    const users = await sql`
      SELECT id, first_name, last_name, email, role, status 
      FROM users 
      ORDER BY created_at 
      LIMIT 5
    `

    return NextResponse.json({
      success: true,
      message: 'Base de données connectée avec succès',
      timestamp: result[0].current_time,
      stats: {
        totalUsers: usersCount[0].count,
        sampleUsers: users.map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
          status: user.status
        }))
      }
    })

  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur de connexion à la base de données',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Tenter de créer un utilisateur de test
    const testUser = await sql`
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES ('Test', 'User', 'test@example.com', '$2b$10$rQZoJ8fWjCjZjrqE4bK4GeUvM.t8fGANY3QnJlbhzMhKQ8wG1Q1Km', 'FIDELE')
      ON CONFLICT (email) 
      DO UPDATE SET updated_at = NOW()
      RETURNING id, first_name, last_name, email, role
    `

    return NextResponse.json({
      success: true,
      message: 'Utilisateur de test créé/mis à jour',
      user: testUser[0]
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de l\'utilisateur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}