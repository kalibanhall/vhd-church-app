import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
})

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token de l'en-tête Authorization
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Enlever "Bearer "

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'mychurchapp-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key'
    ) as any

    const userId = decoded.id || decoded.userId
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Récupérer les informations de l'utilisateur
    const users = await sql`
      SELECT id, email, name, role, phone, address, created_at, updated_at
      FROM users 
      WHERE id = ${userId}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const user = users[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    })

  } catch (error: any) {
    console.error('Me error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}