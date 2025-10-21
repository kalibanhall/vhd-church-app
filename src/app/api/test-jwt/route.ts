import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Test JWT seul
    const jwt = await import('jsonwebtoken');
    
    const testToken = jwt.sign({ test: true }, 'secret', { expiresIn: '1h' });
    const testVerify = jwt.verify(testToken, 'secret');
    
    return NextResponse.json({
      status: 'OK - JWT works',
      token_created: !!testToken,
      verify_result: testVerify,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test JWT failed:', error);
    
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}