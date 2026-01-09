import { NextRequest, NextResponse } from 'next/server'

const MOCK_MY_QUESTIONS = [
  {
    id: '1',
    question: 'Comment puis-je mieux prier?',
    category: 'spiritual',
    status: 'answered',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    answer: 'La prière est avant tout une conversation avec Dieu. Commencez par la louange, puis la confession, les remerciements et enfin vos requêtes. La régularité est plus importante que la durée.',
    answeredBy: 'Pasteur Jean',
    answeredDate: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '2',
    question: 'Que dit la Bible sur le pardon?',
    category: 'bible',
    status: 'pending',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

const MOCK_FAQS = [
  {
    id: '1',
    question: 'Comment devenir membre de l\'église?',
    answer: 'Pour devenir membre, vous devez: 1) Accepter Jésus comme Seigneur et Sauveur, 2) Suivre la classe des nouveaux membres, 3) Être baptisé, 4) S\'engager dans une cellule de prière.',
    category: 'membership',
    views: 245,
  },
  {
    id: '2',
    question: 'Quels sont les horaires des cultes?',
    answer: 'Nos cultes ont lieu chaque dimanche à 9h00 et 11h00. Le culte de prière est le mercredi à 18h30.',
    category: 'general',
    views: 189,
  },
  {
    id: '3',
    question: 'Comment puis-je m\'impliquer dans un ministère?',
    answer: 'Rendez-vous dans la section "Servir" de l\'application pour découvrir les différents ministères et postuler selon vos dons et disponibilités.',
    category: 'service',
    views: 156,
  },
  {
    id: '4',
    question: 'Comment demander une visite pastorale?',
    answer: 'Vous pouvez demander une visite pastorale via la section "Être suivi" ou en contactant directement le secrétariat de l\'église.',
    category: 'pastoral',
    views: 98,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'
    
    const token = request.headers.get('authorization')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token
    
    let endpoint = 'questions'
    if (type === 'faq') endpoint = 'faq'
    else if (userId) endpoint = `questions?userId=${userId}`
    
    const response = await fetch(`${API_URL}/${endpoint}`, { method: 'GET', headers })

    if (response.ok) {
      const data = await response.json()
      if (type === 'faq') {
        return NextResponse.json({ faqs: Array.isArray(data) ? data : data.faqs || [] })
      }
      return NextResponse.json({ questions: Array.isArray(data) ? data : data.questions || [] })
    }
    
    console.log('❓ Questions: Using mock data')
    if (type === 'faq') {
      return NextResponse.json({ faqs: MOCK_FAQS })
    }
    return NextResponse.json({ questions: MOCK_MY_QUESTIONS })
  } catch (error) {
    return NextResponse.json({ questions: MOCK_MY_QUESTIONS, faqs: MOCK_FAQS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Question envoyée avec succès. Vous recevrez une réponse bientôt.',
      question: {
        id: Date.now().toString(),
        ...body,
        status: 'pending',
        date: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ success: true, message: 'Question enregistrée (mode démo)' })
  }
}
