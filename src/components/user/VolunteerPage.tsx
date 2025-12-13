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
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
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

// Couleurs par code d'équipe
const teamColors: Record<string, string> = {
  'WELCOME': 'from-blue-500 to-blue-600',
  'WORSHIP': 'from-purple-500 to-purple-600',
  'TECH': 'from-gray-600 to-gray-700',
  'CHILDREN': 'from-pink-500 to-pink-600',
  'INTERCESSION': 'from-red-500 to-red-600',
  'PROTOCOL': 'from-amber-500 to-amber-600',
  'MEDIA': 'from-cyan-500 to-cyan-600',
  'CLEANING': 'from-green-500 to-green-600',
  'SECURITY': 'from-slate-600 to-slate-700',
  'CATERING': 'from-orange-500 to-orange-600'
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

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '🎉 Inscription enregistrée ! Un responsable va examiner votre demande.' })
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
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'annulation' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
  }

  // Rendu du badge de statut
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string, text: string, icon: React.ReactNode, label: string }> = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-3 w-3" />, label: 'En attente' },
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">🤝 Servir dans l&apos;Église</h1>
        <p className="text-blue-100">
          &laquo;Car nous sommes son ouvrage, ayant été créés en Jésus-Christ pour de bonnes œuvres&raquo; - Éphésiens 2:10
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {message.type === 'error' && <XCircle className="h-5 w-5" />}
          {message.type === 'info' && <Info className="h-5 w-5" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'teams'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Équipes de service
        </button>
        <button
          onClick={() => setActiveTab('my-registrations')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'my-registrations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserPlus className="h-4 w-4 inline mr-2" />
          Mes inscriptions
          {myRegistrations.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {myRegistrations.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'teams' ? (
        /* Grille des équipes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const isRegistered = isRegisteredToTeam(team.id)
            const status = getRegistrationStatus(team.id)
            const colorClass = teamColors[team.code] || 'from-gray-500 to-gray-600'
            const icon = teamIcons[team.code] || <Users className="h-8 w-8" />
            const isFull = team.maxMembers && team.currentMembers >= team.maxMembers

            return (
              <div 
                key={team.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${
                  isRegistered ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Header coloré */}
                <div className={`bg-gradient-to-r ${colorClass} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{team.name}</h3>
                        <p className="text-white/80 text-sm">{team.icon} {team.code}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4 space-y-3">
                  <p className="text-gray-600 text-sm">{team.description}</p>

                  {/* Infos */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      <Users className="h-3 w-3" />
                      {team.currentMembers}{team.maxMembers ? `/${team.maxMembers}` : ''} membres
                    </span>
                    {team.schedule && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded">
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
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
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
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune inscription</h3>
              <p className="text-gray-500 mb-4">Vous n&apos;êtes inscrit à aucune équipe de service</p>
              <button
                onClick={() => setActiveTab('teams')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir les équipes disponibles →
              </button>
            </div>
          ) : (
            myRegistrations.map((registration) => {
              const team = teams.find(t => t.id === registration.teamId)
              const colorClass = team ? teamColors[team.code] || 'from-gray-500 to-gray-600' : 'from-gray-500 to-gray-600'

              return (
                <div 
                  key={registration.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${colorClass} h-2`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{registration.teamName}</h3>
                        <p className="text-sm text-gray-500">
                          Inscrit le {new Date(registration.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <StatusBadge status={registration.status} />
                    </div>

                    {/* Disponibilités */}
                    {registration.availability && registration.availability.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Disponibilités :</p>
                        <div className="flex flex-wrap gap-1">
                          {registration.availability.map((avail, idx) => (
                            <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              {avail}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {registration.status === 'PENDING' && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleCancelRegistration(registration.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Annuler l&apos;inscription
                        </button>
                      </div>
                    )}

                    {registration.status === 'APPROVED' && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
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
            <div className={`bg-gradient-to-r ${teamColors[selectedTeam.code] || 'from-blue-500 to-blue-600'} p-6 text-white rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    {teamIcons[selectedTeam.code] || <Users className="h-8 w-8" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">S&apos;inscrire</h2>
                    <p className="text-white/80">{selectedTeam.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmitRegistration} className="p-6 space-y-6">
              {/* Disponibilités */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expérience dans ce domaine (optionnel)
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez brièvement votre expérience..."
                />
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pourquoi souhaitez-vous rejoindre cette équipe ? (optionnel)
                </label>
                <textarea
                  value={formData.motivation}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Partagez votre motivation..."
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.availability.length === 0}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Confirmer l&apos;inscription
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VolunteerPage
