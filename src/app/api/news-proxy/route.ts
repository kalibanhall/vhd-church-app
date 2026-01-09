import { NextRequest, NextResponse } from 'next/server'

const MOCK_NEWS = [
  {
    id: '1',
    type: 'announcement',
    title: 'Culte spécial de louange ce dimanche',
    content: 'Rejoignez-nous pour un moment de louange et d\'adoration intense. Une équipe de worship exceptionnelle sera présente.',
    author: { name: 'Pasteur Jean', avatar: '' },
    date: new Date().toISOString(),
    likes: 45,
    comments: 12,
    image: '',
  },
  {
    id: '2',
    type: 'event',
    title: 'Retraite spirituelle - Inscriptions ouvertes',
    content: 'La retraite annuelle aura lieu du 15 au 17 février. Thème: "Marcher dans la foi". Places limitées!',
    author: { name: 'Comité d\'organisation', avatar: '' },
    date: new Date(Date.now() - 86400000).toISOString(),
    likes: 32,
    comments: 8,
    image: '',
  },
  {
    id: '3',
    type: 'testimony',
    title: 'Témoignage: Dieu m\'a guéri!',
    content: 'Gloire à Dieu! Après des années de maladie, le Seigneur a entendu nos prières et m\'a complètement restauré.',
    author: { name: 'Marie K.', avatar: '' },
    date: new Date(Date.now() - 172800000).toISOString(),
    likes: 89,
    comments: 24,
    image: '',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    const url = queryString ? `${API_URL}/news?${queryString}` : `${API_URL}/news`
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(url, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ posts: Array.isArray(data) ? data : data.posts || data.news || [] })
    }
    
    // Fallback to mock data
    console.log('📰 News: Using mock data (backend returned', response.status, ')')
    return NextResponse.json({ posts: MOCK_NEWS })
  } catch (error) {
    console.log('📰 News: Using mock data (error:', error, ')')
    return NextResponse.json({ posts: MOCK_NEWS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/news`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }
    
    // Mock response
    return NextResponse.json({
      success: true,
      message: 'Publication créée (mode démo)',
      post: { id: Date.now().toString(), ...body, date: new Date().toISOString() }
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: 'Publication créée (mode démo)',
    })
  }
}
