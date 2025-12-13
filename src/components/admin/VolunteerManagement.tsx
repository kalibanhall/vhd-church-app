/**
 * =============================================================================
 * GESTION DES BÉNÉVOLES - ADMINISTRATION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Interface d'administration pour gérer les équipes de service
 * et valider les inscriptions des bénévoles.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import {
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Calendar,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Eye,
  X
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
  approvedBy?: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

const VolunteerManagement: React.FC = () => {
  // États
  const [teams, setTeams] = useState<ServiceTeam[]>([])
  const [registrations, setRegistrations] = useState<VolunteerRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  
  // Filtres
  const [filterTeam, setFilterTeam] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal détail
  const [selectedRegistration, setSelectedRegistration] = useState<VolunteerRegistration | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Statistiques calculées
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'PENDING').length,
    approved: registrations.filter(r => r.status === 'APPROVED').length,
    rejected: registrations.filter(r => r.status === 'REJECTED').length,
    totalVolunteers: teams.reduce((sum, t) => sum + t.currentMembers, 0)
  }

  // Charger les données
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [teamsRes, registrationsRes] = await Promise.all([
        authenticatedFetch('/api/volunteer-proxy?type=teams'),
        authenticatedFetch('/api/volunteer-proxy?type=registrations')
      ])

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json()
        setTeams(teamsData.teams || [])
      }

      if (registrationsRes.ok) {
        const regData = await registrationsRes.json()
        setRegistrations(regData.registrations || [])
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' })
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les inscriptions
  const filteredRegistrations = registrations.filter(reg => {
    if (filterTeam && reg.teamId !== filterTeam) return false
    if (filterStatus && reg.status !== filterStatus) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        reg.userName.toLowerCase().includes(query) ||
        reg.userEmail.toLowerCase().includes(query) ||
        reg.teamName.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Approuver/Rejeter une inscription
  const handleUpdateStatus = async (registrationId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setProcessing(registrationId)
    
    // Récupérer l'utilisateur admin depuis localStorage
    const userStr = localStorage.getItem('user')
    let approvedBy = 'Admin'
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        approvedBy = `${user.firstName} ${user.lastName}`
      } catch {}
    }

    try {
      const response = await authenticatedFetch('/api/volunteer-proxy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId,
          status: newStatus,
          approvedBy
        })
      })

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: newStatus === 'APPROVED' 
            ? '✅ Inscription approuvée avec succès' 
            : '❌ Inscription refusée'
        })
        fetchData()
        setShowDetailModal(false)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setProcessing(null)
    }
  }

  // Badge de statut
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string, text: string, icon: React.ReactNode }> = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      'APPROVED': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      'REJECTED': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-3 w-3" /> }
    }
    const config = configs[status]
    const labels: Record<string, string> = { 'PENDING': 'En attente', 'APPROVED': 'Approuvé', 'REJECTED': 'Refusé' }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {labels[status]}
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Bénévoles</h1>
          <p className="text-gray-500">Gérez les équipes de service et validez les inscriptions</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
              <p className="text-xs text-gray-500">Bénévoles actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-xs text-gray-500">Approuvées</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-xs text-gray-500">Refusées</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              <p className="text-xs text-gray-500">Équipes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu des équipes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-4">Équipes de service</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {teams.map(team => (
            <div key={team.id} className="p-3 bg-gray-50 rounded-lg text-center">
              <span className="text-2xl">{team.icon}</span>
              <p className="font-medium text-sm text-gray-900 mt-1">{team.name.replace("Équipe ", "").replace("d'", "")}</p>
              <p className="text-xs text-gray-500">
                {team.currentMembers}{team.maxMembers ? `/${team.maxMembers}` : ''} membres
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par équipe */}
          <div className="relative">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Toutes les équipes</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filtre par statut */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvé</option>
              <option value="REJECTED">Refusé</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Liste des inscriptions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Inscriptions ({filteredRegistrations.length})
          </h2>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune inscription trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRegistrations.map(registration => (
              <div 
                key={registration.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{registration.userName}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {registration.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-gray-700">{registration.teamName}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                        <Calendar className="h-3 w-3" />
                        {new Date(registration.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    <StatusBadge status={registration.status} />

                    <div className="flex items-center gap-2">
                      {/* Bouton voir détails */}
                      <button
                        onClick={() => {
                          setSelectedRegistration(registration)
                          setShowDetailModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Actions rapides pour les inscriptions en attente */}
                      {registration.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(registration.id, 'APPROVED')}
                            disabled={processing === registration.id}
                            className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
                            title="Approuver"
                          >
                            {processing === registration.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(registration.id, 'REJECTED')}
                            disabled={processing === registration.id}
                            className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            title="Refuser"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Disponibilités sur mobile */}
                <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700">{registration.teamName}</p>
                  {registration.availability && registration.availability.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {registration.availability.map((avail, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {avail}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {showDetailModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Détail de l&apos;inscription</h2>
                  <p className="text-white/80">{selectedRegistration.teamName}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white/80 hover:text-white p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Infos utilisateur */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Informations du candidat</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="text-gray-500">Nom :</span> <span className="font-medium">{selectedRegistration.userName}</span></p>
                  <p><span className="text-gray-500">Email :</span> <span className="font-medium">{selectedRegistration.userEmail}</span></p>
                  <p><span className="text-gray-500">Date d&apos;inscription :</span> <span className="font-medium">{new Date(selectedRegistration.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</span></p>
                  <p><span className="text-gray-500">Statut :</span> <StatusBadge status={selectedRegistration.status} /></p>
                </div>
              </div>

              {/* Disponibilités */}
              {selectedRegistration.availability && selectedRegistration.availability.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Disponibilités</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegistration.availability.map((avail, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {avail}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expérience */}
              {selectedRegistration.experience && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Expérience</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedRegistration.experience}</p>
                </div>
              )}

              {/* Motivation */}
              {selectedRegistration.motivation && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Motivation</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedRegistration.motivation}</p>
                </div>
              )}

              {/* Actions */}
              {selectedRegistration.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleUpdateStatus(selectedRegistration.id, 'REJECTED')}
                    disabled={processing === selectedRegistration.id}
                    className="flex-1 py-3 px-4 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Refuser
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRegistration.id, 'APPROVED')}
                    disabled={processing === selectedRegistration.id}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing === selectedRegistration.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approuver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VolunteerManagement
