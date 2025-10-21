import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 DEBUG API - Variables d\'environnement');
    
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Définie' : 'MANQUANTE',
      JWT_SECRET: process.env.JWT_SECRET ? 'Définie' : 'MANQUANTE',
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Définie' : 'MANQUANTE',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Définie' : 'MANQUANTE'
    };
    
    console.log('Variables:', envVars);
    
    // Test de connexion simple
    let dbTest = 'Non testé';
    try {
      if (process.env.DATABASE_URL) {
        // Import dynamique pour éviter les erreurs de build
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.$queryRaw`SELECT 1 as test`;
        dbTest = 'CONNEXION OK';
        await prisma.$disconnect();
      }
    } catch (dbError: any) {
      dbTest = `ERREUR: ${dbError.message}`;
      console.error('Erreur DB:', dbError);
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envVars,
      database: dbTest,
      message: 'Debug API fonctionnelle'
    });
    
  } catch (error: any) {
    console.error('Erreur Debug API:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}