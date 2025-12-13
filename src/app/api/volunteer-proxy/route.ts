/**
 * =============================================================================
 * API VOLUNTEER PROXY - GESTION DES ÉQUIPES DE SERVICE (BÉNÉVOLAT)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: API pour gérer les équipes de service et les inscriptions
 * des bénévoles dans l'église.
 * 
 * Équipes disponibles:
 * - Accueil (WELCOME)
 * - Louange/Musique (WORSHIP)
 * - Technique/Son (TECH)
 * - Enfants/École du dimanche (CHILDREN)
 * - Intercession (INTERCESSION)
 * - Protocole (PROTOCOL)
 * - Média/Communication (MEDIA)
 * - Nettoyage (CLEANING)
 * - Sécurité (SECURITY)
 * - Restauration (CATERING)
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

// Types pour les équipes de service
interface ServiceTeam {
  id: string
  name: string
  code: string
  description: string
  icon: string
  maxMembers?: number
  currentMembers: number
  schedule?: string
  leaderId?: string
  leaderName?: string
  isActive: boolean
  createdAt: string
}

interface VolunteerRegistration {
  id: string
  userId: string
  userName: string
  userEmail: string
  teamId: string
  teamName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  availability: string[]
  experience?: string
  motivation?: string
  createdAt: string
  approvedAt?: string
  approvedBy?: string
}

// Données simulées des équipes de service (en attendant le backend)
const serviceTeams: ServiceTeam[] = [
  {
    id: '1',
    name: 'Équipe d\'Accueil',
    code: 'WELCOME',
    description: 'Accueillir chaleureusement les fidèles et visiteurs à l\'entrée de l\'église',
    icon: '👋',
    maxMembers: 20,
    currentMembers: 12,
    schedule: 'Dimanche 8h30 - 13h00',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Équipe de Louange',
    code: 'WORSHIP',
    description: 'Conduire l\'assemblée dans la louange et l\'adoration par la musique',
    icon: '🎵',
    maxMembers: 15,
    currentMembers: 8,
    schedule: 'Répétitions: Samedi 15h | Service: Dimanche 9h',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Équipe Technique',
    code: 'TECH',
    description: 'Gérer le son, la vidéo et les équipements techniques pendant les services',
    icon: '🎛️',
    maxMembers: 10,
    currentMembers: 5,
    schedule: 'Dimanche 8h00 - 13h30',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'École du Dimanche',
    code: 'CHILDREN',
    description: 'Enseigner et encadrer les enfants pendant le culte',
    icon: '👶',
    maxMembers: 15,
    currentMembers: 7,
    schedule: 'Dimanche 10h00 - 12h00',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Équipe d\'Intercession',
    code: 'INTERCESSION',
    description: 'Prier pour l\'église, les membres et les besoins de la communauté',
    icon: '🙏',
    maxMembers: 30,
    currentMembers: 18,
    schedule: 'Mercredi 18h | Dimanche 8h',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Protocole',
    code: 'PROTOCOL',
    description: 'Assurer l\'ordre et le bon déroulement des cérémonies',
    icon: '🎩',
    maxMembers: 12,
    currentMembers: 6,
    schedule: 'Dimanche 9h00 - 13h00',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Média & Communication',
    code: 'MEDIA',
    description: 'Gérer les réseaux sociaux, photos, vidéos et communication de l\'église',
    icon: '📱',
    maxMembers: 8,
    currentMembers: 4,
    schedule: 'Flexible',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Équipe de Nettoyage',
    code: 'CLEANING',
    description: 'Maintenir la propreté et l\'ordre des locaux de l\'église',
    icon: '🧹',
    maxMembers: 15,
    currentMembers: 9,
    schedule: 'Samedi 8h | Dimanche après le culte',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Sécurité',
    code: 'SECURITY',
    description: 'Assurer la sécurité des fidèles et des locaux',
    icon: '🛡️',
    maxMembers: 10,
    currentMembers: 6,
    schedule: 'Tous les services',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '10',
    name: 'Restauration',
    code: 'CATERING',
    description: 'Préparer et servir les repas lors des événements spéciaux',
    icon: '🍽️',
    maxMembers: 20,
    currentMembers: 11,
    schedule: 'Événements spéciaux',
    isActive: true,
    createdAt: new Date().toISOString()
  }
]

// Stockage temporaire des inscriptions (en mémoire)
let volunteerRegistrations: VolunteerRegistration[] = []

/**
 * GET - Récupérer les équipes et/ou les inscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'teams' // 'teams' | 'registrations' | 'my-registrations'
    const userId = searchParams.get('userId')
    const teamId = searchParams.get('teamId')
    const status = searchParams.get('status')

    if (type === 'teams') {
      // Retourner toutes les équipes actives
      const activeTeams = serviceTeams.filter(team => team.isActive)
      return NextResponse.json({ 
        teams: activeTeams,
        total: activeTeams.length 
      })
    }

    if (type === 'my-registrations' && userId) {
      // Retourner les inscriptions de l'utilisateur
      const userRegistrations = volunteerRegistrations.filter(r => r.userId === userId)
      return NextResponse.json({ 
        registrations: userRegistrations,
        total: userRegistrations.length 
      })
    }

    if (type === 'registrations') {
      // Admin: retourner toutes les inscriptions avec filtres optionnels
      let filteredRegistrations = [...volunteerRegistrations]
      
      if (teamId) {
        filteredRegistrations = filteredRegistrations.filter(r => r.teamId === teamId)
      }
      if (status) {
        filteredRegistrations = filteredRegistrations.filter(r => r.status === status)
      }

      return NextResponse.json({ 
        registrations: filteredRegistrations,
        total: filteredRegistrations.length 
      })
    }

    return NextResponse.json({ teams: serviceTeams })

  } catch (error: any) {
    console.error('❌ Volunteer GET proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST - Créer une nouvelle inscription à une équipe
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, userName, userEmail, teamId, availability, experience, motivation } = body

    // Validation des champs requis
    if (!userId || !teamId) {
      return NextResponse.json(
        { error: 'userId et teamId sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'équipe existe
    const team = serviceTeams.find(t => t.id === teamId)
    if (!team) {
      return NextResponse.json(
        { error: 'Équipe non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur n'est pas déjà inscrit à cette équipe
    const existingRegistration = volunteerRegistrations.find(
      r => r.userId === userId && r.teamId === teamId && r.status !== 'REJECTED'
    )
    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Vous êtes déjà inscrit à cette équipe' },
        { status: 400 }
      )
    }

    // Créer la nouvelle inscription
    const newRegistration: VolunteerRegistration = {
      id: `reg_${Date.now()}`,
      userId,
      userName: userName || 'Utilisateur',
      userEmail: userEmail || '',
      teamId,
      teamName: team.name,
      status: 'PENDING',
      availability: availability || [],
      experience: experience || '',
      motivation: motivation || '',
      createdAt: new Date().toISOString()
    }

    volunteerRegistrations.push(newRegistration)

    return NextResponse.json({
      message: 'Inscription enregistrée avec succès',
      registration: newRegistration
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Volunteer POST proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Mettre à jour le statut d'une inscription (Admin/Responsable)
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { registrationId, status, approvedBy } = body

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: 'registrationId et status sont requis' },
        { status: 400 }
      )
    }

    // Trouver et mettre à jour l'inscription
    const registrationIndex = volunteerRegistrations.findIndex(r => r.id === registrationId)
    if (registrationIndex === -1) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    volunteerRegistrations[registrationIndex] = {
      ...volunteerRegistrations[registrationIndex],
      status,
      approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
      approvedBy: approvedBy || undefined
    }

    // Si approuvé, incrémenter le compteur de membres de l'équipe
    if (status === 'APPROVED') {
      const teamIndex = serviceTeams.findIndex(t => t.id === volunteerRegistrations[registrationIndex].teamId)
      if (teamIndex !== -1) {
        serviceTeams[teamIndex].currentMembers += 1
      }
    }

    return NextResponse.json({
      message: `Inscription ${status === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès`,
      registration: volunteerRegistrations[registrationIndex]
    })

  } catch (error: any) {
    console.error('❌ Volunteer PUT proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Annuler une inscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('registrationId')

    if (!registrationId) {
      return NextResponse.json(
        { error: 'registrationId est requis' },
        { status: 400 }
      )
    }

    const registrationIndex = volunteerRegistrations.findIndex(r => r.id === registrationId)
    if (registrationIndex === -1) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    // Si l'inscription était approuvée, décrémenter le compteur
    if (volunteerRegistrations[registrationIndex].status === 'APPROVED') {
      const teamIndex = serviceTeams.findIndex(t => t.id === volunteerRegistrations[registrationIndex].teamId)
      if (teamIndex !== -1 && serviceTeams[teamIndex].currentMembers > 0) {
        serviceTeams[teamIndex].currentMembers -= 1
      }
    }

    volunteerRegistrations.splice(registrationIndex, 1)

    return NextResponse.json({
      message: 'Inscription annulée avec succès'
    })

  } catch (error: any) {
    console.error('❌ Volunteer DELETE proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    )
  }
}
