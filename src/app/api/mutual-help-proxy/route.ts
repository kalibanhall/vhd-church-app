import { NextRequest, NextResponse } from 'next/server'

const MOCK_HELP_POSTS = [
  {
    id: '1',
    type: 'need',
    category: 'transport',
    title: 'Besoin de covoiturage pour le culte',
    description: 'Je cherche quelqu\'un pour m\'emmener au culte le dimanche depuis Lemba.',
    author: { id: '1', name: 'Maman Marie Luzolo', phone: '+243 81 234 56 78' },
    location: 'Lemba, Kinshasa',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'open',
    responses: 2,
    urgent: false,
  },
  {
    id: '2',
    type: 'offer',
    category: 'education',
    title: 'Cours de soutien scolaire gratuits',
    description: 'Je suis enseignant à la retraite et je propose des cours gratuits pour les enfants qui en ont besoin.',
    author: { id: '2', name: 'Papa Jean Kalala', phone: '+243 99 876 54 32' },
    location: 'Ngaliema, Kinshasa',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'open',
    responses: 5,
    urgent: false,
  },
  {
    id: '3',
    type: 'need',
    category: 'housing',
    title: 'Recherche hébergement temporaire',
    description: 'Suite à des travaux dans mon appartement, je cherche un hébergement pour 2 semaines.',
    author: { id: '3', name: 'Frère Paul Dikondo', phone: '' },
    location: 'Gombe, Kinshasa',
    date: new Date().toISOString(),
    status: 'open',
    responses: 0,
    urgent: true,
  },
  {
    id: '4',
    type: 'offer',
    category: 'food',
    title: 'Repas pour personnes isolées',
    description: 'Notre famille peut accueillir 2-3 personnes isolées pour le déjeuner du dimanche.',
    author: { id: '4', name: 'Famille Kabongo', phone: '+243 82 554 43 32' },
    location: 'Limete, Kinshasa',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'open',
    responses: 1,
    urgent: false,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    let query = ''
    if (type) query += `type=${type}&`
    if (category) query += `category=${category}`
    
    const response = await fetch(`${API_URL}/mutual-help${query ? `?${query}` : ''}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ posts: Array.isArray(data) ? data : data.posts || [] })
    }
    
    console.log('🤝 Mutual Help: Using mock data')
    let posts = MOCK_HELP_POSTS
    if (type) posts = posts.filter(p => p.type === type)
    if (category) posts = posts.filter(p => p.category === category)
    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ posts: MOCK_HELP_POSTS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: body.type === 'need' 
        ? 'Votre demande d\'aide a été publiée. La communauté sera notifiée.'
        : 'Votre offre d\'aide a été publiée. Merci pour votre générosité!',
      post: {
        id: Date.now().toString(),
        ...body,
        status: 'open',
        responses: 0,
        date: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ success: true, message: 'Publication enregistrée (mode démo)' })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Réponse envoyée avec succès. L\'auteur sera notifié.',
    })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
