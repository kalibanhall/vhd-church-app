import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /api/init-simple appelée')
    
    const body = await request.json()
    console.log('📥 Body reçu:', body)
    
    if (!body.confirm) {
      return NextResponse.json({ 
        message: 'Initialisation annulée',
        required: 'confirm: true'
      }, { status: 400 })
    }

    // Test simple - pas de Prisma
    return NextResponse.json({
      success: true,
      message: 'API init simple fonctionne !',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erreur API init-simple:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}