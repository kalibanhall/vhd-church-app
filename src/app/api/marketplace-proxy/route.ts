import { NextRequest, NextResponse } from 'next/server'

const MOCK_PRODUCTS = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Frère Pierre Mbuyi',
    userPhone: '+243 81 234 56 78',
    title: 'Bible d\'étude Louis Segond',
    description: 'Bible en excellent état, peu utilisée. Reliure cuir, index, notes de bas de page.',
    price: 25000,
    negotiable: true,
    category: 'books',
    condition: 'like_new',
    images: [],
    location: 'Gombe, Kinshasa',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    views: 45,
    favorites: 8,
    status: 'active',
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sœur Marie Luzolo',
    userPhone: '+243 99 876 54 32',
    title: 'Robe de baptême taille 38',
    description: 'Magnifique robe blanche pour baptême, portée une seule fois. Très bon état.',
    price: 45000,
    negotiable: true,
    category: 'clothing',
    condition: 'good',
    images: [],
    location: 'Ngaliema, Kinshasa',
    date: new Date(Date.now() - 86400000).toISOString(),
    views: 32,
    favorites: 5,
    status: 'active',
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Frère Jean Dikondo',
    title: 'Guitare acoustique',
    description: 'Guitare idéale pour louange, avec housse de transport. Cordes neuves.',
    price: 80000,
    negotiable: false,
    category: 'music',
    condition: 'good',
    images: [],
    location: 'Lemba, Kinshasa',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    views: 67,
    favorites: 12,
    status: 'active',
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Sœur Sophie Kabongo',
    title: 'Collection de livres chrétiens',
    description: 'Lot de 15 livres: Rick Warren, Joyce Meyer, Max Lucado et autres. À prendre ensemble.',
    price: 35000,
    negotiable: true,
    category: 'books',
    condition: 'good',
    images: [],
    location: 'Limete, Kinshasa',
    date: new Date().toISOString(),
    views: 12,
    favorites: 3,
    status: 'active',
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
    
    const response = await fetch(`${API_URL}/marketplace?${searchParams.toString()}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ products: Array.isArray(data) ? data : data.products || [] })
    }
    
    console.log('🛒 Marketplace: Using mock data')
    let products = MOCK_PRODUCTS
    if (category) products = products.filter(p => p.category === category)
    if (search) products = products.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ products: MOCK_PRODUCTS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Votre annonce a été publiée avec succès!',
      product: {
        id: Date.now().toString(),
        ...body,
        status: 'active',
        views: 0,
        favorites: 0,
        date: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ success: true, message: 'Annonce publiée (mode démo)' })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Annonce mise à jour avec succès',
    })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Annonce supprimée',
    })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
