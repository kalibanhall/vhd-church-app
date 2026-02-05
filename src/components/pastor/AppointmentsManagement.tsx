'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Check, X, MessageSquare, Plus, Minus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Appointment {
  id: string
  userId: string
  pastorId: string
  appointmentDate: string
  startTime: string
  endTime: string
  reason: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

interface Availability {
  id: string
  pastorId: string
  dayOfWeek: number // 0-6 (dimanche-samedi)
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface UnavailablePeriod {
  id: string
  pastorId: string
  startDate: string
  endDate: string
  reason: string
}

export default function AppointmentsManagement() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'availability'>('pending')

  // États pour les nouveaux créneaux de disponibilité
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true
  })

  // États pour les périodes d'indisponibilité
  const [newUnavailability, setNewUnavailability] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  })

  const daysOfWeek = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ]

  useEffect(() => {
    if (user && ['PASTOR', 'ADMIN'].includes(user.role)) {
      fetchAppointments()
      fetchAvailability()
      fetchUnavailablePeriods()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      const response = await authenticatedFetch('/api/pastor/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      } else if (response.status === 404) {
        console.log('Routes pastor non disponibles (fonctionnalité désactivée)')
        setAppointments([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      const response = await authenticatedFetch('/api/pastor/availability')
      if (response.ok) {
        const data = await response.json()
        setAvailability(data.availability || [])
      } else if (response.status === 404) {
        console.log('Routes pastor/availability non disponibles')
        setAvailability([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error)
      setAvailability([])
    }
  }

  const fetchUnavailability = async () => {
    try {
      const response = await authenticatedFetch('/api/pastor/unavailability')
      if (response.ok) {
        const data = await response.json()
        setUnavailability(data.unavailability || [])
      } else if (response.status === 404) {
        console.log('Routes pastor/unavailability non disponibles')
        setUnavailability([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des indisponibilités:', error)
      setUnavailability([])
    }
  }

  const fetchUnavailablePeriods = async () => {
    try {
      const response = await authenticatedFetch('/api/pastor/unavailability')
      if (response.ok) {
        const data = await response.json()
        setUnavailablePeriods(data.periods || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des indisponibilités:', error)
    }
  }

  const respondToAppointment = async (appointmentId: string, status: 'CONFIRMED' | 'CANCELLED', responseMessage?: string) => {
    try {
      const response = await authenticatedFetch('/api/pastor/appointments/respond', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId,
          status,
          responseMessage
        })
      })

      if (response.ok) {
        await fetchAppointments()
        alert(status === 'CONFIRMED' ? 'Rendez-vous confirmé !' : 'Rendez-vous annulé')
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la réponse')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la réponse au rendez-vous')
    }
  }

  const addAvailability = async () => {
    try {
      console.log('Tentative d\'ajout de créneau:', newAvailability)
      
      const response = await authenticatedFetch('/api/pastor/availability', {
        method: 'POST',
        body: JSON.stringify(newAvailability)
      })

      console.log('Réponse statut:', response.status)
      
      if (response.ok) {
        await fetchAvailability()
        setNewAvailability({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true
        })
        alert('Créneau de disponibilité ajouté !')
      } else {
        const errorData = await response.json()
        console.error('Erreur API:', errorData)
        alert(`Erreur ${response.status}: ${errorData.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'ajout du créneau')
    }
  }

  const addUnavailability = async () => {
    if (!newUnavailability.startDate || !newUnavailability.endDate || !newUnavailability.reason) {
      alert('Veuillez remplir tous les champs')
      return
    }

    try {
      const response = await authenticatedFetch('/api/pastor/unavailability', {
        method: 'POST',
        body: JSON.stringify(newUnavailability)
      })

      if (response.ok) {
        await fetchUnavailablePeriods()
        setNewUnavailability({
          startDate: '',
          endDate: '',
          reason: ''
        })
        alert('Période d\'indisponibilité ajoutée !')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'ajout de la période')
    }
  }

  const removeAvailability = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/pastor/availability/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAvailability()
        alert('Créneau supprimé !')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const removeUnavailability = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/pastor/unavailability/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchUnavailablePeriods()
        alert('Période supprimée !')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-[#fff3cc] text-[#3d3200]'
      default: return 'bg-gray-100 text-gray-800'
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

  const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING')
  const confirmedAppointments = appointments.filter(apt => apt.status === 'CONFIRMED')

  if (!user || !['PASTOR', 'ADMIN'].includes(user.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Accès refusé</h3>
          <p className="text-red-600">Cette page est réservée aux pasteurs et administrateurs.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner size="md" text="Chargement des rendez-vous..." />
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Rendez-vous</h1>
        <p className="text-gray-600">Gérez vos rendez-vous et vos disponibilités</p>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-[#ffc200] text-[#cc9b00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Demandes en attente ({pendingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'confirmed'
                  ? 'border-[#ffc200] text-[#cc9b00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rendez-vous confirmés ({confirmedAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'availability'
                  ? 'border-[#ffc200] text-[#cc9b00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes disponibilités
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande en attente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Toutes les demandes de rendez-vous ont été traitées.
              </p>
            </div>
          ) : (
            pendingAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.user.firstName} {appointment.user.lastName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(appointment.startTime).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Email: {appointment.user.email}
                      </div>
                      {appointment.user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">📞</span>
                          Tél: {appointment.user.phone}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Motif:</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => respondToAppointment(appointment.id, 'CONFIRMED')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirmer
                      </button>
                      <button
                        onClick={() => respondToAppointment(appointment.id, 'CANCELLED')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'confirmed' && (
        <div className="space-y-4">
          {confirmedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous confirmé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vos rendez-vous confirmés apparaîtront ici.
              </p>
            </div>
          ) : (
            confirmedAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.user.firstName} {appointment.user.lastName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(appointment.startTime).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Motif:</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="space-y-6">
          {/* Créneaux de disponibilité */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mes créneaux de disponibilité</h3>
            
            {/* Formulaire d'ajout de créneau */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Ajouter un créneau</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
                  <select
                    value={newAvailability.dayOfWeek}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                  <input
                    type="time"
                    value={newAvailability.startTime}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                  <input
                    type="time"
                    value={newAvailability.endTime}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addAvailability}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#ffc200] hover:bg-[#cc9b00]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des créneaux */}
            <div className="space-y-2">
              {availability.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900">
                      {daysOfWeek[slot.dayOfWeek]}
                    </span>
                    <span className="text-gray-600">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAvailability(slot.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Périodes d'indisponibilité */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Périodes d'indisponibilité</h3>
            
            {/* Formulaire d'ajout de période */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Ajouter une période d'indisponibilité</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    value={newUnavailability.startDate}
                    onChange={(e) => setNewUnavailability(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={newUnavailability.endDate}
                    onChange={(e) => setNewUnavailability(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                  <input
                    type="text"
                    value={newUnavailability.reason}
                    onChange={(e) => setNewUnavailability(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Congés, formation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addUnavailability}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des périodes */}
            <div className="space-y-2">
              {unavailablePeriods.map((period) => (
                <div key={period.id} className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      Du {new Date(period.startDate).toLocaleDateString('fr-FR')} au {new Date(period.endDate).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {period.reason}
                    </span>
                  </div>
                  <button
                    onClick={() => removeUnavailability(period.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}