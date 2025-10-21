import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Ultra Simple')
    
    const body = await request.json()
    console.log('Body reçu:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Test ultra simple réussi',
      received: body,
      env: {
        jwt_secret: !!process.env.JWT_SECRET,
        database_url: !!process.env.DATABASE_URL
      }
    })
    
  } catch (error: any) {
    console.error('❌ Erreur test ultra simple:', error)
    return NextResponse.json({
      error: 'Erreur test ultra simple',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}