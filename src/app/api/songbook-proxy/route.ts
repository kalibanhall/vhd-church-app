import { NextRequest, NextResponse } from 'next/server'

const MOCK_HYMNS = [
  {
    id: '1',
    number: 1,
    title: 'À toi la gloire',
    author: 'Edmond Budry',
    composer: 'G.F. Händel',
    category: 'easter',
    verses: [
      {
        number: 1,
        text: 'À toi la gloire, Ô Ressuscité !\nÀ toi la victoire pour l\'éternité !\nBrillant de lumière, l\'ange est descendu,\nIl roule la pierre du tombeau vaincu.',
      },
      {
        number: 0,
        text: 'À toi la gloire, Ô Ressuscité !\nÀ toi la victoire pour l\'éternité !',
        isChorus: true,
      },
      {
        number: 2,
        text: 'Vois-le paraître : c\'est lui, c\'est Jésus,\nTon Sauveur, ton Maître, oh ! ne doute plus !\nSois dans l\'allégresse, peuple du Seigneur,\nEt redis sans cesse que Christ est vainqueur.',
      },
    ],
    themes: ['Pâques', 'Résurrection', 'Victoire'],
    year: 1884,
  },
  {
    id: '2',
    number: 23,
    title: 'Quel ami fidèle et tendre',
    author: 'Joseph Scriven',
    composer: 'Charles Converse',
    category: 'comfort',
    verses: [
      {
        number: 1,
        text: 'Quel ami fidèle et tendre nous avons en Jésus-Christ,\nToujours prêt à nous entendre, à répondre à notre cri !\nIl connaît nos défaillances, nos chutes de chaque jour,\nSévère en ses exigences, il est riche en son amour.',
      },
      {
        number: 2,
        text: 'Quel ami fidèle et tendre nous avons en Jésus-Christ,\nToujours prêt à nous défendre quand nous presse l\'ennemi !\nIl nous suit dans la mêlée, nous entoure de ses bras\nEt c\'est lui qui tient l\'épée qui nous garde du trépas.',
      },
    ],
    themes: ['Amitié', 'Consolation', 'Prière'],
    year: 1855,
  },
  {
    id: '3',
    number: 47,
    title: 'Louange à Dieu',
    author: 'Martin Luther',
    composer: 'Martin Luther',
    category: 'praise',
    verses: [
      {
        number: 1,
        text: 'C\'est un rempart que notre Dieu,\nUne invincible armure,\nNotre délivrance en tout lieu,\nNotre défense sûre.',
      },
    ],
    themes: ['Louange', 'Protection', 'Foi'],
    year: 1529,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const number = searchParams.get('number')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    const response = await fetch(`${API_URL}/songbook?${searchParams.toString()}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ hymns: Array.isArray(data) ? data : data.hymns || data.songs || [] })
    }
    
    console.log('🎼 Songbook: Using mock data')
    let hymns = MOCK_HYMNS
    if (category) hymns = hymns.filter(h => h.category === category)
    if (number) hymns = hymns.filter(h => h.number === parseInt(number))
    if (search) hymns = hymns.filter(h => 
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.verses.some(v => v.text.toLowerCase().includes(search.toLowerCase()))
    )
    return NextResponse.json({ hymns })
  } catch (error) {
    return NextResponse.json({ hymns: MOCK_HYMNS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Cantique ajouté aux favoris',
    })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
