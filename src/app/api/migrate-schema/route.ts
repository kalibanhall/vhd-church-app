import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action !== 'migrate-schema') {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 400 });
    }

    // Importer dynamiquement Prisma pour éviter les problèmes de bundle
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Test de connexion basique
    await prisma.$connect();
    console.log('✅ Connexion PostgreSQL réussie');

    // Vérifier si les tables existent
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Tables existantes:', tables);

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Connexion DB réussie depuis Vercel',
      tables: tables
    });

  } catch (error: any) {
    console.error('❌ Erreur migration:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de connexion DB',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}