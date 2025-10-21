import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test variables d'environnement seulement
    const dbUrl = process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    const jwtSecret = process.env.JWT_SECRET;
    
    return NextResponse.json({
      status: 'OK - Environment check',
      has_database_url: !!dbUrl,
      database_url_length: dbUrl?.length || 0,
      node_env: nodeEnv,
      has_jwt_secret: !!jwtSecret,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test env failed:', error);
    
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}