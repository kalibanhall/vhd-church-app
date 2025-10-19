import { NextResponse } from 'next/server'
import { clearAuthCookie } from '../../../../lib/auth-config'

export async function POST() {
  const response = NextResponse.json({ 
    success: true,
    message: 'Déconnexion réussie' 
  })
  
  return clearAuthCookie(response)
}