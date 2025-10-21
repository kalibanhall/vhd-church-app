import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Test simple : compter les utilisateurs
    const count = await prisma.user.count();
    
    return NextResponse.json({
      status: 'OK',
      user_count: count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      status: 'failed',
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}