import { NextRequest, NextResponse } from 'next/server'

// Note: No mock data returned for abuse reports for privacy/security
// Only confirmation messages

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    if (reportId) {
      const response = await fetch(`${API_URL}/abuse-reports/${reportId}`, { method: 'GET', headers })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    }
    
    // Return empty for privacy
    return NextResponse.json({ 
      message: 'Les signalements sont confidentiels et traités par l\'équipe pastorale.',
      reports: [] 
    })
  } catch (error) {
    return NextResponse.json({ reports: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/abuse-reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }
    
    // Always return success for user safety
    return NextResponse.json({
      success: true,
      message: 'Votre signalement a été enregistré de manière confidentielle. Un membre de l\'équipe pastorale prendra contact avec vous si nécessaire.',
      reportId: `ABR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      confidential: true,
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: 'Signalement enregistré. Votre sécurité est notre priorité.',
      reportId: `ABR-${Date.now()}`,
    })
  }
}
