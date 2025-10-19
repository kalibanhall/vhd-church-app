'use client'

import { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Download, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Heart,
  Volume2,
  Video,
  Radio,
  Users
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

interface Preaching {
  id: string
  title: string
  pastorName: string
  preachingDate: string
  duration: string
  preachingType: 'AUDIO' | 'VIDEO' | 'LIVE' | 'TEXT'
  description: string
  bibleVerses: string
  audioUrl?: string
  videoUrl?: string
  liveUrl?: string
  thumbnailUrl?: string
  isLive: boolean
  viewerCount?: number
  viewCount: number
  downloadCount: number
  isPublished: boolean
}

export default function PreachingsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [preachings, setPreachings] = useState<Preaching[]>([])

  // Charger les prédications
  useEffect(() => {
    setPreachings([
      {
        id: 'live-1',
        title: '🔴 CULTE EN DIRECT - Dimanche Matin',
        pastorName: 'Pasteur Jean Martin',
        preachingDate: '2025-09-25',
        duration: 'En cours',
        preachingType: 'LIVE',
        description: 'Rejoignez-nous pour notre culte dominical en direct ! Louange, prédication et prière communautaire.',
        bibleVerses: 'Psaume 100:4, Hébreux 10:25',
        liveUrl: 'https://youtube.com/live/example',
        thumbnailUrl: '/live/current.jpg',
        isLive: true,
        viewerCount: 127,
        viewCount: 856,
        downloadCount: 0,
        isPublished: true
      },
      {
        id: '1',
        title: 'La Foi qui Déplace les Montagnes',
        pastorName: 'Pasteur Jean Martin',
        preachingDate: '2025-09-22',
        duration: '45:30',
        preachingType: 'VIDEO',
        description: 'Un message puissant sur la foi et sa capacité à transformer nos vies. Découvrez comment votre foi peut vous aider à surmonter tous les obstacles.',
        bibleVerses: 'Matthieu 17:20, Marc 11:23',
        videoUrl: '/preachings/video1.mp4',
        thumbnailUrl: '/preachings/thumb1.jpg',
        isLive: false,
        viewCount: 234,
        downloadCount: 45,
        isPublished: true
      },
      {
        id: '2',
        title: 'L\'Amour de Dieu sans Limites',
        pastorName: 'Pasteur Marie Dubois',
        preachingDate: '2025-09-15',
        duration: '38:15',
        preachingType: 'AUDIO',
        description: 'Explorez la profondeur de l\'amour inconditionnel de Dieu pour chacun de nous. Un message d\'espoir et de réconfort pour tous.',
        bibleVerses: 'Jean 3:16, 1 Jean 4:7-8',
        audioUrl: '/preachings/audio2.mp3',
        isLive: false,
        viewCount: 189,
        downloadCount: 67,
        isPublished: true
      },
      {
        id: '3',
        title: 'Marcher dans la Lumière',
        pastorName: 'Pasteur Pierre Moreau',
        preachingDate: '2025-09-08',
        duration: '42:00',
        preachingType: 'VIDEO',
        description: 'Comment vivre une vie qui honore Dieu au quotidien. Des conseils pratiques pour marcher dans la vérité et la justice.',
        bibleVerses: '1 Jean 1:7, Éphésiens 5:8',
        videoUrl: '/preachings/video3.mp4',
        thumbnailUrl: '/preachings/thumb3.jpg',
        isLive: false,
        viewCount: 156,
        downloadCount: 32,
        isPublished: true
      }
    ])
  }, [])

  const filteredPreachings = preachings.filter(preaching => {
    const matchesSearch = preaching.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preaching.pastorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preaching.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'live' && preaching.preachingType === 'LIVE') ||
                           (selectedCategory === 'video' && preaching.preachingType === 'VIDEO') ||
                           (selectedCategory === 'audio' && preaching.preachingType === 'AUDIO')
    
    return matchesSearch && matchesCategory
  })

  const handlePlayPause = (preachingId: string) => {
    if (currentlyPlaying === preachingId) {
      setCurrentlyPlaying(null)
    } else {
      setCurrentlyPlaying(preachingId)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const totalViews = preachings.reduce((sum, preaching) => sum + preaching.viewCount, 0)
  const totalDownloads = preachings.reduce((sum, preaching) => sum + preaching.downloadCount, 0)
  const livePreachings = preachings.filter(p => p.isLive)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎙️ Prédications de l'Église</h1>
        <p className="text-gray-600">Écoutez la Parole de Dieu prêchée avec passion et vérité</p>
      </div>

      {/* Alerte Live */}
      {livePreachings.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-semibold">🔴 EN DIRECT MAINTENANT</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{livePreachings[0].title}</h3>
                  <p className="text-sm text-gray-600">{livePreachings[0].viewerCount} personnes connectées</p>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700">
                <Radio className="h-4 w-4 mr-2" />
                Rejoindre le Live
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total prédications</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{preachings.length}</div>
            <p className="text-xs text-muted-foreground">Messages disponibles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total vues</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Écoutes cumulées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
            <Download className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground">Fichiers téléchargés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live cette semaine</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{livePreachings.length}</div>
            <p className="text-xs text-muted-foreground">Cultes en direct</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher une prédication, pasteur, ou sujet..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
              >
                📚 Toutes
              </Button>
              <Button
                variant={selectedCategory === 'live' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('live')}
              >
                🔴 Live
              </Button>
              <Button
                variant={selectedCategory === 'video' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('video')}
              >
                🎥 Vidéos
              </Button>
              <Button
                variant={selectedCategory === 'audio' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('audio')}
              >
                🎵 Audio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des prédications */}
      <div className="grid gap-6">
        {filteredPreachings.map((preaching) => (
          <Card key={preaching.id} className={`overflow-hidden ${preaching.isLive ? 'border-red-200 shadow-red-100' : ''}`}>
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail pour les vidéos et live */}
              {(preaching.preachingType === 'VIDEO' || preaching.preachingType === 'LIVE') && (
                <div className={`md:w-64 h-48 md:h-auto ${preaching.isLive ? 'bg-red-100' : 'bg-gray-200'} relative flex items-center justify-center`}>
                  {preaching.isLive ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Radio className="h-12 w-12 text-red-500" />
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 text-sm font-medium">LIVE</span>
                      </div>
                    </div>
                  ) : (
                    <Video className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <Button
                      size="icon"
                      className={`rounded-full ${preaching.isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-black hover:bg-gray-100'}`}
                      onClick={() => handlePlayPause(preaching.id)}
                    >
                      {preaching.isLive ? (
                        <Radio className="h-6 w-6 text-white" />
                      ) : currentlyPlaying === preaching.id ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex-1">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{preaching.title}</CardTitle>
                        <Badge variant={
                          preaching.preachingType === 'LIVE' ? 'destructive' :
                          preaching.preachingType === 'VIDEO' ? 'default' : 'secondary'
                        }>
                          {preaching.preachingType === 'LIVE' ? '🔴 Live' :
                           preaching.preachingType === 'VIDEO' ? '🎥 Vidéo' : '🎵 Audio'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {preaching.pastorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(preaching.preachingDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {preaching.duration}
                        </span>
                        {preaching.isLive && (
                          <span className="flex items-center gap-1 text-red-600">
                            <Users className="h-4 w-4" />
                            {preaching.viewerCount} connectés
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <CardDescription className="text-base">
                    {preaching.description}
                  </CardDescription>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">{preaching.bibleVerses}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{preaching.viewCount} vues</span>
                      {!preaching.isLive && <span>{preaching.downloadCount} téléchargements</span>}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {preaching.preachingType === 'LIVE' && (
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Radio className="h-4 w-4 mr-2" />
                          Rejoindre
                        </Button>
                      )}
                      
                      {preaching.preachingType === 'AUDIO' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlayPause(preaching.id)}
                        >
                          {currentlyPlaying === preaching.id ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-4 w-4 mr-2" />
                              Écouter
                            </>
                          )}
                        </Button>
                      )}
                      
                      {!preaching.isLive && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPreachings.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune prédication trouvée</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  )
}