import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Test sans Prisma, juste bcrypt
    const bcrypt = await import('bcryptjs');
    
    const testHash = await bcrypt.hash('test123', 10);
    const testCompare = await bcrypt.compare('test123', testHash);
    
    return NextResponse.json({
      status: 'OK - bcrypt works',
      hash_created: !!testHash,
      compare_result: testCompare,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test bcrypt failed:', error);
    
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}