/**
 * =============================================================================
 * PAGE ACTIVITÉS - ÉVÉNEMENTS ET CALENDRIER DE L'ÉGLISE
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Page permettant aux membres de voir les activités/événements
 * de l'église avec un calendrier interactif et inscription aux événements.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  CalendarDays,
  Church,
  BookOpen,
  Music,
  Heart,
  PartyPopper,
  Info,
  UserPlus,
  Bell
} from 'lucide-react'

// Types
interface Event {
  id: string
  title: string
  description?: string
  eventDate: string
  startTime: string
  endTime?: string
  location?: string
  eventType: string
  maxParticipants?: number
  currentParticipants?: number
  isRegistrationOpen?: boolean
  imageUrl?: string
  createdAt: string
}

interface EventRegistration {
  id: string
  eventId: string
  userId: string
  status: 'REGISTERED' | 'CANCELLED'
  createdAt: string
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

// Mapping des icônes par type d'événement
const eventIcons: Record<string, React.ReactNode> = {
  'WORSHIP': <Church className="h-5 w-5" />,
  'BIBLE_STUDY': <BookOpen className="h-5 w-5" />,
  'PRAYER': <Heart className="h-5 w-5" />,
  'YOUTH': <Users className="h-5 w-5" />,
  'CONCERT': <Music className="h-5 w-5" />,
  'SPECIAL': <PartyPopper className="h-5 w-5" />,
  'OTHER': <CalendarDays className="h-5 w-5" />
}

// Couleurs par type d'événement
const eventColors: Record<string, { bg: string, text: string, border: string }> = {
  'WORSHIP': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'BIBLE_STUDY': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'PRAYER': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'YOUTH': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'CONCERT': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'SPECIAL': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'OTHER': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
}

// Labels des types d'événements
const eventTypeLabels: Record<string, string> = {
  'WORSHIP': 'Culte',
  'BIBLE_STUDY': 'Étude biblique',
  'PRAYER': 'Réunion de prière',
  'YOUTH': 'Jeunesse',
  'CONCERT': 'Concert/Louange',
  'SPECIAL': 'Événement spécial',
  'OTHER': 'Autre'
}

const ActivitiesPage: React.FC = () => {
  // États
  const [events, setEvents] = useState<Event[]>([])
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [registering, setRegistering] = useState(false)
  
  // Filtres et vue
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [filterType, setFilterType] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Récupérer l'utilisateur
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

  // Charger les données
  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await authenticatedFetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || data || [])
      }
    } catch (error) {
      console.error('Erreur chargement événements:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des événements' })
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les événements
  const filteredEvents = events.filter(event => {
    if (filterType && event.eventType !== filterType) return false
    return true
  })

  // Événements à venir (triés par date)
  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())

  // Événements passés
  const pastEvents = filteredEvents
    .filter(event => new Date(event.eventDate) < new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())

  // Vérifier si inscrit à un événement
  const isRegisteredToEvent = (eventId: string) => {
    return myRegistrations.some(r => r.eventId === eventId && r.status === 'REGISTERED')
  }

  // Inscription à un événement
  const handleRegisterEvent = async (eventId: string) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Vous devez être connecté pour vous inscrire' })
      return
    }

    setRegistering(true)
    try {
      // Simulation d'inscription (à connecter au backend réel)
      const newRegistration: EventRegistration = {
        id: `reg_${Date.now()}`,
        eventId,
        userId: user.id,
        status: 'REGISTERED',
        createdAt: new Date().toISOString()
      }
      setMyRegistrations(prev => [...prev, newRegistration])
      setMessage({ type: 'success', text: '✅ Inscription confirmée !' })
      setShowEventModal(false)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'inscription' })
    } finally {
      setRegistering(false)
    }
  }

  // Annuler inscription
  const handleCancelRegistration = async (eventId: string) => {
    setMyRegistrations(prev => prev.filter(r => r.eventId !== eventId))
    setMessage({ type: 'info', text: 'Inscription annulée' })
  }

  // Formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  // Formater la date courte
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    })
  }

  // Calendrier - Obtenir les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Jours vides avant le premier jour
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Jours du mois
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  // Obtenir les événements d'un jour
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.eventDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // Navigation du calendrier
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">📅 Activités de l&apos;Église</h1>
        <p className="text-indigo-100">
          Découvrez et participez aux événements de notre communauté
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

      {/* Contrôles */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterType === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {Object.entries(eventTypeLabels).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Basculer vue */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            <CalendarDays className="h-4 w-4 inline mr-1" />
            Liste
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-1" />
            Calendrier
          </button>
        </div>
      </div>

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Événements à venir */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Événements à venir ({upcomingEvents.length})
            </h2>
            
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun événement à venir</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map(event => {
                  const colors = eventColors[event.eventType] || eventColors['OTHER']
                  const icon = eventIcons[event.eventType] || eventIcons['OTHER']
                  const isRegistered = isRegisteredToEvent(event.id)

                  return (
                    <div
                      key={event.id}
                      className={`bg-white rounded-xl shadow-sm border ${colors.border} overflow-hidden hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowEventModal(true)
                      }}
                    >
                      {/* Badge date */}
                      <div className={`${colors.bg} px-4 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className={colors.text}>{icon}</span>
                          <span className={`text-sm font-medium ${colors.text}`}>
                            {eventTypeLabels[event.eventType] || 'Événement'}
                          </span>
                        </div>
                        {isRegistered && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            Inscrit
                          </span>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatShortDate(event.eventDate)}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
                          </p>
                          {event.location && (
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Événements passés */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-500 mb-4">
                Événements passés ({pastEvents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {pastEvents.slice(0, 6).map(event => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                  >
                    <h3 className="font-medium text-gray-700 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {formatShortDate(event.eventDate)} à {event.startTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {/* Navigation mois */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded-lg" />
              }

              const dayEvents = getEventsForDay(day)
              const isToday = day.toDateString() === new Date().toDateString()

              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 p-1 rounded-lg border ${
                    isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map(event => {
                      const colors = eventColors[event.eventType] || eventColors['OTHER']
                      return (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${colors.bg} ${colors.text}`}
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventModal(true)
                          }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal détail événement */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`${eventColors[selectedEvent.eventType]?.bg || 'bg-gray-100'} p-6 rounded-t-2xl`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-white/50 ${eventColors[selectedEvent.eventType]?.text || 'text-gray-700'}`}>
                    {eventIcons[selectedEvent.eventType] || eventIcons['OTHER']}
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${eventColors[selectedEvent.eventType]?.text || 'text-gray-700'}`}>
                      {eventTypeLabels[selectedEvent.eventType] || 'Événement'}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Infos principales */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span>{formatDate(selectedEvent.eventDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span>{selectedEvent.startTime}{selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.maxParticipants && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span>{selectedEvent.currentParticipants || 0} / {selectedEvent.maxParticipants} participants</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              {/* Action */}
              <div className="pt-4 border-t border-gray-100">
                {isRegisteredToEvent(selectedEvent.id) ? (
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-medium flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Vous êtes inscrit
                    </span>
                    <button
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegisterEvent(selectedEvent.id)}
                    disabled={registering}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {registering ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        S&apos;inscrire à cet événement
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitiesPage
