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
  Video,
  BookOpen,
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
}

interface ChurchSettings {
  churchName: string
  churchAddress: string
  churchPhone: string
  churchEmail: string
  serviceSchedule: ServiceScheduleItem[]
}

interface ServiceScheduleItem {
  name: string
  day: string
  time: string
}

export default function HomePageSimple() {
  const [nextService, setNextService] = useState<Event | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [settings, setSettings] = useState<ChurchSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchUpcomingEvents(),
        fetchPastEvents(),
        fetchSettings()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingEvents = async () => {
    try {
      const response = await authenticatedFetch('/api/events?upcoming=true&homepage=true')
      const data = await response.json()
      
      if (data.success && data.events) {
        const events = data.events
        const nextServiceEvent = events.find((event: Event) => 
          event.eventType === 'WORSHIP_SERVICE' && 
          new Date(event.eventDate) >= new Date()
        ) || events[0]
        
        setNextService(nextServiceEvent || null)
        setUpcomingEvents(events.slice(0, 6))
      }
    } catch (error) {
      console.error('[HomePage] Error loading upcoming events:', error)
    }
  }

  const fetchPastEvents = async () => {
    try {
      const response = await authenticatedFetch('/api/events?past=true&homepage=true')
      const data = await response.json()
      
      if (data.success && data.events) {
        setPastEvents(data.events.slice(0, 3))
      }
    } catch (error) {
      console.error('[HomePage] Error loading past events:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await authenticatedFetch('/api/settings')
      const data = await response.json()
      
      if (data.success && data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('[HomePage] Error loading settings:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    const time = new Date(timeString)
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'WORSHIP_SERVICE': 'Culte',
      'PRAYER_MEETING': 'Priere',
      'BIBLE_STUDY': 'Etude biblique',
      'YOUTH_MEETING': 'Jeunes',
      'WOMEN_MEETING': 'Femmes',
      'MEN_MEETING': 'Hommes',
      'SPECIAL_EVENT': 'Evenement special'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffefa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Loader2 className="h-16 w-16 text-[#ffc200] animate-spin" />
          </div>
          <p className="text-[#999]">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffefa]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#ffc200] via-[#ffda66] to-[#fff3cc]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">
              {user ? `Bonjour, ${user.firstName}` : 'Bienvenue'}
            </h1>
            <p className="text-[#0a0a0a]/70 text-sm">
              {settings?.churchName || 'MyChurchApp'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 -mt-4">
        {/* Prochain culte */}
        {nextService && (
          <div className="bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)] overflow-hidden mb-6">
            <div className="p-4 border-b border-[rgba(201,201,201,0.3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fff3cc] rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#cc9b00]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#0a0a0a]">Prochain culte</h2>
                    <p className="text-xs text-[#999]">{formatDate(nextService.eventDate)}</p>
                  </div>
                </div>
                {nextService.status === 'IN_PROGRESS' && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    En direct
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-[#0a0a0a] mb-3">{nextService.title}</h3>
              
              <div className="space-y-2 text-sm text-[#666]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#999]" />
                  <span>{formatTime(nextService.startTime)}{nextService.endTime && ` - ${formatTime(nextService.endTime)}`}</span>
                </div>
                {nextService.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#999]" />
                    <span>{nextService.location}</span>
                  </div>
                )}
                {nextService.maxAttendees > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#999]" />
                    <span>{nextService.currentAttendees || 0} / {nextService.maxAttendees} participants</span>
                  </div>
                )}
              </div>

              {nextService.status === 'IN_PROGRESS' && nextService.liveUrl && (
                <a 
                  href={nextService.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#ffda66] hover:bg-[#ffc200] text-[#0a0a0a] rounded-lg font-medium transition-colors"
                >
                  <Play className="h-5 w-5" />
                  Regarder en direct
                </a>
              )}
            </div>
          </div>
        )}

        {/* Evenements a venir */}
        {upcomingEvents.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0a0a0a] flex items-center gap-2">
                <Video className="h-5 w-5 text-[#cc9b00]" />
                Evenements a venir
              </h2>
              <button className="text-sm text-[#cc9b00] hover:text-[#ffc200] flex items-center gap-1">
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {upcomingEvents
                .filter(event => event.id !== nextService?.id)
                .slice(0, 3)
                .map((event) => (
                <div 
                  key={event.id} 
                  className="bg-white rounded-lg p-4 shadow-church border border-[rgba(201,201,201,0.3)] hover:border-[#ffc200]/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#fff3cc] rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-[#cc9b00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[#cc9b00] bg-[#fff3cc] px-2 py-0.5 rounded">
                          {getEventTypeLabel(event.eventType)}
                        </span>
                      </div>
                      <h3 className="font-medium text-[#0a0a0a] text-sm truncate">{event.title}</h3>
                      <p className="text-xs text-[#999] mt-1">
                        {formatDate(event.eventDate)} - {formatTime(event.startTime)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#ccc] flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pas d'evenements */}
        {!nextService && upcomingEvents.length === 0 && (
          <div className="bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)] p-8 text-center mb-6">
            <div className="w-16 h-16 bg-[#fff3cc] rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-[#cc9b00]" />
            </div>
            <h2 className="font-semibold text-[#0a0a0a] mb-2">Aucun evenement programme</h2>
            <p className="text-sm text-[#999]">Les prochains evenements seront bientot annonces.</p>
          </div>
        )}

        {/* Grille d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Horaires */}
          {settings?.serviceSchedule && settings.serviceSchedule.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-church border border-[rgba(201,201,201,0.3)]">
              <h2 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#cc9b00]" />
                Horaires des cultes
              </h2>
              <div className="space-y-3">
                {settings.serviceSchedule.map((schedule, index) => (
                  <div key={index} className="p-3 bg-[#fffefa] rounded-lg border border-[rgba(201,201,201,0.2)]">
                    <p className="font-medium text-[#0a0a0a] text-sm">{schedule.name}</p>
                    <p className="text-xs text-[#999] mt-1">{schedule.day} - {schedule.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="bg-white rounded-xl p-4 shadow-church border border-[rgba(201,201,201,0.3)]">
            <h2 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#cc9b00]" />
              Contact
            </h2>
            <div className="space-y-3 text-sm">
              {settings?.churchAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#999] mt-0.5 flex-shrink-0" />
                  <span className="text-[#666]">{settings.churchAddress}</span>
                </div>
              )}
              {settings?.churchPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#999] flex-shrink-0" />
                  <a href={`tel:${settings.churchPhone}`} className="text-[#cc9b00] hover:text-[#ffc200]">
                    {settings.churchPhone}
                  </a>
                </div>
              )}
              {settings?.churchEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#999] flex-shrink-0" />
                  <a href={`mailto:${settings.churchEmail}`} className="text-[#cc9b00] hover:text-[#ffc200] text-xs truncate">
                    {settings.churchEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Cultes recents */}
          {pastEvents.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-church border border-[rgba(201,201,201,0.3)] md:col-span-2">
              <h2 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#cc9b00]" />
                Cultes recents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pastEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="p-3 bg-[#fffefa] rounded-lg border border-[rgba(201,201,201,0.2)] hover:border-[#ffc200]/50 transition-colors cursor-pointer"
                  >
                    <p className="font-medium text-[#0a0a0a] text-sm truncate">{event.title}</p>
                    <p className="text-xs text-[#999] mt-1">{formatDate(event.eventDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
