import { NextRequest, NextResponse } from 'next/server'

const MOCK_BOOKS = [
  {
    id: '1',
    title: 'Une vie motivée par l\'essentiel',
    author: 'Rick Warren',
    description: 'Découvrez les cinq objectifs de votre vie selon Dieu.',
    cover: '',
    category: 'devotional',
    language: 'Français',
    pages: 368,
    isbn: '978-2-7560-0011-2',
    publisher: 'Éditions Vida',
    year: 2003,
    rating: 4.8,
    reviews: 156,
    available: true,
    borrowable: true,
    purchasable: true,
    price: 18,
    digitalAvailable: true,
  },
  {
    id: '2',
    title: 'La Bible en 365 jours',
    author: 'Collectif',
    description: 'Parcourez la Bible entière en une année avec des commentaires quotidiens.',
    cover: '',
    category: 'bible',
    language: 'Français',
    pages: 1200,
    rating: 4.5,
    reviews: 89,
    available: true,
    borrowable: true,
    purchasable: true,
    price: 25,
    digitalAvailable: false,
  },
  {
    id: '3',
    title: 'Le champ de bataille de la pensée',
    author: 'Joyce Meyer',
    description: 'Gagnez la bataille dans votre esprit et transformez votre vie.',
    cover: '',
    category: 'devotional',
    language: 'Français',
    pages: 256,
    rating: 4.7,
    reviews: 234,
    available: false,
    borrowable: true,
    purchasable: true,
    price: 15,
    digitalAvailable: true,
  },
  {
    id: '4',
    title: 'Biographie de Billy Graham',
    author: 'William Martin',
    description: 'La vie et le ministère de l\'évangéliste le plus influent du 20e siècle.',
    cover: '',
    category: 'biography',
    language: 'Français',
    pages: 480,
    rating: 4.6,
    reviews: 67,
    available: true,
    borrowable: true,
    purchasable: false,
    digitalAvailable: false,
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
    
    const response = await fetch(`${API_URL}/library?${searchParams.toString()}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ books: Array.isArray(data) ? data : data.books || [] })
    }
    
    console.log('📚 Library: Using mock data')
    let books = MOCK_BOOKS
    if (category) books = books.filter(b => b.category === category)
    if (search) books = books.filter(b => 
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    )
    return NextResponse.json({ books })
  } catch (error) {
    return NextResponse.json({ books: MOCK_BOOKS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action // 'borrow', 'purchase', 'favorite'
    
    const messages: Record<string, string> = {
      borrow: 'Livre réservé! Vous pouvez le récupérer au secrétariat.',
      purchase: 'Commande enregistrée. Vous recevrez une confirmation par email.',
      favorite: 'Livre ajouté à vos favoris.',
      return: 'Retour enregistré. Merci!',
    }
    
    return NextResponse.json({
      success: true,
      message: messages[action] || 'Action effectuée avec succès',
    })
  } catch (error) {
    return NextResponse.json({ success: true, message: 'Action enregistrée (mode démo)' })
  }
}
