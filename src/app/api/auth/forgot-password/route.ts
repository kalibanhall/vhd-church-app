import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST - Demander une réinitialisation de mot de passe
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Adresse email requise' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const users = await sql`SELECT id, email FROM users WHERE email = ${email} LIMIT 1`
    const user = users[0]

    if (!user) {
      // Ne pas révéler si l'utilisateur existe ou non pour des raisons de sécurité
      return NextResponse.json({
        success: true,
        message: 'Si cette adresse email est enregistrée, vous recevrez un lien de réinitialisation.'
      })
    }

    // Créer un token de réinitialisation avec expiration courte (1 heure)
    const resetToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        purpose: 'password-reset'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // TODO: En production, envoyer le token par email
    // Pour l'instant, on retourne le token (à des fins de développement/test)
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // En développement, on log le lien dans la console
    console.log('🔐 Lien de réinitialisation pour', email, ':', resetLink)

    return NextResponse.json({
      success: true,
      message: 'Si cette adresse email est enregistrée, vous recevrez un lien de réinitialisation.',
      // En développement seulement
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    })

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}