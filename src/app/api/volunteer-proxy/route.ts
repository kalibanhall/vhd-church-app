/**
 * =============================================================================
 * API VOLUNTEER PROXY - GESTION DES ÉQUIPES DE SERVICE (BÉNÉVOLAT)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: API pour gérer les équipes de service et les inscriptions
 * des bénévoles dans l'église. Les équipes sont créées par l'admin et les
 * demandes d'inscription sont validées par l'admin.
 * 
 * Aucune donnée n'est prédéfinie - tout est créé via le backoffice admin.
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

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

// Stockage en mémoire - Commencer avec des tableaux vides
// Les équipes sont créées par l'admin
let serviceTeams: ServiceTeam[] = []
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
    const type = searchParams.get('type') || 'teams'
    const userId = searchParams.get('userId')
    const teamId = searchParams.get('teamId')
    const status = searchParams.get('status')

    // Essayer de récupérer depuis le backend
    try {
      const backendUrl = new URL(`${API_BASE_URL}/volunteers/${type}`)
      if (userId) backendUrl.searchParams.set('userId', userId)
      if (teamId) backendUrl.searchParams.set('teamId', teamId)
      if (status) backendUrl.searchParams.set('status', status)

      const response = await fetch(backendUrl.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour le cache local
        if (data.teams) serviceTeams = data.teams
        if (data.registrations) volunteerRegistrations = data.registrations
        return NextResponse.json(data)
      }
    } catch {
      console.log('Backend non disponible, utilisation du cache local')
    }

    // Fallback: données locales
    if (type === 'teams') {
      const activeTeams = serviceTeams.filter(team => team.isActive)
      return NextResponse.json({ 
        teams: activeTeams,
        total: activeTeams.length,
        source: 'local'
      })
    }

    if (type === 'my-registrations' && userId) {
      const userRegistrations = volunteerRegistrations.filter(r => r.userId === userId)
      return NextResponse.json({ 
        registrations: userRegistrations,
        total: userRegistrations.length,
        source: 'local'
      })
    }

    if (type === 'registrations') {
      let filteredRegistrations = [...volunteerRegistrations]
      
      if (teamId) {
        filteredRegistrations = filteredRegistrations.filter(r => r.teamId === teamId)
      }
      if (status) {
        filteredRegistrations = filteredRegistrations.filter(r => r.status === status)
      }

      // Trier par date de création (plus récent en premier)
      filteredRegistrations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      return NextResponse.json({ 
        registrations: filteredRegistrations,
        total: filteredRegistrations.length,
        source: 'local'
      })
    }

    return NextResponse.json({ 
      teams: serviceTeams.filter(t => t.isActive),
      source: 'local'
    })

  } catch (error: unknown) {
    console.error('❌ Volunteer GET proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST - S'inscrire à une équipe ou créer une équipe (admin)
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    // Essayer d'envoyer au backend
    try {
      const response = await fetch(`${API_BASE_URL}/volunteers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data, { status: 201 })
      }
    } catch {
      console.log('Backend non disponible, traitement local')
    }

    // Fallback: traitement local

    // Inscription d'un membre à une équipe
    if (action === 'register' || !action) {
      const { userId, userName, userEmail, teamId, availability, experience, motivation } = body

      // Vérifier si l'équipe existe
      const team = serviceTeams.find(t => t.id === teamId)
      if (!team) {
        return NextResponse.json(
          { error: 'Équipe non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier si déjà inscrit
      const existingRegistration = volunteerRegistrations.find(
        r => r.userId === userId && r.teamId === teamId && r.status !== 'REJECTED'
      )
      if (existingRegistration) {
        return NextResponse.json(
          { error: 'Vous êtes déjà inscrit ou avez une demande en cours pour cette équipe' },
          { status: 400 }
        )
      }

      // Créer l'inscription (en attente de validation admin)
      const newRegistration: VolunteerRegistration = {
        id: `volreg_${Date.now()}`,
        userId,
        userName: userName || 'Membre',
        userEmail: userEmail || '',
        teamId,
        teamName: team.name,
        status: 'PENDING', // En attente de validation
        availability: availability || [],
        experience: experience || '',
        motivation: motivation || '',
        createdAt: new Date().toISOString()
      }

      volunteerRegistrations.push(newRegistration)

      return NextResponse.json({
        success: true,
        message: 'Demande d\'inscription envoyée. Elle sera validée par un administrateur.',
        registration: newRegistration
      }, { status: 201 })
    }

    // Admin: Créer une nouvelle équipe
    if (action === 'create-team') {
      const { name, code, description, icon, maxMembers, schedule, leaderId, leaderName } = body

      // Vérifier si le code existe déjà
      if (serviceTeams.find(t => t.code === code)) {
        return NextResponse.json(
          { error: 'Une équipe avec ce code existe déjà' },
          { status: 400 }
        )
      }

      const newTeam: ServiceTeam = {
        id: `team_${Date.now()}`,
        name,
        code: code || name.toUpperCase().replace(/\s+/g, '_').substring(0, 20),
        description: description || '',
        icon: icon || '👥',
        maxMembers: maxMembers || undefined,
        currentMembers: 0,
        schedule: schedule || '',
        leaderId: leaderId || undefined,
        leaderName: leaderName || undefined,
        isActive: true,
        createdAt: new Date().toISOString()
      }

      serviceTeams.push(newTeam)

      return NextResponse.json({
        success: true,
        message: 'Équipe créée avec succès',
        team: newTeam
      }, { status: 201 })
    }

    // Admin: Mettre à jour une équipe (via POST avec action)
    if (action === 'update-team') {
      const { teamId, name, code, description, icon, maxMembers, schedule, isActive } = body

      const teamIndex = serviceTeams.findIndex(t => t.id === teamId)
      if (teamIndex === -1) {
        return NextResponse.json({ error: 'Équipe non trouvée' }, { status: 404 })
      }

      // Vérifier si le nouveau code est déjà utilisé par une autre équipe
      if (code && code !== serviceTeams[teamIndex].code) {
        if (serviceTeams.find(t => t.code === code && t.id !== teamId)) {
          return NextResponse.json(
            { error: 'Une équipe avec ce code existe déjà' },
            { status: 400 }
          )
        }
      }

      serviceTeams[teamIndex] = {
        ...serviceTeams[teamIndex],
        ...(name && { name }),
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(icon && { icon }),
        ...(maxMembers !== undefined && { maxMembers: maxMembers || undefined }),
        ...(schedule !== undefined && { schedule }),
        ...(isActive !== undefined && { isActive })
      }

      return NextResponse.json({
        success: true,
        message: 'Équipe mise à jour avec succès',
        team: serviceTeams[teamIndex]
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

  } catch (error: unknown) {
    console.error('❌ Volunteer POST proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'opération' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Mettre à jour une inscription (approbation/rejet) ou une équipe
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { registrationId, teamId, status, approvedBy } = body

    // Essayer d'envoyer au backend
    try {
      const response = await fetch(`${API_BASE_URL}/volunteers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {
      console.log('Backend non disponible, traitement local')
    }

    // Mise à jour d'une inscription (validation admin)
    if (registrationId) {
      const registrationIndex = volunteerRegistrations.findIndex(r => r.id === registrationId)
      if (registrationIndex === -1) {
        return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 })
      }

      if (status) {
        volunteerRegistrations[registrationIndex].status = status
        
        if (status === 'APPROVED') {
          volunteerRegistrations[registrationIndex].approvedAt = new Date().toISOString()
          volunteerRegistrations[registrationIndex].approvedBy = approvedBy || 'Admin'
          
          // Incrémenter le nombre de membres de l'équipe
          const teamIndex = serviceTeams.findIndex(t => t.id === volunteerRegistrations[registrationIndex].teamId)
          if (teamIndex !== -1) {
            serviceTeams[teamIndex].currentMembers += 1
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: status === 'APPROVED' ? 'Inscription approuvée' : 'Inscription rejetée',
        registration: volunteerRegistrations[registrationIndex]
      })
    }

    // Mise à jour d'une équipe
    if (teamId) {
      const teamIndex = serviceTeams.findIndex(t => t.id === teamId)
      if (teamIndex === -1) {
        return NextResponse.json({ error: 'Équipe non trouvée' }, { status: 404 })
      }

      const { name, description, icon, maxMembers, schedule, leaderId, leaderName, isActive } = body

      serviceTeams[teamIndex] = {
        ...serviceTeams[teamIndex],
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon && { icon }),
        ...(maxMembers !== undefined && { maxMembers }),
        ...(schedule !== undefined && { schedule }),
        ...(leaderId !== undefined && { leaderId }),
        ...(leaderName !== undefined && { leaderName }),
        ...(isActive !== undefined && { isActive })
      }

      return NextResponse.json({
        success: true,
        message: 'Équipe mise à jour',
        team: serviceTeams[teamIndex]
      })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  } catch (error: unknown) {
    console.error('❌ Volunteer PUT proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Supprimer une équipe ou annuler une inscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { teamId, registrationId } = body

    // Essayer d'envoyer au backend
    try {
      const response = await fetch(`${API_BASE_URL}/volunteers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {
      console.log('Backend non disponible, traitement local')
    }

    // Supprimer une équipe
    if (teamId) {
      const teamIndex = serviceTeams.findIndex(t => t.id === teamId)
      if (teamIndex === -1) {
        return NextResponse.json({ error: 'Équipe non trouvée' }, { status: 404 })
      }

      // Supprimer l'équipe
      serviceTeams.splice(teamIndex, 1)

      // Supprimer les inscriptions associées
      volunteerRegistrations = volunteerRegistrations.filter(r => r.teamId !== teamId)

      return NextResponse.json({
        success: true,
        message: 'Équipe supprimée avec succès'
      })
    }

    // Annuler/supprimer une inscription
    if (registrationId) {
      const registrationIndex = volunteerRegistrations.findIndex(r => r.id === registrationId)
      if (registrationIndex === -1) {
        return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 })
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
        success: true,
        message: 'Inscription supprimée'
      })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  } catch (error: unknown) {
    console.error('❌ Volunteer DELETE proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
