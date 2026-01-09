import { NextRequest, NextResponse } from 'next/server'

const MOCK_ALBUMS = [
  {
    id: '1',
    name: 'Culte de Noël 2025',
    description: 'Les plus beaux moments du culte de Noël',
    date: '2025-12-25',
    cover: '',
    category: 'worship',
    photosCount: 45,
    viewCount: 230,
  },
  {
    id: '2',
    name: 'Baptêmes Octobre 2025',
    description: 'Célébration des baptêmes d\'automne',
    date: '2025-10-15',
    cover: '',
    category: 'baptism',
    photosCount: 32,
    viewCount: 189,
  },
  {
    id: '3',
    name: 'Retraite spirituelle',
    description: 'Weekend de retraite à la montagne',
    date: '2025-09-20',
    cover: '',
    category: 'retreat',
    photosCount: 78,
    viewCount: 156,
  },
  {
    id: '4',
    name: 'Fête de l\'église',
    description: 'Anniversaire de l\'église - 25 ans',
    date: '2025-06-15',
    cover: '',
    category: 'celebration',
    photosCount: 120,
    viewCount: 345,
  },
]

const MOCK_PHOTOS = [
  {
    id: '1',
    albumId: '1',
    url: '',
    thumbnail: '',
    caption: 'Le choeur de Noël',
    date: '2025-12-25',
    likes: 45,
    photographer: 'Jean P.',
  },
  {
    id: '2',
    albumId: '1',
    url: '',
    thumbnail: '',
    caption: 'Distribution des cadeaux aux enfants',
    date: '2025-12-25',
    likes: 67,
    photographer: 'Marie L.',
  },
  {
    id: '3',
    albumId: '2',
    url: '',
    thumbnail: '',
    caption: 'Moment de baptême',
    date: '2025-10-15',
    likes: 89,
    photographer: 'Pierre M.',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'albums' or 'photos'
    const albumId = searchParams.get('albumId')
    const category = searchParams.get('category')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/gallery?${searchParams.toString()}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }
    
    console.log('📷 Gallery: Using mock data')
    
    if (type === 'photos' || albumId) {
      let photos = MOCK_PHOTOS
      if (albumId) photos = photos.filter(p => p.albumId === albumId)
      return NextResponse.json({ photos })
    }
    
    let albums = MOCK_ALBUMS
    if (category) albums = albums.filter(a => a.category === category)
    return NextResponse.json({ albums })
  } catch (error) {
    return NextResponse.json({ albums: MOCK_ALBUMS, photos: MOCK_PHOTOS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'like') {
      return NextResponse.json({ success: true, message: 'Photo aimée' })
    }
    
    if (body.action === 'favorite') {
      return NextResponse.json({ success: true, message: 'Photo ajoutée aux favoris' })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
