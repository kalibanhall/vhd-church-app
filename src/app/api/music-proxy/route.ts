import { NextRequest, NextResponse } from 'next/server'

const MOCK_SONGS = [
  {
    id: '1',
    title: 'Béni soit ton nom',
    artist: 'Matt Redman',
    album: 'Blessed Be Your Name',
    duration: '4:32',
    category: 'worship',
    audioUrl: '',
    cover: '',
    lyrics: true,
    plays: 15420,
  },
  {
    id: '2',
    title: 'À toi la gloire',
    artist: 'Hillsong Worship',
    album: 'Louange Française',
    duration: '5:15',
    category: 'worship',
    audioUrl: '',
    cover: '',
    lyrics: true,
    plays: 12350,
  },
  {
    id: '3',
    title: 'Reckless Love',
    artist: 'Cory Asbury',
    album: 'Reckless Love',
    duration: '5:48',
    category: 'contemporary',
    audioUrl: '',
    cover: '',
    lyrics: true,
    plays: 9870,
  },
  {
    id: '4',
    title: 'Way Maker',
    artist: 'Sinach',
    album: 'Way Maker',
    duration: '6:02',
    category: 'gospel',
    audioUrl: '',
    cover: '',
    lyrics: true,
    plays: 23150,
  },
  {
    id: '5',
    title: 'Amazing Grace (My Chains Are Gone)',
    artist: 'Chris Tomlin',
    album: 'See The Morning',
    duration: '4:45',
    category: 'hymns',
    audioUrl: '',
    cover: '',
    lyrics: true,
    plays: 18900,
  },
]

const MOCK_PLAYLISTS = [
  {
    id: '1',
    name: 'Louange du dimanche',
    description: 'Les chants du culte dominical',
    cover: '',
    songs: ['1', '2', '4'],
    createdBy: 'Équipe de louange',
    isPublic: true,
  },
  {
    id: '2',
    name: 'Prière et méditation',
    description: 'Musique calme pour vos moments de prière',
    cover: '',
    songs: ['3', '5'],
    createdBy: 'Équipe de louange',
    isPublic: true,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'songs', 'playlists', 'artists'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/music?${searchParams.toString()}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }
    
    console.log('🎵 Music: Using mock data')
    
    if (type === 'playlists') {
      return NextResponse.json({ playlists: MOCK_PLAYLISTS })
    }
    
    let songs = MOCK_SONGS
    if (category) songs = songs.filter(s => s.category === category)
    if (search) songs = songs.filter(s => 
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
    )
    return NextResponse.json({ songs })
  } catch (error) {
    return NextResponse.json({ songs: MOCK_SONGS, playlists: MOCK_PLAYLISTS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'createPlaylist') {
      return NextResponse.json({
        success: true,
        message: 'Playlist créée avec succès',
        playlist: {
          id: Date.now().toString(),
          ...body.playlist,
          songs: [],
        }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
