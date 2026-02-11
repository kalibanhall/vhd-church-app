/**
 * =============================================================================
 * PAGE SERVIR - INSCRIPTION AUX ÉQUIPES DE SERVICE (BÉNÉVOLAT)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Page permettant aux membres de l'église de s'inscrire aux 
 * différentes équipes de service pour contribuer à la vie de la communauté.
 * 
 * Design: Figma Church Design System
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  Users, 
  Music, 
  Mic, 
  Heart, 
  Shield, 
  Camera, 
  Utensils, 
  Sparkles,
  Baby,
  HeartHandshake,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  X,
  UserPlus,
  Calendar,
  Info
} from 'lucide-react'

// Types
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
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

// Mapping des icônes par code d'équipe
const teamIcons: Record<string, React.ReactNode> = {
  'WELCOME': <Users className="h-8 w-8" />,
  'WORSHIP': <Music className="h-8 w-8" />,
  'TECH': <Mic className="h-8 w-8" />,
  'CHILDREN': <Baby className="h-8 w-8" />,
  'INTERCESSION': <Heart className="h-8 w-8" />,
  'PROTOCOL': <HeartHandshake className="h-8 w-8" />,
  'MEDIA': <Camera className="h-8 w-8" />,
  'CLEANING': <Sparkles className="h-8 w-8" />,
  'SECURITY': <Shield className="h-8 w-8" />,
  'CATERING': <Utensils className="h-8 w-8" />
}

// Couleurs par code d'équipe - Design Church
const teamColors: Record<string, string> = {
  'WELCOME': 'from-[#ffc200] to-[#cc9b00]',
  'WORSHIP': 'from-[#ffc200] to-[#cc9b00]',
  'TECH': 'from-[#ffc200] to-[#cc9b00]',
  'CHILDREN': 'from-[#ffc200] to-[#cc9b00]',
  'INTERCESSION': 'from-[#ffc200] to-[#cc9b00]',
  'PROTOCOL': 'from-[#ffc200] to-[#cc9b00]',
  'MEDIA': 'from-[#ffc200] to-[#cc9b00]',
  'CLEANING': 'from-[#ffc200] to-[#cc9b00]',
  'SECURITY': 'from-[#ffc200] to-[#cc9b00]',
  'CATERING': 'from-[#ffc200] to-[#cc9b00]'
}

const VolunteerPage: React.FC = () => {
  // États
  const [teams, setTeams] = useState<ServiceTeam[]>([])
  const [myRegistrations, setMyRegistrations] = useState<VolunteerRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<ServiceTeam | null>(null)
  const [activeTab, setActiveTab] = useState<'teams' | 'my-registrations'>('teams')
  
  // Formulaire d'inscription
  const [formData, setFormData] = useState({
    availability: [] as string[],
    experience: '',
    motivation: ''
  })

  // Options de disponibilité
  const availabilityOptions = [
    'Dimanche matin',
    'Dimanche soir',
    'Mercredi soir',
    'Samedi',
    'Événements spéciaux',
    'Flexible'
  ]

  // Récupérer l'utilisateur depuis le localStorage
  const getUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch {
          return null
        }
      }
    }
    return null
  }

  const user = getUserFromStorage()

  // Charger les données au montage
  useEffect(() => {
    fetchTeams()
    if (user?.id) {
      fetchMyRegistrations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Récupérer les équipes
  const fetchTeams = async () => {
    try {
      const response = await authenticatedFetch('/api/volunteer-proxy?type=teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Erreur chargement équipes:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des équipes' })
    } finally {
      setLoading(false)
    }
  }

  // Récupérer mes inscriptions
  const fetchMyRegistrations = async () => {
    if (!user?.id) return
    try {
      const response = await authenticatedFetch(`/api/volunteer-proxy?type=my-registrations&userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setMyRegistrations(data.registrations || [])
      }
    } catch (error) {
      console.error('Erreur chargement inscriptions:', error)
    }
  }

  // Vérifier si déjà inscrit à une équipe
  const isRegisteredToTeam = (teamId: string) => {
    return myRegistrations.some(r => r.teamId === teamId && r.status !== 'REJECTED')
  }

  // Obtenir le statut d'inscription pour une équipe
  const getRegistrationStatus = (teamId: string) => {
    const registration = myRegistrations.find(r => r.teamId === teamId)
    return registration?.status
  }

  // Ouvrir le modal d'inscription
  const openRegistrationModal = (team: ServiceTeam) => {
    if (isRegisteredToTeam(team.id)) {
      setMessage({ type: 'info', text: 'Vous êtes déjà inscrit à cette équipe' })
      return
    }
    setSelectedTeam(team)
    setFormData({ availability: [], experience: '', motivation: '' })
    setShowModal(true)
  }

  // Toggle disponibilité
  const toggleAvailability = (option: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(a => a !== option)
        : [...prev.availability, option]
    }))
  }

  // Soumettre l'inscription
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam || !user) return

    if (formData.availability.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins une disponibilité' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const response = await authenticatedFetch('/api/volunteer-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          teamId: selectedTeam.id,
          availability: formData.availability,
          experience: formData.experience,
          motivation: formData.motivation
        })
      })

      // Vérifier le content-type avant de parser en JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Le serveur a renvoyé une réponse invalide')
      }

      const data = await response.json()
      if (response.ok) {
        setMessage({ type: 'success', text: 'Inscription enregistrée ! Un responsable va examiner votre demande.' })
        setShowModal(false)
        fetchMyRegistrations()
        fetchTeams()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'inscription' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setSubmitting(false)
    }
  }

  // Annuler une inscription
  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette inscription ?')) return

    try {
      const response = await authenticatedFetch(`/api/volunteer-proxy?registrationId=${registrationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Inscription annulée' })
        fetchMyRegistrations()
        fetchTeams()
      } else {
        let errorMsg = 'Erreur lors de l\'annulation'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json()
            errorMsg = data.error || errorMsg
          }
        } catch { /* ignore parse error */ }
        setMessage({ type: 'error', text: errorMsg })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
  }

  // Rendu du badge de statut
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string, text: string, icon: React.ReactNode, label: string }> = {
      'PENDING': { bg: 'bg-[#fff3cc]', text: 'text-[#cc9b00]', icon: <Clock className="h-3 w-3" />, label: 'En attente' },
      'APPROVED': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3" />, label: 'Approuvé' },
      'REJECTED': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-3 w-3" />, label: 'Refusé' }
    }
    const config = configs[status] || configs['PENDING']

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Servir dans l'Église</h1>
          <p className="text-[#666] mt-2">Chargement des équipes...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-church animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#fffefa] rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[#fffefa] rounded w-1/3" />
                  <div className="h-4 bg-[#fffefa] rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffefa]">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-[#ffc200] via-[#ffda66] to-[#fff3cc] text-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <HeartHandshake className="h-8 w-8 text-[#0a0a0a]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Servir dans l'Église</h1>
            <p className="text-[#0a0a0a]/70 text-sm">
              « Car nous sommes son ouvrage, créés pour de bonnes œuvres » - Éphésiens 2:10
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-24 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#fff3cc] border border-[#ffc200] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#cc9b00]">{teams.length}</p>
            <p className="text-xs text-[#666]">Équipes</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">{myRegistrations.filter(r => r.status === 'APPROVED').length}</p>
            <p className="text-xs text-[#666]">Approuvées</p>
          </div>
          <div className="bg-[#fff3cc] border border-[#ffc200] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#cc9b00]">{myRegistrations.filter(r => r.status === 'PENDING').length}</p>
            <p className="text-xs text-[#666]">En attente</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-[#fff3cc] text-[#cc9b00] border border-[#ffc200]'
          }`}>
            {message.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
            {message.type === 'error' && <XCircle className="h-5 w-5 flex-shrink-0" />}
            {message.type === 'info' && <Info className="h-5 w-5 flex-shrink-0" />}
            <span className="text-sm flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-1 hover:bg-white/50 rounded-full">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-church mb-6">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'teams'
                ? 'bg-[#ffc200] text-[#0a0a0a] shadow-church'
                : 'text-[#666] hover:text-[#0a0a0a]'
            }`}
          >
            <Users className="h-4 w-4" />
            Équipes
          </button>
          <button
            onClick={() => setActiveTab('my-registrations')}
            className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'my-registrations'
                ? 'bg-[#ffc200] text-[#0a0a0a] shadow-church'
                : 'text-[#666] hover:text-[#0a0a0a]'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Inscriptions
            {myRegistrations.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'my-registrations' ? 'bg-white/30' : 'bg-[#fff3cc] text-[#cc9b00]'
              }`}>
                {myRegistrations.length}
              </span>
            )}
          </button>
        </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'teams' ? (
        /* Grille des équipes */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => {
            const isRegistered = isRegisteredToTeam(team.id)
            const status = getRegistrationStatus(team.id)
            const colorClass = teamColors[team.code] || 'from-[#ffc200] to-[#cc9b00]'
            const icon = teamIcons[team.code] || <Users className="h-8 w-8" />
            const isFull = team.maxMembers && team.currentMembers >= team.maxMembers

            return (
              <div 
                key={team.id}
                className={`bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)] overflow-hidden transition-all hover:shadow-lg ${
                  isRegistered ? 'ring-2 ring-[#ffc200]' : ''
                }`}
              >
                {/* Header coloré */}
                <div className={`bg-gradient-to-r ${colorClass} p-4 text-[#0a0a0a]`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/30 p-2 rounded-lg">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{team.name}</h3>
                        <p className="text-[#0a0a0a]/70 text-sm">{team.icon} {team.code}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4 space-y-3">
                  <p className="text-[#666] text-sm">{team.description}</p>

                  {/* Infos */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 bg-[#fffefa] text-[#666] px-2 py-1 rounded border border-[rgba(201,201,201,0.3)]">
                      <Users className="h-3 w-3" />
                      {team.currentMembers}{team.maxMembers ? `/${team.maxMembers}` : ''} membres
                    </span>
                    {team.schedule && (
                      <span className="inline-flex items-center gap-1 bg-[#fffefa] text-[#666] px-2 py-1 rounded border border-[rgba(201,201,201,0.3)]">
                        <Calendar className="h-3 w-3" />
                        {team.schedule}
                      </span>
                    )}
                  </div>

                  {/* Statut ou bouton */}
                  {isRegistered ? (
                    <div className="flex items-center justify-between">
                      <StatusBadge status={status || 'PENDING'} />
                      {status === 'PENDING' && (
                        <button
                          onClick={() => {
                            const reg = myRegistrations.find(r => r.teamId === team.id)
                            if (reg) handleCancelRegistration(reg.id)
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => openRegistrationModal(team)}
                      disabled={isFull || false}
                      className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                        isFull
                          ? 'bg-[#fffefa] text-[#999] cursor-not-allowed border border-[rgba(201,201,201,0.3)]'
                          : 'bg-[#ffc200] text-[#0a0a0a] hover:bg-[#cc9b00]'
                      }`}
                    >
                      {isFull ? (
                        <>Équipe complète</>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          S&apos;inscrire
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Liste des inscriptions */
        <div className="space-y-4">
          {myRegistrations.length === 0 ? (
            <div className="text-center py-12 bg-[#fffefa] rounded-xl border border-[rgba(201,201,201,0.3)]">
              <UserPlus className="h-12 w-12 text-[#999] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#0a0a0a] mb-2">Aucune inscription</h3>
              <p className="text-[#666] mb-4">Vous n&apos;êtes inscrit à aucune équipe de service</p>
              <button
                onClick={() => setActiveTab('teams')}
                className="text-[#cc9b00] hover:text-[#ffc200] font-medium"
              >
                Voir les équipes disponibles →
              </button>
            </div>
          ) : (
            myRegistrations.map((registration) => {
              const team = teams.find(t => t.id === registration.teamId)
              const colorClass = team ? teamColors[team.code] || 'from-[#ffc200] to-[#cc9b00]' : 'from-[#ffc200] to-[#cc9b00]'

              return (
                <div 
                  key={registration.id}
                  className="bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)] overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${colorClass} h-2`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[#0a0a0a]">{registration.teamName}</h3>
                        <p className="text-sm text-[#666]">
                          Inscrit le {new Date(registration.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <StatusBadge status={registration.status} />
                    </div>

                    {/* Disponibilités */}
                    {registration.availability && registration.availability.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-[#666] mb-1">Disponibilités :</p>
                        <div className="flex flex-wrap gap-1">
                          {registration.availability.map((avail, idx) => (
                            <span key={idx} className="text-xs bg-[#fff3cc] text-[#cc9b00] px-2 py-0.5 rounded">
                              {avail}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {registration.status === 'PENDING' && (
                      <div className="mt-4 pt-3 border-t border-[rgba(201,201,201,0.3)]">
                        <button
                          onClick={() => handleCancelRegistration(registration.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Annuler l&apos;inscription
                        </button>
                      </div>
                    )}

                    {registration.status === 'APPROVED' && (
                      <div className="mt-4 pt-3 border-t border-[rgba(201,201,201,0.3)]">
                        <p className="text-sm text-green-600">
                          ✅ Vous faites partie de cette équipe !
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Modal d'inscription */}
      {showModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`bg-gradient-to-r ${teamColors[selectedTeam.code] || 'from-[#ffc200] to-[#cc9b00]'} p-6 text-[#0a0a0a] rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/30 p-2 rounded-lg">
                    {teamIcons[selectedTeam.code] || <Users className="h-8 w-8" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">S&apos;inscrire</h2>
                    <p className="text-[#0a0a0a]/70">{selectedTeam.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#0a0a0a]/70 hover:text-[#0a0a0a] p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmitRegistration} className="p-6 space-y-6">
              {/* Disponibilités */}
              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Vos disponibilités *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availabilityOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleAvailability(option)}
                      className={`p-2 rounded-lg text-sm border transition-colors ${
                        formData.availability.includes(option)
                          ? 'bg-[#fff3cc] border-[#ffc200] text-[#cc9b00]'
                          : 'border-[rgba(201,201,201,0.3)] text-[#666] hover:border-[#ffc200]'
                      }`}
                    >
                      {formData.availability.includes(option) && (
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                      )}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expérience */}
              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Expérience dans ce domaine (optionnel)
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  rows={2}
                  className="w-full border border-[rgba(201,201,201,0.3)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                  placeholder="Décrivez brièvement votre expérience..."
                />
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Pourquoi souhaitez-vous rejoindre cette équipe ? (optionnel)
                </label>
                <textarea
                  value={formData.motivation}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                  rows={3}
                  className="w-full border border-[rgba(201,201,201,0.3)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                  placeholder="Partagez votre motivation..."
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-[rgba(201,201,201,0.3)] rounded-xl font-medium text-[#666] hover:bg-[#fffefa]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.availability.length === 0}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#ffc200] to-[#cc9b00] text-[#0a0a0a] rounded-xl font-medium hover:from-[#cc9b00] hover:to-[#a67c00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-church"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info bottom */}
      <div className="mt-6 bg-gradient-to-r from-[#fff3cc] to-[#ffda66] rounded-xl p-4 text-center border border-[#ffc200]">
        <p className="text-sm text-[#0a0a0a]">
          « Servir les autres, c'est servir Christ » - Matthieu 25:40
        </p>
      </div>
      </div>
    </div>
  )
}

export default VolunteerPage
