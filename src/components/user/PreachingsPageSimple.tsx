'use client'

import { useState, useEffect } from 'react'
import { Play, Calendar, Clock, User, Eye, Download, Volume2, X, Maximize, Minimize, Video } from 'lucide-react'

interface Preaching {
  id: string
  title: string
  pastorName: string
  preacher: string
  preachingDate: string
  sermonDate: string
  duration: string
  preachingType: 'AUDIO' | 'VIDEO' | 'LIVE' | 'TEXT'
  description: string
  bibleVerses: string
  audioUrl?: string
  videoUrl?: string
  event?: {
    id: string
    title: string
    eventType: string
    status: string
    isLive: boolean
    eventDate: string
    location: string
  }
  liveUrl?: string
  thumbnailUrl?: string
  isLive: boolean
  viewerCount?: number
  viewCount: number
  downloadCount: number
  isPublished: boolean
}

export default function PreachingsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [preachings, setPreachings] = useState<Preaching[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingVideo, setPlayingVideo] = useState<Preaching | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Charger les prédications depuis l'API
  useEffect(() => {
    fetchPreachings()
  }, [])

  const fetchPreachings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/sermons-proxy', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && Array.isArray(data.preachings)) {
        setPreachings(data.preachings)
      } else {
        console.warn('Format de données inattendu:', data)
        setPreachings([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prédications:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
      setPreachings([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour démarrer la lecture vidéo intégrée
  const handlePlayVideo = async (preaching: Preaching) => {
    // Compter la vue si ce n'est pas déjà fait
    await incrementViewCount(preaching.id)
    
    // Démarrer la lecture
    setPlayingVideo(preaching)
    setCurrentlyPlaying(preaching.id)
  }

  // Fonction pour basculer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Fonction pour fermer le lecteur vidéo
  const closeVideoPlayer = () => {
    setPlayingVideo(null)
    setCurrentlyPlaying(null)
    setIsFullscreen(false)
  }

  // Fonction pour incrémenter le compteur de vues
  const incrementViewCount = async (preachingId: string) => {
    try {
      const response = await fetch('/api/sermon-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          sermonId: preachingId,
          action: 'view'
        })
      })
      
      if (response.ok) {
        // Mettre à jour le compteur local
        setPreachings(prev => prev.map(p => 
          p.id === preachingId ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p
        ))
        console.log('📊 Vue enregistrée pour prédication:', preachingId)
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error)
    }
  }

  // Fonction pour gérer le téléchargement
  // Fonction pour tracker les téléchargements
  const trackDownload = async (preachingId: string) => {
    try {
      await fetch('/api/sermon-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          sermonId: preachingId,
          action: 'download'
        })
      })
      console.log('📥 Téléchargement enregistré pour prédication:', preachingId)
    } catch (error) {
      console.error('Erreur lors du tracking téléchargement:', error)
    }
  }

  const handleDownload = async (preaching: Preaching, type: 'video' | 'audio') => {
    try {
      const url = type === 'video' ? preaching.videoUrl : preaching.audioUrl
      if (!url) {
        alert(`Aucun fichier ${type === 'video' ? 'vidéo' : 'audio'} disponible`)
        return
      }

      // Tracker le téléchargement avant de commencer
      await trackDownload(preaching.id)

      // Créer un lien de téléchargement
      const link = document.createElement('a')
      link.href = url
      link.download = `${preaching.title}_${type === 'video' ? 'video' : 'audio'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Incrémenter le compteur local
      setPreachings(prev => prev.map(p => 
        p.id === preaching.id ? { ...p, downloadCount: (p.downloadCount || 0) + 1 } : p
      ))
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement')
    }
  }

  // Filtrer les prédications
  const filteredPreachings = preachings.filter(preaching => {
    const matchesSearch = preaching.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preaching.pastorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preaching.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'live' && preaching.isLive) ||
                           (selectedCategory === 'video' && preaching.preachingType === 'VIDEO') ||
                           (selectedCategory === 'audio' && preaching.preachingType === 'AUDIO') ||
                           (selectedCategory === 'events' && preaching.event) ||
                           (selectedCategory === 'testimonies')

    return matchesSearch && matchesCategory
  })

  const handlePlayPause = async (preachingId: string) => {
    const preaching = preachings.find(p => p.id === preachingId)
    if (!preaching) return

    if (currentlyPlaying === preachingId) {
      // Arrêter la lecture
      closeVideoPlayer()
    } else {
      // Démarrer la lecture
      if (preaching.preachingType === 'VIDEO' && preaching.videoUrl) {
        handlePlayVideo(preaching)
      } else if (preaching.preachingType === 'AUDIO' && preaching.audioUrl) {
        setCurrentlyPlaying(preachingId)
        await incrementViewCount(preachingId)
      }
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'Date non définie'
    }
    
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Erreur de formatage de date:', error)
      return 'Date invalide'
    }
  }

  const totalViews = preachings.reduce((sum, preaching) => sum + preaching.viewCount, 0)
  const totalDownloads = preachings.reduce((sum, preaching) => sum + preaching.downloadCount, 0)
  const livePreachings = preachings.filter(p => p.isLive)

  // État de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🎙️ Prédications de l'Église</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Chargement des prédications...</p>
        </div>
      </div>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🎙️ Prédications de l'Église</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPreachings}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎙️ Prédications de l'Église</h1>
        <p className="text-gray-600">Écoutez la Parole de Dieu prêchée avec passion et vérité</p>
      </div>

      {/* Alerte Live */}
      {livePreachings.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-lg font-semibold">Culte en Direct !</h3>
                <p className="text-red-100">Rejoignez-nous maintenant pour le culte en direct</p>
              </div>
            </div>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors">
              📻 Rejoindre le Live
            </button>
          </div>
        </div>
      )}

      {/* Catégories de contenu */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Prédications */}
        <div 
          onClick={() => setSelectedCategory('all')}
          className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedCategory === 'all' ? 'ring-2 ring-green-500 border-green-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Prédications</h3>
              <p className="text-sm text-gray-500">{preachings.filter(p => p.preachingType === 'VIDEO').length} disponibles</p>
            </div>
          </div>
        </div>

        {/* Événements */}
        <div 
          onClick={() => setSelectedCategory('events')}
          className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedCategory === 'events' ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Événements</h3>
              <p className="text-sm text-gray-500">{preachings.filter(p => p.event).length} à venir</p>
            </div>
          </div>
        </div>

        {/* Prières */}
        <div 
          onClick={() => setSelectedCategory('audio')}
          className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedCategory === 'audio' ? 'ring-2 ring-purple-500 border-purple-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Prières</h3>
              <p className="text-sm text-gray-500">En communion</p>
            </div>
          </div>
        </div>

        {/* Témoignages */}
        <div 
          onClick={() => setSelectedCategory('testimonies')}
          className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedCategory === 'testimonies' ? 'ring-2 ring-orange-500 border-orange-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Témoignages</h3>
              <p className="text-sm text-gray-500">Partagez votre foi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dernière prédication */}
      {preachings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Dernière prédication</h2>
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Miniature vidéo */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
                  {preachings[0].thumbnailUrl ? (
                    <img 
                      src={preachings[0].thumbnailUrl} 
                      alt={preachings[0].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  {/* Overlay de lecture */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-800 ml-1" />
                    </div>
                  </div>
                  
                  {/* Badge durée */}
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
                    {preachings[0].duration}
                  </div>
                  
                  {/* Badge type */}
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {preachings[0].preachingType === 'VIDEO' ? 'Vidéo' : 
                     preachings[0].preachingType === 'AUDIO' ? 'Audio' : 
                     preachings[0].preachingType === 'LIVE' ? 'Live' : 'Texte'}
                  </div>
                </div>
              </div>
              
              {/* Informations */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{preachings[0].title}</h3>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Par {preachings[0].pastorName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(preachings[0].sermonDate || preachings[0].preachingDate)}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {preachings[0].description}
                  </p>
                  
                  {preachings[0].bibleVerses && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg mb-4">
                      <p className="text-blue-800 font-medium text-sm">📖 {preachings[0].bibleVerses}</p>
                    </div>
                  )}
                </div>
                
                {/* Statistiques et actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{preachings[0].viewCount || 0} vues</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{preachings[0].downloadCount || 0} téléchargements</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {preachings[0].preachingType === 'LIVE' && preachings[0].isLive ? (
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Regarder le Live</span>
                      </button>
                    ) : (
                      <>
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                          onClick={() => handlePlayPause(preachings[0].id)}
                        >
                          <Play className="w-4 h-4" />
                          <span>Suivre</span>
                        </button>
                        {(preachings[0].audioUrl || preachings[0].videoUrl) && (
                          <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                            <Download className="w-4 h-4" />
                            <span>Télécharger</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une prédication, pasteur, ou sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              📚 Toutes
            </button>
            <button
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === 'live' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('live')}
            >
              🔴 Live
            </button>
            <button
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === 'video' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('video')}
            >
              🎥 Vidéos
            </button>
            <button
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === 'audio' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('audio')}
            >
              🎵 Audio
            </button>
          </div>
        </div>
      </div>

      {/* Lecteur vidéo pour la prédication sélectionnée */}
      {currentlyPlaying && (
        <>
          {(() => {
            const selectedPreaching = preachings.find(p => p.id === currentlyPlaying)
            if (!selectedPreaching) return null
            
            return (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedPreaching.title}</h3>
                      <p className="text-sm text-gray-600">Par {selectedPreaching.pastorName}</p>
                    </div>
                    <button
                      onClick={() => setCurrentlyPlaying(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {selectedPreaching.videoUrl && selectedPreaching.preachingType === 'VIDEO' ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        autoPlay
                        className="w-full h-full"
                        poster={selectedPreaching.thumbnailUrl}
                      >
                        <source src={selectedPreaching.videoUrl} type="video/mp4" />
                        Votre navigateur ne supporte pas la lecture vidéo.
                      </video>
                    </div>
                  ) : selectedPreaching.audioUrl && selectedPreaching.preachingType === 'AUDIO' ? (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Volume2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Prédication Audio</h4>
                          <p className="text-sm text-gray-600">Cliquez pour écouter</p>
                        </div>
                      </div>
                      <audio
                        controls
                        className="w-full"
                        autoPlay
                      >
                        <source src={selectedPreaching.audioUrl} type="audio/mpeg" />
                        Votre navigateur ne supporte pas la lecture audio.
                      </audio>
                    </div>
                  ) : selectedPreaching.liveUrl ? (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🔴</div>
                        <p className="text-gray-600 mb-4">Stream en direct</p>
                        <a
                          href={selectedPreaching.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
                        >
                          <span>🔴</span>
                          <span>Regarder en direct</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-4">📖</div>
                        <p>Contenu non disponible</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedPreaching.description && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedPreaching.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </>
      )}

      {/* Liste des prédications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPreachings.slice(1).map((preaching) => (
          <div key={preaching.id} className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all ${
            preaching.isLive ? 'border-red-200 shadow-red-50' : 'border-gray-200'
          } overflow-hidden group cursor-pointer`}>
            
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden">
              {preaching.thumbnailUrl ? (
                <img 
                  src={preaching.thumbnailUrl} 
                  alt={preaching.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center justify-center text-white">
                  <div className="text-4xl mb-3">
                    {preaching.preachingType === 'VIDEO' ? '🎥' : 
                     preaching.preachingType === 'AUDIO' ? '🎵' : 
                     preaching.preachingType === 'LIVE' ? '🔴' : '📖'}
                  </div>
                  <div className="text-center px-4">
                    <p className="text-lg font-semibold mb-1">{preaching.title}</p>
                    <p className="text-sm opacity-80">Par {preaching.pastorName}</p>
                  </div>
                  <Play className="w-12 h-12 text-white opacity-50 mt-4" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-300">
                  <Play className="w-5 h-5 text-gray-800 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              {/* Badge Live */}
              {preaching.isLive && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
              )}
              
              {/* Badge durée */}
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {preaching.duration}
              </div>
              
              {/* Badge type */}
              {!preaching.isLive && (
                <div className="absolute top-3 left-3 bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {preaching.preachingType === 'VIDEO' ? 'Vidéo' : 
                   preaching.preachingType === 'AUDIO' ? 'Audio' : 'Texte'}
                </div>
              )}
            </div>
            
            {/* Contenu de la carte */}
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                    {preaching.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Par {preaching.pastorName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(preaching.sermonDate || preaching.preachingDate)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {preaching.description}
                  </p>
                  
                  {preaching.bibleVerses && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded-r text-sm mb-3">
                      <p className="text-blue-800">📖 {preaching.bibleVerses}</p>
                    </div>
                  )}
                </div>
                
                {/* Informations de l'événement */}
                {preaching.event && (
                  <div className="bg-green-50 px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-700 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Culte: {preaching.event.title}</span>
                      {preaching.event.isLive && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          DIRECT
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Actions et statistiques */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{preaching.viewCount || 0}</span>
                    </div>
                    {!preaching.isLive && (
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{preaching.downloadCount || 0}</span>
                      </div>
                    )}
                    {preaching.isLive && preaching.viewerCount && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>{preaching.viewerCount} en ligne</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {preaching.isLive ? (
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center space-x-1"
                        onClick={() => handlePlayPause(preaching.id)}
                      >
                        <Play className="w-3 h-3" />
                        <span>Rejoindre</span>
                      </button>
                    ) : (
                      <>
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center space-x-1"
                          onClick={() => handlePlayPause(preaching.id)}
                        >
                          {currentlyPlaying === preaching.id ? (
                            <>
                              <div className="w-3 h-3 border border-white"></div>
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Suivre</span>
                            </>
                          )}
                        </button>
                        
                        {/* Menu déroulant pour téléchargements */}
                        {(preaching.audioUrl || preaching.videoUrl) && (
                          <div className="relative group">
                            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center space-x-1">
                              <Download className="w-3 h-3" />
                              <span>⌄</span>
                            </button>
                            
                            {/* Menu déroulant */}
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              {preaching.videoUrl && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownload(preaching, 'video')
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center space-x-2"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Vidéo</span>
                                </button>
                              )}
                              {preaching.audioUrl && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownload(preaching, 'audio')
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg flex items-center space-x-2"
                                >
                                  <Volume2 className="w-3 h-3" />
                                  <span>Audio</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPreachings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">📖</div>
          {preachings.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune prédication disponible</h3>
              <p className="text-gray-600">Les prédications apparaîtront ici une fois publiées.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune prédication trouvée</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche ou de filtrage.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </>
          )}
        </div>
      )}

      {/* Lecteur vidéo intégré */}
      {playingVideo && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 ${
            isFullscreen ? 'bg-black' : ''
          }`}
        >
          <div className={`relative w-full ${isFullscreen ? 'h-full' : 'max-w-4xl max-h-[80vh]'} bg-black rounded-lg overflow-hidden`}>
            {/* Barre de contrôles */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent z-10 p-4">
              <div className="flex justify-between items-center text-white">
                <div>
                  <h3 className="font-semibold text-lg">{playingVideo.title}</h3>
                  <p className="text-sm opacity-75">Par {playingVideo.pastorName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={closeVideoPlayer}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lecteur vidéo */}
            <video
              src={playingVideo.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              onPlay={() => console.log('Lecture démarrée')}
              onPause={() => console.log('Lecture en pause')}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>

            {/* Informations supplémentaires (si pas en plein écran) */}
            {!isFullscreen && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="text-white text-sm space-y-1">
                  {playingVideo.bibleVerses && (
                    <p className="opacity-75">📖 {playingVideo.bibleVerses}</p>
                  )}
                  <p className="opacity-75">
                    {formatDate(playingVideo.sermonDate || playingVideo.preachingDate)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
