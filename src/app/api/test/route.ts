import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API de test fonctionnelle !",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL
  })
}