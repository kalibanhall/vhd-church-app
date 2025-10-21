import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Connexion admin simple
    if (email === 'admin@vhd.app' && password === 'Qualis@2025') {
      return NextResponse.json({
        success: true,
        message: 'Connexion réussie',
        user: {
          id: 'admin-temp',
          email: 'admin@vhd.app',
          firstName: 'Chris',
          lastName: 'Kasongo', 
          role: 'ADMIN',
          status: 'ACTIVE'
        },
        token: 'temp-admin-token'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Identifiants incorrects'
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({
      success: false, 
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}