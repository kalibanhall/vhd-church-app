import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { tempUsers, newTempUsers } from '../../../../lib/temp-users';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis'
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const allUsers = [...tempUsers, ...newTempUsers];
    const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer le nouvel utilisateur
    const newUser = {
      id: `temp-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      firstName,
      lastName,
      phone: phone || '',
      role: 'MEMBER',
      status: 'ACTIVE',
      membershipDate: new Date(),
      createdAt: new Date()
    };

    // Ajouter à la liste temporaire
    newTempUsers.push(newUser);

    // Créer le token JWT
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Préparer les données utilisateur (sans le mot de passe)
    const { passwordHash, ...userWithoutPassword } = newUser;

    // Créer la réponse avec cookie sécurisé
    const response = NextResponse.json({
      success: true,
      message: 'Inscription réussie (mode temporaire)',
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
    console.error('❌ Erreur register fallback:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error.message
    }, { status: 500 });
  }
}