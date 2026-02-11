import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import postgres from 'postgres'

// Configuration PostgreSQL
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
})

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Rechercher l'utilisateur avec PostgreSQL direct
    const users = await sql`
      SELECT id, email, password, name, role, phone, address 
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const user = users[0]

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Créer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'mychurchapp-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key',
      { expiresIn: '7d' }
    )

    // Réponse avec le token et les infos utilisateur
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}