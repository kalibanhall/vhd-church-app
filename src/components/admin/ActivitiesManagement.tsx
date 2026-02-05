/**
 * =============================================================================
 * ADMIN - GESTION DES ACTIVITÉS
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Interface admin pour créer, modifier et gérer les activités
 * et événements de l'église.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Users,
  MapPin,
  Clock,
  X,
  Save,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Church,
  Music,
  Heart,
  Baby,
  Zap,
  BookOpen,
  MoreVertical
} from 'lucide-react'

// Types
interface Activity {
  id: string
  title: string
  description: string
  type: string
  location: string
  start_date: string
  end_date: string | null
  all_day: boolean
  max_participants: number | null
  current_participants: number
  image_url: string | null
  is_recurring: boolean
  recurrence_pattern: string | null
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  registration_required: boolean
  registration_deadline: string | null
  created_at: string
  registration_count?: number
}

interface Registration {
  id: string
  user_name: string
  user_email: string
  user_phone: string
  status: string
  registered_at: string
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

const activityTypes = [
  { value: 'event', label: 'Événement général', icon: Calendar, color: 'bg-[#ffc200]' },
  { value: 'worship', label: 'Culte', icon: Church, color: 'bg-purple-500' },
  { value: 'youth', label: 'Jeunesse', icon: Zap, color: 'bg-green-500' },
  { value: 'women', label: 'Femmes', icon: Heart, color: 'bg-pink-500' },
  { value: 'men', label: 'Hommes', icon: Users, color: 'bg-indigo-500' },
  { value: 'children', label: 'Enfants', icon: Baby, color: 'bg-amber-500' },
  { value: 'prayer', label: 'Prière', icon: Heart, color: 'bg-red-500' },
  { value: 'music', label: 'Louange/Musique', icon: Music, color: 'bg-violet-500' },
  { value: 'study', label: 'Étude biblique', icon: BookOpen, color: 'bg-teal-500' },
  { value: 'other', label: 'Autre', icon: MoreVertical, color: 'bg-gray-500' }
]

const ActivitiesManagement: React.FC = () => {
  // États
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showRegistrations, setShowRegistrations] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'event',
    location: '',
    start_date: '',
    end_date: '',
    all_day: false,
    max_participants: '',
    image_url: '',
    is_recurring: false,
    recurrence_pattern: '',
    registration_required: false,
    registration_deadline: ''
  })

  // Charger les activités
  useEffect(() => {
    loadActivities()
  }, [])

  // Filtrer les activités
  useEffect(() => {
    let filtered = activities

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query)
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus)
    }

    setFilteredActivities(filtered)
  }, [activities, searchQuery, filterType, filterStatus])

  const loadActivities = async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch('/api/activities-proxy')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.data || [])
      }
    } catch (error) {
      console.error('Error loading activities:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des activités' })
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setSelectedActivity(null)
    setFormData({
      title: '',
      description: '',
      type: 'event',
      location: '',
      start_date: '',
      end_date: '',
      all_day: false,
      max_participants: '',
      image_url: '',
      is_recurring: false,
      recurrence_pattern: '',
      registration_required: false,
      registration_deadline: ''
    })
    setShowModal(true)
  }

  const openEditModal = (activity: Activity) => {
    setSelectedActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description || '',
      type: activity.type,
      location: activity.location || '',
      start_date: activity.start_date ? new Date(activity.start_date).toISOString().slice(0, 16) : '',
      end_date: activity.end_date ? new Date(activity.end_date).toISOString().slice(0, 16) : '',
      all_day: activity.all_day,
      max_participants: activity.max_participants?.toString() || '',
      image_url: activity.image_url || '',
      is_recurring: activity.is_recurring,
      recurrence_pattern: activity.recurrence_pattern || '',
      registration_required: activity.registration_required,
      registration_deadline: activity.registration_deadline ? new Date(activity.registration_deadline).toISOString().slice(0, 16) : ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.start_date) {
      setMessage({ type: 'error', text: 'Le titre et la date de début sont requis' })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        end_date: formData.end_date || null,
        registration_deadline: formData.registration_deadline || null
      }

      const url = selectedActivity 
        ? `/api/activities-proxy?id=${selectedActivity.id}` 
        : '/api/activities-proxy'
      
      const response = await authenticatedFetch(url, {
        method: selectedActivity ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: selectedActivity ? 'Activité modifiée avec succès' : 'Activité créée avec succès' 
        })
        setShowModal(false)
        loadActivities()
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

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette activité ?')) return

    try {
      const response = await authenticatedFetch(`/api/activities-proxy?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Activité supprimée' })
        loadActivities()
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const viewRegistrations = async (activity: Activity) => {
    setSelectedActivity(activity)
    try {
      const response = await authenticatedFetch(`/api/activities-proxy?id=${activity.id}&registrations=true`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.data || [])
      }
    } catch (error) {
      console.error('Error loading registrations:', error)
    }
    setShowRegistrations(true)
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await authenticatedFetch(`/api/activities-proxy?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Statut mis à jour' })
        loadActivities()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    }
  }

  const getTypeInfo = (type: string) => {
    return activityTypes.find(t => t.value === type) || activityTypes[9]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2 py-1 bg-[#fff3cc] text-[#5c4d00] rounded-full text-xs">À venir</span>
      case 'ongoing':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">En cours</span>
      case 'completed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Terminé</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Annulé</span>
      default:
        return null
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Stats
  const stats = {
    total: activities.length,
    upcoming: activities.filter(a => a.status === 'upcoming').length,
    ongoing: activities.filter(a => a.status === 'ongoing').length,
    completed: activities.filter(a => a.status === 'completed').length
  }

  if (isLoading) {
    return <LoadingSpinner size="md" text="Chargement des activités..." />
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Activités</h1>
          <p className="text-gray-500">Créez et gérez les événements de l&apos;église</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#ffc200] text-white rounded-lg hover:bg-[#cc9b00]"
        >
          <Plus className="h-5 w-5" />
          Nouvelle activité
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-[#fffefa] text-[#3d3200] border border-[#e6af00]'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-[#cc9b00]">{stats.upcoming}</div>
          <div className="text-sm text-gray-500">À venir</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.ongoing}</div>
          <div className="text-sm text-gray-500">En cours</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Terminés</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une activité..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
        >
          <option value="all">Tous les types</option>
          {activityTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
        >
          <option value="all">Tous les statuts</option>
          <option value="upcoming">À venir</option>
          <option value="ongoing">En cours</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      {/* Liste des activités */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité</h3>
          <p className="text-gray-500 mb-4">Créez votre première activité</p>
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffc200] text-white rounded-lg">
            <Plus className="h-4 w-4" />
            Créer une activité
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Activité</th>
                <th className="text-left p-4 font-medium text-gray-700 hidden md:table-cell">Date</th>
                <th className="text-left p-4 font-medium text-gray-700 hidden lg:table-cell">Lieu</th>
                <th className="text-center p-4 font-medium text-gray-700">Inscrits</th>
                <th className="text-center p-4 font-medium text-gray-700">Statut</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActivities.map(activity => {
                const typeInfo = getTypeInfo(activity.type)
                const TypeIcon = typeInfo.icon
                
                return (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeInfo.color} text-white`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{typeInfo.label}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {formatDate(activity.start_date)}
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {activity.location || '-'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => viewRegistrations(activity)}
                        className="inline-flex items-center gap-1 text-[#cc9b00] hover:underline"
                      >
                        <Users className="h-4 w-4" />
                        {activity.registration_count || activity.current_participants || 0}
                        {activity.max_participants && `/${activity.max_participants}`}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(activity.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(activity)}
                          className="p-2 text-gray-400 hover:text-[#cc9b00] hover:bg-[#fffefa] rounded-lg"
                          title="Modifier"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {activity.status === 'upcoming' && (
                          <button
                            onClick={() => updateStatus(activity.id, 'ongoing')}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Marquer en cours"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {activity.status === 'ongoing' && (
                          <button
                            onClick={() => updateStatus(activity.id, 'completed')}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Marquer terminé"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modal création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedActivity ? 'Modifier l\'activité' : 'Nouvelle activité'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  placeholder="Titre de l'activité"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                >
                  {activityTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] resize-none"
                  placeholder="Description de l'activité..."
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  />
                </div>
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  placeholder="Lieu de l'activité"
                />
              </div>

              {/* Participants max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre max de participants (optionnel)
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  placeholder="Laisser vide pour illimité"
                  min="0"
                />
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.all_day}
                    onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                    className="w-4 h-4 text-[#cc9b00] rounded"
                  />
                  <span className="text-sm text-gray-700">Journée entière</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.registration_required}
                    onChange={(e) => setFormData({ ...formData, registration_required: e.target.checked })}
                    className="w-4 h-4 text-[#cc9b00] rounded"
                  />
                  <span className="text-sm text-gray-700">Inscription requise</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                    className="w-4 h-4 text-[#cc9b00] rounded"
                  />
                  <span className="text-sm text-gray-700">Récurrent</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ffc200] text-white rounded-lg hover:bg-[#cc9b00] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {selectedActivity ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal inscriptions */}
      {showRegistrations && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Inscriptions</h2>
                  <p className="text-gray-500">{selectedActivity.title}</p>
                </div>
                <button onClick={() => setShowRegistrations(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune inscription pour cette activité
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map(reg => (
                    <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{reg.user_name}</p>
                        <p className="text-sm text-gray-500">{reg.user_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(reg.registered_at).toLocaleDateString('fr-FR')}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          reg.status === 'registered' ? 'bg-green-100 text-green-700' :
                          reg.status === 'attended' ? 'bg-[#fff3cc] text-[#5c4d00]' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {reg.status === 'registered' ? 'Inscrit' :
                           reg.status === 'attended' ? 'Présent' : reg.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitiesManagement


