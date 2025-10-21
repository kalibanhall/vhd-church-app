import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    console.log('🔍 DB Status Check...')
    
    // Test simple de connexion
    const userCount = await prisma.user.count()
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { email: true, firstName: true, lastName: true }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Base de données opérationnelle',
      stats: {
        userCount,
        adminExists: !!adminExists,
        adminInfo: adminExists ? {
          email: adminExists.email,
          name: `${adminExists.firstName} ${adminExists.lastName}`
        } : null
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Erreur DB Status:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: process.env.NODE_ENV === 'development' ? (error as any).stack : undefined
    }, { status: 500 })
  }
}