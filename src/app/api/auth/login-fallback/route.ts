import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { tempUsers } from '../../../../lib/temp-users';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email et mot de passe requis'
      }, { status: 400 });
    }

    // Rechercher l'utilisateur dans les données temporaires
    const user = tempUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé'
      }, { status: 401 });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Mot de passe incorrect'
      }, { status: 401 });
    }

    // Créer le token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Préparer les données utilisateur (sans le mot de passe)
    const { passwordHash, ...userWithoutPassword } = user;

    // Créer la réponse avec cookie sécurisé
    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie (mode temporaire)',
      user: userWithoutPassword,
      token,
      fallback: true
    });

    // Définir le cookie d'authentification
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('❌ Erreur login fallback:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error.message
    }, { status: 500 });
  }
}