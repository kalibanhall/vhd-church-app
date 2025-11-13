'use client'

import { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { Calendar, Clock, User, MessageSquare, Plus, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Appointment {
  id: string
  pastorId: string
  appointmentDate: string
  startTime: string
  endTime: string
  reason: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
  pastor: {
    firstName: string
    lastName: string
    email: string
  }
  responseMessage?: string
}

interface Pastor {
  id: string
  firstName: string
  lastName: string
  email: string
  displayName: string
  available: boolean
}

export default function MemberAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pastors, setPastors] = useState<Pastor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPastors, setLoadingPastors] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)

  const [newAppointment, setNewAppointment] = useState({
    pastorId: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    reason: ''
  })

  useEffect(() => {
    if (user) {
      fetchAppointments()
      fetchAvailablePastors()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments-proxy/member', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      } else {
        console.error('Erreur lors du chargement des rendez-vous')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailablePastors = async () => {
    try {
      setLoadingPastors(true)
      const response = await fetch('/api/pastors/available', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setPastors(data.pastors || [])
      } else {
        console.error('Erreur lors du chargement des pasteurs')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoadingPastors(false)
    }
  }

  const createAppointment = async () => {
    // Validation
    if (!newAppointment.pastorId) {
      alert('Veuillez sélectionner un pasteur')
      return
    }
    if (!newAppointment.appointmentDate) {
      alert('Veuillez sélectionner une date')
      return
    }
    if (!newAppointment.startTime || !newAppointment.endTime) {
      alert('Veuillez spécifier les heures de début et fin')
      return
    }
    if (!newAppointment.reason.trim()) {
      alert('Veuillez indiquer le motif du rendez-vous')
      return
    }

    try {
      const response = await fetch('/api/appointments-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAppointment)
      })

      if (response.ok) {
        await fetchAppointments()
        setShowNewAppointmentModal(false)
        setNewAppointment({
          pastorId: '',
          appointmentDate: '',
          startTime: '',
          endTime: '',
          reason: ''
        })
        alert('Demande de rendez-vous envoyée !')
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la création du rendez-vous')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création du rendez-vous')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'CONFIRMED': return 'Confirmé'
      case 'CANCELLED': return 'Annulé'
      case 'COMPLETED': return 'Terminé'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    if (activeFilter === 'all') return true
    return appointment.status.toLowerCase() === activeFilter.toLowerCase()
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Rendez-vous</h1>
              <p className="text-gray-600 mt-1">Gérez vos rendez-vous avec les pasteurs</p>
            </div>
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rendez-vous
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'pending', label: 'En attente' },
                { key: 'confirmed', label: 'Confirmés' },
                { key: 'cancelled', label: 'Annulés' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="p-6">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
              <p className="text-gray-600 mb-4">
                {activeFilter === 'all' 
                  ? 'Vous n\'avez aucun rendez-vous pour le moment.'
                  : `Vous n'avez aucun rendez-vous ${activeFilter === 'pending' ? 'en attente' : activeFilter === 'confirmed' ? 'confirmé' : 'annulé'}.`
                }
              </p>
              <button
                onClick={() => setShowNewAppointmentModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Demander un Rendez-vous
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(appointment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Détails du rendez-vous</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(appointment.appointmentDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.startTime} - {appointment.endTime}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Pasteur {appointment.pastor.firstName} {appointment.pastor.lastName}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Motif</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {appointment.reason}
                          </p>
                        </div>
                      </div>

                      {appointment.responseMessage && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Message du pasteur</span>
                          </div>
                          <p className="text-sm text-blue-800">{appointment.responseMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal nouveau rendez-vous */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nouveau Rendez-vous</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pasteur <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAppointment.pastorId}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, pastorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingPastors}
                >
                  <option value="">
                    {loadingPastors ? 'Chargement des pasteurs...' : 'Sélectionnez un pasteur'}
                  </option>
                  {pastors.map(pastor => (
                    <option key={pastor.id} value={pastor.id}>
                      {pastor.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newAppointment.appointmentDate}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]} // Pas de dates passées
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newAppointment.startTime}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newAppointment.endTime}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif du rendez-vous <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez brièvement le motif de votre demande (consultation spirituelle, prière, conseil, etc.)..."
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {newAppointment.reason.length}/500 caractères
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={createAppointment}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
