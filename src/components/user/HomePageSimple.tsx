'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

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
      const response = await fetch('/api/events?upcoming=true&homepage=true', {
        credentials: 'include' // Utiliser les cookies au lieu du token
      })
      
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
      const response = await fetch('/api/events?past=true&homepage=true', {
        credentials: 'include'
      })
      
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '24px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
            <div style={{ 
              animation: 'spin 1s linear infinite', 
              borderRadius: '50%', 
              height: '48px', 
              width: '48px', 
              border: '2px solid #e5e7eb',
              borderBottomColor: '#4f46e5',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)' }}>
      {/* En-tête de bienvenue */}
      <div style={{ background: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              Bienvenue au VHD
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
              {user ? `Bonjour ${user.firstName} ! Nous sommes des ministeres par lesquels Dieu convertit le POTENTIEL en l'EXTRAORDINAIRE.` : 'Nous sommes des ministeres par lesquels Dieu convertit le POTENTIEL en l\'EXTRAORDINAIRE.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Prochain Culte - Section principale */}
        {nextService && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
            padding: '32px', 
            borderLeft: '4px solid #4f46e5' 
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                  📅 Prochain Culte
                </h2>
                <p style={{ color: '#6b7280' }}>Ne manquez pas notre prochaine célébration !</p>
              </div>
              {nextService.status === 'IN_PROGRESS' && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: '#fef2f2', 
                  color: '#991b1b', 
                  padding: '8px 16px', 
                  borderRadius: '9999px' 
                }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    background: '#ef4444', 
                    borderRadius: '50%', 
                    marginRight: '8px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <span style={{ fontWeight: '500' }}>🔴 EN DIRECT</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#312e81' }}>
                  {nextService.title}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#374151' }}>
                    <span style={{ marginRight: '12px' }}>🗓️</span>
                    <span style={{ fontWeight: '500' }}>{formatDate(nextService.eventDate)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', color: '#374151' }}>
                    <span style={{ marginRight: '12px' }}>⏰</span>
                    <span>{formatTime(nextService.startTime)}</span>
                    {nextService.endTime && (
                      <span> - {formatTime(nextService.endTime)}</span>
                    )}
                  </div>
                  
                  {nextService.location && (
                    <div style={{ display: 'flex', alignItems: 'center', color: '#374151' }}>
                      <span style={{ marginRight: '12px' }}>📍</span>
                      <span>{nextService.location}</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', color: '#374151' }}>
                    <span style={{ marginRight: '12px' }}>👥</span>
                    <span>{nextService.currentAttendees} participants</span>
                    {nextService.maxAttendees && (
                      <span> / {nextService.maxAttendees} max</span>
                    )}
                  </div>
                </div>

                {nextService.description && (
                  <p style={{ color: '#6b7280', lineHeight: '1.6', marginTop: '16px' }}>
                    {nextService.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {nextService.status === 'IN_PROGRESS' && nextService.liveUrl && (
                  <div style={{ 
                    background: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '12px', 
                    padding: '24px' 
                  }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#7f1d1d', marginBottom: '12px' }}>
                      🔴 Streaming en Direct
                    </h4>
                    <p style={{ color: '#b91c1c', marginBottom: '16px' }}>
                      Le culte est en cours ! Rejoignez-nous en ligne.
                    </p>
                    <a 
                      href={nextService.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        background: '#dc2626', 
                        color: 'white', 
                        padding: '12px 24px', 
                        borderRadius: '8px', 
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    >
                      📺 Regarder en Direct
                    </a>
                  </div>
                )}

                {/* Image de couverture */}
                {nextService.eventImageUrl && (
                  <div style={{ 
                    width: '100%',
                    height: '200px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <img 
                      src={nextService.eventImageUrl} 
                      alt={`Image de couverture - ${nextService.title}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </div>
                )}

                {nextService.status === 'SCHEDULED' && (
                  <div style={{ 
                    background: '#eef2ff', 
                    border: '1px solid #c7d2fe', 
                    borderRadius: '12px', 
                    padding: '24px' 
                  }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#312e81', marginBottom: '12px' }}>
                      📋 Informations pratiques
                    </h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#3730a3' }}>
                      <li>• Arrivez 10 minutes avant le début</li>
                      <li>• Parking disponible sur place</li>
                      <li>• Garderie pour les enfants</li>
                      <li>• Café d'accueil après le culte</li>
                    </ul>
                  </div>
                )}

                <div style={{ 
                  background: '#f9fafb', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '24px' 
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    👤 Animé par
                  </h4>
                  <p style={{ color: '#374151' }}>
                    {nextService.creator?.firstName || 'Non défini'} {nextService.creator?.lastName || ''}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                    {nextService.creator?.role?.toLowerCase() || 'animateur'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Événements récents */}
        {recentEvents.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
              📅 Événements Récents
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Événements récents (excluant le prochain culte déjà affiché) */}
              {recentEvents.filter(event => event.id !== nextService?.id).map((event) => (
                <div key={`event-${event.id}`} style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  background: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: '600', 
                      color: '#4f46e5', 
                      background: '#eef2ff', 
                      padding: '4px 10px', 
                      borderRadius: '12px' 
                    }}>
                      {getEventTypeLabel(event.eventType)}
                    </span>
                    <span style={{ fontSize: '1.2rem' }}>📅</span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', marginBottom: '8px', lineHeight: '1.4' }}>
                    {event.title}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '6px' }}>📅</span>
                      <span>{formatDate(event.eventDate)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '6px' }}>⏰</span>
                      <span>{formatTime(event.startTime)}</span>
                    </div>
                    {event.location && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '6px' }}>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.85rem', 
                      lineHeight: '1.4',
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden' 
                    }}>
                      {event.description}
                    </p>
                  )}
                </div>
              ))}


            </div>


          </div>
        )}

        {/* Pas d'événements */}
        {!nextService && recentEvents.length === 0 && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📅</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              Aucun événement programmé
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Les prochains événements seront bientôt annoncés.
            </p>
            {(user?.role === 'ADMIN' || user?.role === 'PASTOR') && (
              <p style={{ color: '#4f46e5' }}>
                Rendez-vous dans le tableau de bord pour planifier de nouveaux événements.
              </p>
            )}
          </div>
        )}

        {/* Section informations générales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
              📞 Nous Contacter
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px' }}>📍</span>
                <span>24, avenue, Commune de Mont Ngafula, Kinshasa, RD Congo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px' }}>📞</span>
                <span>0895 360 658</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px' }}>📧</span>
                <span>contact@vaillantshommesdedavid.org</span>
              </div>
            </div>
          </div>

          {/* Cultes précédents en miniature */}
          {pastEvents.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
                📅 Cultes Récents
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pastEvents.map((event) => (
                  <div 
                    key={event.id}
                    style={{ 
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      background: '#f9fafb',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      {/* Image de couverture ou placeholder */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        flexShrink: 0
                      }}>
                        🏛️
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: '#111827',
                          marginBottom: '4px',
                          lineHeight: '1.2'
                        }}>
                          {event.title}
                        </h3>
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          marginBottom: '6px'
                        }}>
                          {formatDate(event.eventDate)} • {event.startTime}
                        </p>
                        {event.pastor && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            fontSize: '0.75rem',
                            color: '#4f46e5'
                          }}>
                            <span>👨‍💼</span>
                            <span>{event.pastor.firstName} {event.pastor.lastName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
              ⏰ Horaires Habituels
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontWeight: '500' }}>Culte Financièrement Prospère</p>
                <p style={{ color: '#6b7280' }}>Mardi 17h00 - 19h30</p>
              </div>
              <div>
                <p style={{ fontWeight: '500' }}>Culte Métamorphose</p>
                <p style={{ color: '#6b7280' }}>Jeudi 17h00 - 19h30</p>
              </div>
              <div>
                <p style={{ fontWeight: '500' }}>Libère ton Potentiel</p>
                <p style={{ color: '#6b7280' }}>Dimanche 17h00 - 19h30</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
