/**
 * =============================================================================
 * ADMIN - GESTION DES DEMANDES D'AIDE
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Interface admin pour gérer les demandes d'aide des membres.
 * Permet de voir, assigner, répondre et suivre les demandes.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  HelpCircle,
  Search,
  Filter,
  Eye,
  UserPlus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Heart,
  Home,
  DollarSign,
  Users,
  Briefcase,
  MoreVertical,
  X,
  Send,
  Phone,
  Mail,
  Calendar,
  User,
  Shield,
  AlertCircle,
  TrendingUp,
  ChevronDown
} from 'lucide-react'

// Types
interface HelpRequest {
  id: string
  user_id: string
  type: string
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  is_anonymous: boolean
  contact_preference: string
  phone: string | null
  email: string | null
  assigned_to: string | null
  assigned_to_name: string | null
  response: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  requester_name: string
  requester_email: string | null
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

interface Stats {
  total: number
  pending: number
  in_progress: number
  completed: number
  high_urgency: number
}

// Configuration des types de demandes
const requestTypes = [
  { value: 'material', label: 'Aide matérielle', icon: Home, color: 'bg-[#ffc200]' },
  { value: 'financial', label: 'Aide financière', icon: DollarSign, color: 'bg-green-500' },
  { value: 'spiritual', label: 'Accompagnement spirituel', icon: Heart, color: 'bg-purple-500' },
  { value: 'counseling', label: 'Counseling', icon: Users, color: 'bg-indigo-500' },
  { value: 'prayer', label: 'Prière spéciale', icon: Heart, color: 'bg-pink-500' },
  { value: 'other', label: 'Autre', icon: MoreVertical, color: 'bg-gray-500' }
]

// Configuration des niveaux d'urgence
const urgencyLevels = [
  { value: 'low', label: 'Faible', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500' },
  { value: 'high', label: 'Urgente', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' }
]

// Configuration des statuts
const statusConfig = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  { value: 'in_progress', label: 'En cours', color: 'bg-[#fff3cc] text-[#5c4d00]', icon: Loader2 },
  { value: 'completed', label: 'Terminée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'cancelled', label: 'Annulée', color: 'bg-gray-100 text-gray-700', icon: XCircle }
]

const HelpRequestsManagement: React.FC = () => {
  // États
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<HelpRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterUrgency, setFilterUrgency] = useState<string>('all')
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, in_progress: 0, completed: 0, high_urgency: 0 })

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [assigneeId, setAssigneeId] = useState('')
  const [responseText, setResponseText] = useState('')
  const [newStatus, setNewStatus] = useState('')

  // Charger les demandes
  useEffect(() => {
    loadRequests()
  }, [])

  // Filtrer les demandes
  useEffect(() => {
    let filtered = requests

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.requester_name?.toLowerCase().includes(query)
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus)
    }

    if (filterUrgency !== 'all') {
      filtered = filtered.filter(r => r.urgency === filterUrgency)
    }

    setFilteredRequests(filtered)
  }, [requests, searchQuery, filterType, filterStatus, filterUrgency])

  // Calculer les stats
  useEffect(() => {
    setStats({
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      high_urgency: requests.filter(r => r.urgency === 'high' && r.status !== 'completed').length
    })
  }, [requests])

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch('/api/help-requests-proxy?admin=true')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.data || [])
      }
    } catch (error) {
      console.error('Error loading help requests:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des demandes' })
    } finally {
      setIsLoading(false)
    }
  }

  const viewDetails = (request: HelpRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const openAssignModal = (request: HelpRequest) => {
    setSelectedRequest(request)
    setAssigneeId('')
    setShowAssignModal(true)
  }

  const openResponseModal = (request: HelpRequest) => {
    setSelectedRequest(request)
    setResponseText(request.response || '')
    setNewStatus(request.status)
    setShowResponseModal(true)
  }

  const handleAssign = async () => {
    if (!selectedRequest || !assigneeId) return

    setIsSubmitting(true)
    try {
      const response = await authenticatedFetch(`/api/help-requests-proxy?id=${selectedRequest.id}&assign=true`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: assigneeId })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Demande assignée avec succès' })
        setShowAssignModal(false)
        loadRequests()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de l\'assignation' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'assignation' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResponse = async () => {
    if (!selectedRequest) return

    setIsSubmitting(true)
    try {
      const response = await authenticatedFetch(`/api/help-requests-proxy?id=${selectedRequest.id}&respond=true`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          response: responseText,
          status: newStatus
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Réponse enregistrée avec succès' })
        setShowResponseModal(false)
        loadRequests()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de l\'enregistrement' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await authenticatedFetch(`/api/help-requests-proxy?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Statut mis à jour' })
        loadRequests()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    }
  }

  const getTypeInfo = (type: string) => {
    return requestTypes.find(t => t.value === type) || requestTypes[5]
  }

  const getUrgencyInfo = (urgency: string) => {
    return urgencyLevels.find(u => u.value === urgency) || urgencyLevels[1]
  }

  const getStatusInfo = (status: string) => {
    return statusConfig.find(s => s.value === status) || statusConfig[0]
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeSince = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffDays > 0) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
    if (diffHours > 0) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
    return 'Récemment'
  }

  if (isLoading) {
    return <LoadingSpinner size="md" text="Chargement des demandes..." />
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-purple-600" />
            Gestion des demandes d&apos;aide
          </h1>
          <p className="text-gray-500 mt-1">Gérez et suivez les demandes d&apos;assistance des membres</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' :
          message.type === 'error' ? 'bg-red-50 text-red-700' :
          'bg-[#fffefa] text-[#5c4d00]'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
           message.type === 'error' ? <XCircle className="h-5 w-5" /> :
           <AlertCircle className="h-5 w-5" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#fff3cc] rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#cc9b00]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#cc9b00]">{stats.in_progress}</p>
              <p className="text-xs text-gray-500">En cours</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-500">Terminées</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.high_urgency}</p>
              <p className="text-xs text-gray-500">Urgentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tous les types</option>
              {requestTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-4 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tous les statuts</option>
              {statusConfig.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter by Urgency */}
          <div className="relative">
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="pl-4 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Toutes urgences</option>
              {urgencyLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune demande trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demandeur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigné à</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((request) => {
                  const typeInfo = getTypeInfo(request.type)
                  const urgencyInfo = getUrgencyInfo(request.urgency)
                  const statusInfo = getStatusInfo(request.status)
                  const TypeIcon = typeInfo.icon
                  const StatusIcon = statusInfo.icon

                  return (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${request.is_anonymous ? 'bg-gray-100' : 'bg-purple-100'}`}>
                            {request.is_anonymous ? (
                              <Shield className="h-4 w-4 text-gray-600" />
                            ) : (
                              <User className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.is_anonymous ? 'Anonyme' : request.requester_name}
                            </p>
                            {!request.is_anonymous && request.requester_email && (
                              <p className="text-xs text-gray-500">{request.requester_email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${typeInfo.color}`}>
                            <TypeIcon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">{typeInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 max-w-xs truncate">{request.title}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${urgencyInfo.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urgencyInfo.dotColor}`}></span>
                          {urgencyInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {request.assigned_to_name ? (
                          <span className="text-sm text-gray-700">{request.assigned_to_name}</span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-700">{getTimeSince(request.created_at)}</p>
                          <p className="text-xs text-gray-400">{formatDate(request.created_at)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => viewDetails(request)}
                            className="p-2 text-gray-400 hover:text-[#cc9b00] hover:bg-[#fffefa] rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openAssignModal(request)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Assigner"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openResponseModal(request)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Répondre"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Détails de la demande</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${getTypeInfo(selectedRequest.type).color}`}>
                    {React.createElement(getTypeInfo(selectedRequest.type).icon, { className: 'h-6 w-6 text-white' })}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedRequest.title}</h3>
                    <p className="text-sm text-gray-500">{getTypeInfo(selectedRequest.type).label}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyInfo(selectedRequest.urgency).color}`}>
                    {getUrgencyInfo(selectedRequest.urgency).label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedRequest.status).color}`}>
                    {getStatusInfo(selectedRequest.status).label}
                  </span>
                </div>
              </div>

              {/* Demandeur */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Demandeur
                </h4>
                {selectedRequest.is_anonymous ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span>Demande anonyme</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{selectedRequest.requester_name}</p>
                    {selectedRequest.requester_email && (
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {selectedRequest.requester_email}
                      </p>
                    )}
                    {selectedRequest.phone && (
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {selectedRequest.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-xl p-4">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Contact Preference */}
              {selectedRequest.contact_preference && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Préférence de contact</h4>
                  <p className="text-gray-600 capitalize">{selectedRequest.contact_preference}</p>
                </div>
              )}

              {/* Assigné à */}
              {selectedRequest.assigned_to_name && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Assigné à
                  </h4>
                  <p className="text-purple-900 font-medium">{selectedRequest.assigned_to_name}</p>
                </div>
              )}

              {/* Réponse */}
              {selectedRequest.response && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Réponse
                  </h4>
                  <p className="text-green-900 whitespace-pre-wrap">{selectedRequest.response}</p>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Créée le {formatDate(selectedRequest.created_at)}
                </span>
                {selectedRequest.resolved_at && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Résolue le {formatDate(selectedRequest.resolved_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  openAssignModal(selectedRequest)
                }}
                className="flex-1 px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Assigner
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  openResponseModal(selectedRequest)
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Répondre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Assigner la demande</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{selectedRequest.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedRequest.is_anonymous ? 'Demande anonyme' : selectedRequest.requester_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID du responsable à assigner
                </label>
                <input
                  type="text"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  placeholder="Entrez l'ID du responsable"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L&apos;ID peut être trouvé dans la gestion des membres
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssign}
                disabled={!assigneeId || isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Assigner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Répondre à la demande</h2>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{selectedRequest.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{selectedRequest.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau statut
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {statusConfig.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réponse / Notes
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  placeholder="Entrez votre réponse ou notes concernant cette demande..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowResponseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleResponse}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HelpRequestsManagement

