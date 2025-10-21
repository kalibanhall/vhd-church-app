import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Import bcrypt
    const bcrypt = await import('bcrypt');
    console.log('✅ bcrypt import OK');
    
    // Test 2: Import jwt
    const jwt = await import('jsonwebtoken');
    console.log('✅ jwt import OK');
    
    // Test 3: Simple hash
    const testHash = await bcrypt.hash('test123', 10);
    console.log('✅ bcrypt hash OK');
    
    // Test 4: Simple compare
    const testCompare = await bcrypt.compare('test123', testHash);
    console.log('✅ bcrypt compare OK:', testCompare);
    
    // Test 5: Simple JWT sign
    const testToken = jwt.sign({ test: true }, 'secret', { expiresIn: '1h' });
    console.log('✅ jwt sign OK');
    
    // Test 6: Simple JWT verify
    const testVerify = jwt.verify(testToken, 'secret');
    console.log('✅ jwt verify OK');
    
    return NextResponse.json({
      status: 'all_tests_passed',
      bcrypt: 'OK',
      jwt: 'OK',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}