'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { 
  Loader2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Play, 
  Phone, 
  Mail, 
  ChevronRight,
  Home,
  Video,
  Heart
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  startTime: string
  endTime: string
  eventType: string
  location: string
  status: string
  maxAttendees: number
  currentAttendees: number
  isLive: boolean
  liveUrl: string
  showOnHomepage?: boolean
  eventImageUrl?: string
  creator?: {
    firstName: string
    lastName: string
    role: string
  }
  pastor?: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
  }
}



export default function HomePageSimple() {
  const [nextService, setNextService] = useState<Event | null>(null)
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchUpcomingEvents()
    fetchPastEvents()
  }, [])

  const fetchUpcomingEvents = async () => {
    try {
      const response = await authenticatedFetch('/api/events?upcoming=true&homepage=true')
      
      const data = await response.json()
      
      if (data.success) {
        const events = data.events
        
        // Le prochain culte (premier événement programmé)
        const nextServiceEvent = events.find((event: Event) => 
          event.eventType === 'WORSHIP_SERVICE' && 
          new Date(event.eventDate) >= new Date()
        ) || events[0]
        
        setNextService(nextServiceEvent)
        setRecentEvents(events.slice(0, 3))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPastEvents = async () => {
    try {
      const response = await authenticatedFetch('/api/events?past=true&homepage=true')
      
      const data = await response.json()
      
      if (data.success) {
        // Limiter à 3 événements passés les plus récents
        setPastEvents(data.events.slice(0, 3))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements passés:', error)
    }
  }



  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const time = new Date(timeString)
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'WORSHIP_SERVICE': 'Culte',
      'PRAYER_MEETING': 'Réunion de prière',
      'BIBLE_STUDY': 'Étude biblique',
      'YOUTH_MEETING': 'Réunion jeunes',
      'WOMEN_MEETING': 'Réunion femmes',
      'MEN_MEETING': 'Réunion hommes',
      'SPECIAL_EVENT': 'Événement spécial'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue au VHD</h1>
          <p className="text-gray-600 mt-2">Chargement des événements...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Home className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Bienvenue au VHD
            </h1>
            <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto">
              {user ? `Bonjour ${user.firstName} ! ` : ''}Nous sommes des ministères par lesquels Dieu convertit le POTENTIEL en l&apos;EXTRAORDINAIRE.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 pb-24 -mt-6">
        {/* Prochain Culte - Carte principale */}
        {nextService && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border-l-4 border-indigo-500">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Prochain Culte</h2>
                    <p className="text-sm text-gray-500">Ne manquez pas notre prochaine célébration</p>
                  </div>
                </div>
                {nextService.status === 'IN_PROGRESS' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium">EN DIRECT</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-indigo-900 mb-4">{nextService.title}</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{formatDate(nextService.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span>{formatTime(nextService.startTime)}{nextService.endTime && ` - ${formatTime(nextService.endTime)}`}</span>
                  </div>
                  {nextService.location && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span>{nextService.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span>{nextService.currentAttendees} participants{nextService.maxAttendees && ` / ${nextService.maxAttendees} max`}</span>
                  </div>
                </div>

                <div>
                  {nextService.status === 'IN_PROGRESS' && nextService.liveUrl && (
                    <a 
                      href={nextService.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
                    >
                      <Play className="h-5 w-5" />
                      Regarder en Direct
                    </a>
                  )}
                  {nextService.description && (
                    <p className="text-gray-600 mt-4 text-sm leading-relaxed">{nextService.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Événements récents */}
        {recentEvents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-indigo-600" />
              Événements à venir
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentEvents.filter(event => event.id !== nextService?.id).map((event) => (
                <div 
                  key={`event-${event.id}`} 
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {getEventTypeLabel(event.eventType)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  
                  <div className="space-y-1.5 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(event.startTime)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pas d'événements */}
        {!nextService && recentEvents.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun événement programmé</h2>
            <p className="text-gray-600">Les prochains événements seront bientôt annoncés.</p>
          </div>
        )}

        {/* Section informations générales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Contact */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-indigo-600" />
              Nous Contacter
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">24, avenue, Commune de Mont Ngafula, Kinshasa, RD Congo</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <a href="tel:+243895360658" className="text-indigo-600 hover:underline">+243 895 360 658</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <a href="mailto:contact@vaillantshommesdedavid.org" className="text-indigo-600 hover:underline text-xs">contact@vaillantshommesdedavid.org</a>
              </div>
            </div>
          </div>

          {/* Cultes précédents */}
          {pastEvents.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-indigo-600" />
                Cultes Récents
              </h2>
              <div className="space-y-3">
                {pastEvents.slice(0, 3).map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">
                      🏛️
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.eventDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Horaires */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Horaires Habituels
            </h2>
            <div className="space-y-3 text-sm">
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Culte Financièrement Prospère</p>
                <p className="text-gray-500">Mardi 17h00 - 19h30</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Culte Métamorphose</p>
                <p className="text-gray-500">Jeudi 17h00 - 19h30</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Libère ton Potentiel</p>
                <p className="text-gray-500">Dimanche 17h00 - 19h30</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
