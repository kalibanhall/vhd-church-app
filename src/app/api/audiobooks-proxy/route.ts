import { NextRequest, NextResponse } from 'next/server'

const MOCK_AUDIOBOOKS = [
  {
    id: '1',
    title: 'Une vie motivée par l\'essentiel',
    author: 'Rick Warren',
    narrator: 'Pierre Dupont',
    description: 'Découvrez les cinq objectifs de votre vie selon Dieu. Version audio intégrale.',
    cover: '',
    category: 'devotional',
    duration: '12h 30min',
    chapters: [
      { id: '1', title: 'Introduction', duration: '15:00' },
      { id: '2', title: 'Chapitre 1: Tout commence par Dieu', duration: '25:00' },
      { id: '3', title: 'Chapitre 2: Vous n\'êtes pas là par hasard', duration: '22:00' },
    ],
    rating: 4.8,
    reviews: 89,
    premium: false,
    audioUrl: '',
  },
  {
    id: '2',
    title: 'Le pouvoir de la prière',
    author: 'E.M. Bounds',
    narrator: 'Marie Lambert',
    description: 'Un classique de la littérature chrétienne sur la puissance de la prière.',
    cover: '',
    category: 'prayer',
    duration: '6h 45min',
    chapters: [
      { id: '1', title: 'La prière et la foi', duration: '30:00' },
      { id: '2', title: 'La prière et la Parole', duration: '28:00' },
    ],
    rating: 4.9,
    reviews: 156,
    premium: false,
    audioUrl: '',
  },
  {
    id: '3',
    title: 'Biographie de Hudson Taylor',
    author: 'Howard Taylor',
    narrator: 'Jean Martin',
    description: 'La vie extraordinaire du missionnaire en Chine.',
    cover: '',
    category: 'biography',
    duration: '18h 20min',
    chapters: [
      { id: '1', title: 'Les premières années', duration: '45:00' },
      { id: '2', title: 'L\'appel de Dieu', duration: '38:00' },
    ],
    rating: 4.7,
    reviews: 45,
    premium: true,
    audioUrl: '',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/audiobooks?${searchParams.toString()}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ audiobooks: Array.isArray(data) ? data : data.audiobooks || [] })
    }
    
    console.log('🎧 Audiobooks: Using mock data')
    let audiobooks = MOCK_AUDIOBOOKS
    if (category) audiobooks = audiobooks.filter(a => a.category === category)
    if (search) audiobooks = audiobooks.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase())
    )
    return NextResponse.json({ audiobooks })
  } catch (error) {
    return NextResponse.json({ audiobooks: MOCK_AUDIOBOOKS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Progression sauvegardée',
    })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
