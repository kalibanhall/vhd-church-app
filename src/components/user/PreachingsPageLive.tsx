/**
 * Page Prédications avec Streaming Vidéo en Direct
 * Supporte: Vidéos enregistrées, Audio, Streaming LIVE (WebRTC/HLS)
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Download, 
  Volume2, 
  X, 
  Maximize, 
  Minimize, 
  Video, 
  Radio,
  FileText,
  Search,
  Filter
} from 'lucide-react'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface Sermon {
  id: string
  title: string
  description?: string
  pastor_name?: string
  sermon_date: string
  duration?: number
  media_type: 'VIDEO' | 'AUDIO' | 'LIVE' | 'TEXT'
  media_url?: string
  thumbnail_url?: string
  view_count?: number
  is_published: boolean
  bible_verses?: string
  event?: {
    id: string
    title: string
    is_live: boolean
    stream_url?: string
  }
}

export default function PreachingsPageLive() {
  // États
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [playingSermon, setPlayingSermon] = useState<Sermon | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Référence pour le lecteur vidéo
  const videoRef = useRef<HTMLVideoElement>(null)

  // Charger les prédications
  useEffect(() => {
    fetchSermons()
  }, [])

  // Filtrer les prédications
  useEffect(() => {
    let filtered = sermons

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(s => s.media_type === selectedType)
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.pastor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSermons(filtered)
  }, [sermons, selectedType, searchTerm])

  const fetchSermons = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await authenticatedFetch('/api/sermons-proxy')

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.sermons) {
        setSermons(data.sermons)
      } else {
        setSermons([])
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement prédications:', err)
      setError(err.message)
      setSermons([])
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (sermon: Sermon) => {
    setPlayingSermon(sermon)
    setIsFullscreen(false)
  }

  const handleClose = () => {
    setPlayingSermon(null)
    setIsFullscreen(false)
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-5 w-5" />
      case 'AUDIO': return <Volume2 className="h-5 w-5" />
      case 'LIVE': return <Radio className="h-5 w-5 animate-pulse text-red-500" />
      case 'TEXT': return <FileText className="h-5 w-5" />
      default: return <Video className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Chargement des prédications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Erreur</p>
          <p>{error}</p>
          <button 
            onClick={fetchSermons}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prédications</h1>
          <p className="text-gray-600 mt-1">
            {sermons.length} prédication{sermons.length > 1 ? 's' : ''} disponible{sermons.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, pasteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par type */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="LIVE">🔴 En direct</option>
              <option value="VIDEO">🎥 Vidéos</option>
              <option value="AUDIO">🎵 Audio</option>
              <option value="TEXT">📄 Texte</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prédications en LIVE (priorité) */}
      {filteredSermons.filter(s => s.media_type === 'LIVE' && s.event?.is_live).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <Radio className="h-6 w-6 animate-pulse" />
            En Direct Maintenant
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {filteredSermons
              .filter(s => s.media_type === 'LIVE' && s.event?.is_live)
              .map(sermon => (
                <SermonCard 
                  key={sermon.id} 
                  sermon={sermon} 
                  onPlay={handlePlay}
                  isLive
                />
              ))}
          </div>
        </div>
      )}

      {/* Autres prédications */}
      {filteredSermons.filter(s => s.media_type !== 'LIVE' || !s.event?.is_live).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons
            .filter(s => s.media_type !== 'LIVE' || !s.event?.is_live)
            .map(sermon => (
              <SermonCard 
                key={sermon.id} 
                sermon={sermon} 
                onPlay={handlePlay}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Video className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucune prédication disponible</p>
        </div>
      )}

      {/* Lecteur vidéo/audio modal */}
      {playingSermon && (
        <MediaPlayer
          sermon={playingSermon}
          onClose={handleClose}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          videoRef={videoRef}
        />
      )}
    </div>
  )
}

// Composant carte de prédication
interface SermonCardProps {
  sermon: Sermon
  onPlay: (sermon: Sermon) => void
  isLive?: boolean
}

function SermonCard({ sermon, onPlay, isLive }: SermonCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${isLive ? 'border-2 border-red-500' : ''}`}>
      {/* Miniature */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {sermon.thumbnail_url ? (
          <img 
            src={sermon.thumbnail_url} 
            alt={sermon.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Video className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Badge LIVE */}
        {isLive && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Radio className="h-4 w-4 animate-pulse" />
            EN DIRECT
          </div>
        )}

        {/* Badge type */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded flex items-center gap-1">
          {sermon.media_type === 'VIDEO' && <Video className="h-4 w-4" />}
          {sermon.media_type === 'AUDIO' && <Volume2 className="h-4 w-4" />}
          {sermon.media_type === 'TEXT' && <FileText className="h-4 w-4" />}
          <span className="text-xs">{sermon.media_type}</span>
        </div>

        {/* Bouton play */}
        {(sermon.media_url || sermon.event?.stream_url) && (
          <button
            onClick={() => onPlay(sermon)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all group"
          >
            <div className="bg-white rounded-full p-4 transform scale-100 group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-blue-600 fill-current" />
            </div>
          </button>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
          {sermon.title}
        </h3>

        {sermon.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {sermon.description}
          </p>
        )}

        {/* Métadonnées */}
        <div className="space-y-2 text-sm text-gray-500">
          {sermon.pastor_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{sermon.pastor_name}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(sermon.sermon_date).toLocaleDateString('fr-FR')}</span>
          </div>

          {sermon.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(sermon.duration / 60)}h {sermon.duration % 60}min</span>
            </div>
          )}

          {sermon.view_count !== undefined && (
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{sermon.view_count} vue{sermon.view_count > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Versets bibliques */}
        {sermon.bible_verses && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-blue-600 font-medium">
              📖 {sermon.bible_verses}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant lecteur média
interface MediaPlayerProps {
  sermon: Sermon
  onClose: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  videoRef: React.RefObject<HTMLVideoElement>
}

function MediaPlayer({ sermon, onClose, isFullscreen, onToggleFullscreen, videoRef }: MediaPlayerProps) {
  const mediaUrl = sermon.event?.stream_url || sermon.media_url
  const isLive = sermon.media_type === 'LIVE' && sermon.event?.is_live

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg overflow-hidden ${isFullscreen ? 'w-full h-full' : 'max-w-5xl w-full'}`}>
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="font-bold text-lg">{sermon.title}</h2>
            {isLive && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                <Radio className="h-3 w-3 animate-pulse" />
                EN DIRECT
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded"
              title="Plein écran"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Lecteur */}
        <div className="bg-black">
          {sermon.media_type === 'VIDEO' || sermon.media_type === 'LIVE' ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              controls
              autoPlay
              className="w-full"
              style={{ maxHeight: isFullscreen ? '100vh' : '70vh' }}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          ) : sermon.media_type === 'AUDIO' ? (
            <div className="flex items-center justify-center p-12">
              <audio
                src={mediaUrl}
                controls
                autoPlay
                className="w-full max-w-2xl"
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          ) : (
            <div className="p-8 text-white">
              <p className="text-center">Format non supporté</p>
            </div>
          )}
        </div>

        {/* Informations */}
        {!isFullscreen && (
          <div className="p-4 space-y-3">
            {sermon.description && (
              <p className="text-gray-700">{sermon.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {sermon.pastor_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{sermon.pastor_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(sermon.sermon_date).toLocaleDateString('fr-FR')}</span>
              </div>
              {sermon.view_count !== undefined && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{sermon.view_count} vues</span>
                </div>
              )}
            </div>

            {sermon.bible_verses && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-blue-600 font-medium">
                  📖 {sermon.bible_verses}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
