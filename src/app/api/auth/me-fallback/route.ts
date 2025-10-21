import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { tempUsers, newTempUsers } from '../../../../lib/temp-users';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Token d\'authentification manquant' 
      }, { status: 401 });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded.userId) {
      return NextResponse.json({ 
        error: 'Token invalide' 
      }, { status: 401 });
    }

    // Rechercher l'utilisateur
    const allUsers = [...tempUsers, ...newTempUsers];
    const user = allUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    // Retourner les données utilisateur (sans mot de passe)
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      success: true,
      user: userWithoutPassword,
      fallback: true,
      message: 'Utilisateur authentifié (mode temporaire)'
    });

  } catch (error: any) {
    console.error('❌ Erreur auth/me fallback:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ 
        error: 'Token invalide' 
      }, { status: 401 });
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ 
        error: 'Token expiré' 
      }, { status: 401 });
    }
    
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error.message
    }, { status: 500 });
  }
}