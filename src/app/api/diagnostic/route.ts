import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test diagnostique des dépendances...')
    
    // Test des variables d'environnement
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('📊 Variables d\'environnement:', envCheck)
    
    // Test import bcrypt
    let bcryptStatus = { available: false, error: null }
    try {
      const bcrypt = require('bcryptjs')
      await bcrypt.hash('test', 10)
      bcryptStatus.available = true
      console.log('✅ bcrypt fonctionne')
    } catch (error: any) {
      bcryptStatus.error = error.message
      console.error('❌ Erreur bcrypt:', error.message)
    }
    
    // Test import jsonwebtoken
    let jwtStatus = { available: false, error: null }
    try {
      const jwt = require('jsonwebtoken')
      jwt.sign({ test: true }, 'secret', { expiresIn: '1h' })
      jwtStatus.available = true
      console.log('✅ jsonwebtoken fonctionne')
    } catch (error: any) {
      jwtStatus.error = error.message
      console.error('❌ Erreur jwt:', error.message)
    }
    
    // Test import Prisma
    let prismaStatus = { available: false, error: null }
    try {
      const { prisma } = require('../../../lib/prisma')
      await prisma.$queryRaw`SELECT 1`
      prismaStatus.available = true
      console.log('✅ Prisma fonctionne')
    } catch (error: any) {
      prismaStatus.error = error.message
      console.error('❌ Erreur Prisma:', error.message)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Diagnostic des dépendances',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      dependencies: {
        bcrypt: bcryptStatus,
        jwt: jwtStatus,
        prisma: prismaStatus
      }
    })
    
  } catch (error: any) {
    console.error('💥 Erreur diagnostic:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du diagnostic',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}