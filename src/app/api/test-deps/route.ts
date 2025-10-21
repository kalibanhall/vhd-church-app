import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Test dépendances simple...')
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {} as any
    }
    
    // Test 1: bcryptjs
    try {
      const bcrypt = require('bcryptjs')
      const hash = await bcrypt.hash('test123', 10)
      const isValid = await bcrypt.compare('test123', hash)
      results.tests.bcrypt = { 
        status: 'OK', 
        hash: hash.substring(0, 10) + '...', 
        compare: isValid 
      }
      console.log('✅ bcrypt test OK')
    } catch (error: any) {
      results.tests.bcrypt = { 
        status: 'ERROR', 
        error: error.message 
      }
      console.error('❌ bcrypt error:', error.message)
    }
    
    // Test 2: jsonwebtoken
    try {
      const jwt = require('jsonwebtoken')
      const token = jwt.sign({ test: true }, 'secret', { expiresIn: '1h' })
      const decoded = jwt.verify(token, 'secret')
      results.tests.jwt = { 
        status: 'OK', 
        token: token.substring(0, 20) + '...', 
        decoded: decoded 
      }
      console.log('✅ jwt test OK')
    } catch (error: any) {
      results.tests.jwt = { 
        status: 'ERROR', 
        error: error.message 
      }
      console.error('❌ jwt error:', error.message)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test des dépendances critiques',
      results
    })
    
  } catch (error: any) {
    console.error('💥 Erreur générale:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}