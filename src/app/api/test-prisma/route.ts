import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Test Prisma seul - juste une connexion simple
    const { prisma } = await import('../../../lib/prisma');
    
    // Test connexion simple
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'OK - Prisma works',
      user_count: userCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test Prisma failed:', error);
    
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}