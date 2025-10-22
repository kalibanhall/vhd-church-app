import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
import { AUTH_CONFIG, setAuthCookie } from '../../../../lib/auth-config'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST - Réinitialiser le mot de passe avec le token
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token et nouveau mot de passe requis' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit faire au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Vérifier le token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // Vérifier que c'est bien un token de réinitialisation
    if (decoded.purpose !== 'password-reset') {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe toujours
    const users = await sql`SELECT id, email, role FROM users WHERE id = ${decoded.userId} LIMIT 1`
    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour le mot de passe
    await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE id = ${user.id}`

    // Créer un nouveau token de connexion
    const authToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      AUTH_CONFIG.jwt.secret as string,
      { expiresIn: '7d' }
    )

    // Créer la réponse avec le cookie sécurisé
    const response = NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

    return setAuthCookie(response, authToken)

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}