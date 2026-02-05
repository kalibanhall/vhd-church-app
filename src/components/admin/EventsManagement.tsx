'use client'

import { useState, useEffect } from 'react'
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Plus, Calendar, MapPin, Users, Clock, Edit2, Trash2, Link, Video, Music, Image, User, Eye } from 'lucide-react'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  startTime: string
  endTime: string
  eventType: string
  location: string
  maxAttendees?: number
  liveUrl?: string
  isRecurring?: boolean
  recurrencePattern?: string
  animatedBy?: string
  showOnHomepage?: boolean
  eventImageUrl?: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
  pastor?: {
    id: string
    firstName: string
    lastName: string
  }
}

interface Pastor {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  profileImageUrl?: string
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [preachings, setPreachings] = useState<any[]>([])
  const [pastors, setPastors] = useState<Pastor[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingPreaching, setEditingPreaching] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'events' | 'preachings'>('events')
  const [showPreachingForm, setShowPreachingForm] = useState(false)
  const [showPreachingsList, setShowPreachingsList] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ video: 0, audio: 0, thumbnail: 0 })
  const [uploadStatus, setUploadStatus] = useState({ video: '', audio: '', thumbnail: '' })
  
  // État pour les événements (cultes)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    eventType: 'WORSHIP_SERVICE',
    location: '',
    maxAttendees: '',
    liveUrl: '',
    animatedBy: '', // ID du pasteur qui anime le culte
    displayLive: false,
    coverImage: null as File | null,
    showOnHomepage: true
  })

  // État pour les prédications
  const [preachingData, setPreachingData] = useState({
    title: '',
    preacher: '',
    date: '',
    description: '',
    bibleVerses: '',
    videoFile: null as File | null,
    audioFile: null as File | null,
    thumbnailFile: null as File | null,
    preachingType: 'VIDEO' as 'AUDIO' | 'VIDEO' | 'LIVE',
    liveUrl: '',
    // URLs externes (YouTube, Vimeo, etc.)
    videoUrl: '',
    audioUrl: '',
    thumbnailUrl: ''
  })

  useEffect(() => {
    fetchEvents()
    fetchPastors()
    if (activeTab === 'preachings') {
      fetchPreachings()
    }
  }, [activeTab])

  const fetchEvents = async () => {
    try {
      const response = await authenticatedFetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPastors = async () => {
    try {
      const response = await authenticatedFetch('/api/pastors')
      if (response.ok) {
        const data = await response.json()
        setPastors(data.pastors || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pasteurs:', error)
    }
  }

  const fetchPreachings = async () => {
    try {
      const response = await authenticatedFetch('/api/preachings')
      if (response.ok) {
        const data = await response.json()
        setPreachings(data.preachings || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prédications:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingEvent ? 'PUT' : 'POST'
      const url = '/api/events'
      
      const requestData = editingEvent 
        ? { ...formData, id: editingEvent.id }
        : formData

      const response = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()
      
      if (data.success) {
        alert(editingEvent ? 'Événement modifié avec succès !' : 'Événement créé avec succès !')
        await fetchEvents()
        resetForm()
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handlePreachingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Vérifier si des uploads sont en cours
    if (isUploading) {
      alert('Veuillez attendre que tous les uploads soient terminés')
      return
    }
    
    try {
      setIsUploading(true)
      console.log('🎯 Début de la création de prédication...')
      console.log('📝 Données de prédication:', preachingData)
      
      // Réinitialiser les statuts d'upload
      setUploadProgress({ video: 0, audio: 0, thumbnail: 0 })
      setUploadStatus({ video: '', audio: '', thumbnail: '' })
      
      // Upload des fichiers d'abord
      let videoUrl, audioUrl, thumbnailUrl

      try {
        if (preachingData.videoFile) {
          console.log('📹 Upload vidéo...')
          videoUrl = await uploadFile(preachingData.videoFile, 'video')
          console.log('✅ Vidéo uploadée:', videoUrl)
        }
        if (preachingData.audioFile) {
          console.log('🎵 Upload audio...')
          audioUrl = await uploadFile(preachingData.audioFile, 'audio')
          console.log('✅ Audio uploadé:', audioUrl)
        }
        if (preachingData.thumbnailFile) {
          console.log('🖼️ Upload miniature...')
          thumbnailUrl = await uploadFile(preachingData.thumbnailFile, 'thumbnail')
          console.log('✅ Miniature uploadée:', thumbnailUrl)
        }
      } catch (uploadError) {
        console.error('💥 Erreur lors de l\'upload des fichiers:', uploadError)
        setIsUploading(false)
        alert(`Erreur lors de l'upload des fichiers: ${uploadError instanceof Error ? uploadError.message : 'Erreur inconnue'}`)
        return
      }

      const sermonData: any = {
        title: preachingData.title,
        description: preachingData.description,
        bibleVerses: preachingData.bibleVerses,
        sermonType: preachingData.preachingType,
        sermonDate: preachingData.date,
        isPublished: true
      }

      // Priorité: fichier uploadé > URL externe > URL existante (en modification)
      // Vidéo
      if (videoUrl) {
        sermonData.videoUrl = videoUrl
      } else if (preachingData.videoUrl) {
        sermonData.videoUrl = preachingData.videoUrl
      } else if (editingPreaching?.videoUrl) {
        sermonData.videoUrl = editingPreaching.videoUrl
      }
      
      // Audio
      if (audioUrl) {
        sermonData.audioUrl = audioUrl
      } else if (preachingData.audioUrl) {
        sermonData.audioUrl = preachingData.audioUrl
      } else if (editingPreaching?.audioUrl) {
        sermonData.audioUrl = editingPreaching.audioUrl
      }
      
      // Thumbnail
      if (thumbnailUrl) {
        sermonData.thumbnailUrl = thumbnailUrl
      } else if (preachingData.thumbnailUrl) {
        sermonData.thumbnailUrl = preachingData.thumbnailUrl
      } else if (editingPreaching?.thumbnailUrl) {
        sermonData.thumbnailUrl = editingPreaching.thumbnailUrl
      }
      
      // URL Live
      if (preachingData.preachingType === 'LIVE' && preachingData.liveUrl) {
        sermonData.liveUrl = preachingData.liveUrl
      }

      console.log('📤 Envoi des données de prédication:', sermonData)

      const url = editingPreaching ? `/api/preachings/${editingPreaching.id}` : '/api/preachings'
      const method = editingPreaching ? 'PUT' : 'POST'

      const response = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sermonData)
      })

      console.log('📊 Statut de réponse:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur API:', response.status, errorText)
        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Réponse de l\'API:', result)
      
      if (result.success) {
        alert(editingPreaching ? 'Prédication modifiée avec succès !' : 'Prédication créée avec succès !')
        resetPreachingForm()
        setShowPreachingForm(false)
        fetchPreachings() // Actualiser la liste
      } else {
        alert('Erreur: ' + (result.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('💥 Erreur générale:', error)
      alert(`Erreur lors de la création de la prédication: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const uploadFile = async (file: File, type: 'video' | 'audio' | 'thumbnail'): Promise<string> => {
    console.log(`📁 Upload de fichier ${type}, taille: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    
    return new Promise((resolve, reject) => {
      // Mise à jour du statut initial
      setUploadStatus(prev => ({ ...prev, [type]: 'Préparation...' }))
      setUploadProgress(prev => ({ ...prev, [type]: 0 }))
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      // Utiliser XMLHttpRequest pour avoir accès aux événements de progression
      const xhr = new XMLHttpRequest()
      
      // Gestionnaire de progression d'upload
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(prev => ({ ...prev, [type]: percentComplete }))
          
          if (percentComplete < 100) {
            setUploadStatus(prev => ({ ...prev, [type]: `Upload en cours... ${percentComplete}%` }))
          } else {
            setUploadStatus(prev => ({ ...prev, [type]: 'Finalisation...' }))
          }
        }
      })

      // Gestionnaire de fin d'upload
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText)
            if (result.url) {
              setUploadProgress(prev => ({ ...prev, [type]: 100 }))
              setUploadStatus(prev => ({ ...prev, [type]: 'Terminé ✅' }))
              console.log(`✅ Upload ${type} réussi:`, result.url)
              resolve(result.url)
            } else {
              throw new Error(`URL manquante dans la réponse de l'upload ${type}`)
            }
          } catch (parseError) {
            setUploadStatus(prev => ({ ...prev, [type]: 'Erreur ❌' }))
            reject(new Error(`Erreur de traitement de la réponse: ${parseError}`))
          }
        } else {
          setUploadStatus(prev => ({ ...prev, [type]: 'Erreur ❌' }))
          reject(new Error(`Erreur HTTP ${xhr.status}: ${xhr.responseText}`))
        }
      })

      // Gestionnaire d'erreur
      xhr.addEventListener('error', () => {
        setUploadStatus(prev => ({ ...prev, [type]: 'Erreur ❌' }))
        reject(new Error(`Erreur réseau lors de l'upload ${type}`))
      })

      // Gestionnaire d'annulation
      xhr.addEventListener('abort', () => {
        setUploadStatus(prev => ({ ...prev, [type]: 'Annulé ❌' }))
        reject(new Error(`Upload ${type} annulé`))
      })

      // Récupérer le token d'authentification
      const token = localStorage.getItem('token') || localStorage.getItem('auth-token')
      
      // Démarrer l'upload
      setUploadStatus(prev => ({ ...prev, [type]: 'Upload en cours...' }))
      xhr.open('POST', '/api/upload')
      xhr.withCredentials = true
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      xhr.send(formData)
    })
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      eventType: 'WORSHIP_SERVICE',
      location: '',
      maxAttendees: '',
      liveUrl: '',
      animatedBy: '',
      displayLive: false,
      coverImage: null,
      showOnHomepage: true
    })
    setShowCreateForm(false)
    setEditingEvent(null)
  }

  const resetPreachingForm = () => {
    setPreachingData({
      title: '',
      preacher: '',
      date: '',
      description: '',
      bibleVerses: '',
      videoFile: null,
      audioFile: null,
      thumbnailFile: null,
      preachingType: 'VIDEO',
      liveUrl: '',
      videoUrl: '',
      audioUrl: '',
      thumbnailUrl: ''
    })
    setEditingPreaching(null)
  }

  // Fonction pour générer automatiquement une miniature depuis une vidéo
  const generateVideoThumbnail = (videoFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'))
        return
      }

      video.addEventListener('loadedmetadata', () => {
        // Définir la taille du canvas
        canvas.width = Math.min(video.videoWidth, 1280) // Max 1280px de largeur
        canvas.height = Math.min(video.videoHeight, 720) // Max 720px de hauteur
        
        // Se positionner à 10% de la durée pour éviter les écrans noirs
        video.currentTime = video.duration * 0.1
      })

      video.addEventListener('seeked', () => {
        try {
          // Dessiner la frame vidéo sur le canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          // Convertir le canvas en Blob puis en File
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `thumbnail_${Date.now()}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(thumbnailFile)
            } else {
              reject(new Error('Impossible de générer la miniature'))
            }
          }, 'image/jpeg', 0.8) // Qualité 80%
        } catch (error) {
          reject(error)
        }
      })

      video.addEventListener('error', () => {
        reject(new Error('Erreur lors du chargement de la vidéo'))
      })

      // Charger la vidéo
      video.src = URL.createObjectURL(videoFile)
      video.load()
    })
  }

  const handleEditPreaching = (preaching: any) => {
    // Safely extract date from various possible field names
    const dateStr = preaching.sermonDate || preaching.preachingDate || preaching.date || ''
    let formattedDate = ''
    if (dateStr) {
      try {
        const d = new Date(dateStr)
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0]
        }
      } catch { /* ignore */ }
    }
    
    setPreachingData({
      title: preaching.title || '',
      preacher: preaching.pastorName || preaching.preacher || '',
      date: formattedDate,
      description: preaching.description || '',
      bibleVerses: preaching.bibleVerses || '',
      videoFile: null,
      audioFile: null,
      thumbnailFile: null,
      preachingType: preaching.sermonType || preaching.preachingType || 'VIDEO',
      liveUrl: preaching.liveUrl || '',
      videoUrl: preaching.videoUrl || '',
      audioUrl: preaching.audioUrl || '',
      thumbnailUrl: preaching.thumbnailUrl || ''
    })
    setEditingPreaching(preaching)
    setShowPreachingForm(true)
  }

  const handleDeletePreaching = async (preachingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette prédication ?')) {
      return
    }

    try {
      const response = await authenticatedFetch(`/api/preachings/${preachingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Prédication supprimée avec succès !')
        fetchPreachings()
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la prédication')
    }
  }

  const handleEdit = (event: Event) => {
    // Formatage des dates et heures pour les inputs HTML
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().split('T')[0] // YYYY-MM-DD
    }

    const formatTimeForInput = (timeString: string) => {
      if (!timeString) return ''
      // Si c'est déjà au format HH:MM, on le retourne tel quel
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString
      }
      // Sinon, on essaie de parser comme une date
      try {
        const date = new Date(timeString)
        return date.toTimeString().slice(0, 5) // HH:MM
      } catch {
        return timeString
      }
    }

    setFormData({
      title: event.title,
      description: event.description,
      eventDate: formatDateForInput(event.eventDate),
      startTime: formatTimeForInput(event.startTime),
      endTime: formatTimeForInput(event.endTime || ''),
      eventType: event.eventType,
      location: event.location,
      maxAttendees: event.maxAttendees?.toString() || '',
      liveUrl: event.liveUrl || '',
      animatedBy: event.animatedBy || '',
      displayLive: false,
      coverImage: null,
      showOnHomepage: event.showOnHomepage !== undefined ? event.showOnHomepage : true
    })
    setEditingEvent(event)
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        const response = await authenticatedFetch(`/api/events?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          await fetchEvents()
          alert('Événement supprimé avec succès')
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio' | 'thumbnail') => {
    const file = e.target.files?.[0] || null
    
    // Mettre à jour le fichier sélectionné
    setPreachingData(prev => ({
      ...prev,
      [`${type}File`]: file
    }))

    // Si c'est une vidéo, générer automatiquement la miniature
    if (type === 'video' && file && file.type.startsWith('video/')) {
      try {
        setUploadStatus(prev => ({ ...prev, thumbnail: 'Génération de la miniature...' }))
        
        const thumbnailFile = await generateVideoThumbnail(file)
        
        setPreachingData(prev => ({
          ...prev,
          thumbnailFile: thumbnailFile
        }))
        
        setUploadStatus(prev => ({ ...prev, thumbnail: 'Miniature générée automatiquement ✅' }))
        
        console.log('✅ Miniature générée automatiquement:', thumbnailFile.name)
      } catch (error) {
        console.error('❌ Erreur lors de la génération de miniature:', error)
        setUploadStatus(prev => ({ ...prev, thumbnail: 'Erreur génération miniature ❌' }))
      }
    }
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Événements</h1>
      </div>

      {/* Onglets pour séparer Cultes et Prédications */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-[#ffc200] text-[#cc9b00]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Cultes & Événements
          </button>
          <button
            onClick={() => setActiveTab('preachings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preachings'
                ? 'border-[#ffc200] text-[#cc9b00]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Prédications
          </button>
        </div>
      </div>

      {/* Section Cultes et Événements */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Cultes et Événements</h2>
            <Button onClick={() => setShowCreateForm(true)} className="bg-[#ffc200] hover:bg-[#cc9b00]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Culte/Événement
            </Button>
          </div>

          {/* Formulaire de création/modification d'événement */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingEvent ? 'Modifier l\'événement' : 'Créer un nouveau culte/événement'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Titre</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Type d'événement</label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="WORSHIP_SERVICE">Culte</option>
                        <option value="PRAYER_MEETING">Réunion de prière</option>
                        <option value="BIBLE_STUDY">Étude biblique</option>
                        <option value="YOUTH_MEETING">Réunion jeunes</option>
                        <option value="SPECIAL_EVENT">Événement spécial</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Animé par (Pasteur)
                      </label>
                      <select
                        value={formData.animatedBy}
                        onChange={(e) => setFormData({...formData, animatedBy: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">-- Sélectionner un pasteur --</option>
                        {pastors.map((pastor) => (
                          <option key={pastor.id} value={pastor.id}>
                            {pastor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Heure de début</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Heure de fin</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Lieu</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre max de participants (optionnel)</label>
                      <input
                        type="number"
                        value={formData.maxAttendees}
                        onChange={(e) => setFormData({...formData, maxAttendees: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Lien Live (Facebook/YouTube)</label>
                      <input
                        type="url"
                        value={formData.liveUrl}
                        onChange={(e) => setFormData({...formData, liveUrl: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        placeholder="https://facebook.com/live/... ou https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-2 border rounded-md h-24"
                      required
                    />
                  </div>

                  {/* Image de couverture */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Image de couverture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        setFormData({...formData, coverImage: file || null})
                      }}
                      className="w-full p-2 border rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formats acceptés: JPG, PNG, WebP (max 5MB)
                    </p>
                  </div>

                  {/* Toggles d'affichage */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showOnHomepage"
                        checked={formData.showOnHomepage}
                        onChange={(e) => setFormData({...formData, showOnHomepage: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor="showOnHomepage" className="text-sm font-medium">
                        Afficher l'annonce à l'accueil
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="displayLive"
                        checked={formData.displayLive}
                        onChange={(e) => setFormData({...formData, displayLive: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor="displayLive" className="text-sm font-medium">
                        Afficher le live sur la page d'accueil
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      {editingEvent ? 'Modifier' : 'Créer'} l'événement
                    </Button>
                    <Button type="button" onClick={resetForm} variant="outline">
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Liste des événements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEdit(event)}
                        size="sm"
                        variant="outline"
                        className="p-1 h-7 w-7"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(event.id)}
                        size="sm"
                        variant="outline"
                        className="p-1 h-7 w-7 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {event.eventType === 'WORSHIP_SERVICE' && 'Culte'}
                    {event.eventType === 'PRAYER_MEETING' && 'Réunion de prière'}
                    {event.eventType === 'BIBLE_STUDY' && 'Étude biblique'}
                    {event.eventType === 'YOUTH_MEETING' && 'Réunion jeunes'}
                    {event.eventType === 'SPECIAL_EVENT' && 'Événement spécial'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(event.eventDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location}
                  </div>
                  {event.maxAttendees && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      Max {event.maxAttendees} participants
                    </div>
                  )}
                  {event.liveUrl && (
                    <div className="flex items-center text-sm text-[#cc9b00]">
                      <Link className="w-4 h-4 mr-1" />
                      <a href={event.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Lien Live
                      </a>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Créé par {event.createdBy?.firstName || 'Utilisateur'} {event.createdBy?.lastName || 'Inconnu'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Section Prédications */}
      {activeTab === 'preachings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Prédications</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowPreachingsList(!showPreachingsList)} 
                variant="outline"
                className="bg-[#fffefa] hover:bg-[#fff3cc]"
              >
                {showPreachingsList ? 'Masquer' : 'Afficher'} la liste
              </Button>
              <Button onClick={() => setShowPreachingForm(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Prédication
              </Button>
            </div>
          </div>

          {/* Liste des prédications existantes */}
          {showPreachingsList && (
            <Card>
              <CardHeader>
                <CardTitle>Prédications existantes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Chargement des prédications...</p>
                  </div>
                ) : preachings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎙️</div>
                    <p>Aucune prédication trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {preachings.map((preaching) => (
                      <div key={preaching.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{preaching.title}</h3>
                              <Badge variant="outline" className={`text-xs ${
                                preaching.sermonType === 'VIDEO' ? 'bg-red-50 text-red-700' : 
                                preaching.sermonType === 'AUDIO' ? 'bg-green-50 text-green-700' : 
                                preaching.sermonType === 'LIVE' ? 'bg-orange-50 text-orange-700' : 
                                'bg-[#fffefa] text-[#5c4d00]'
                              }`}>
                                {preaching.sermonType}
                              </Badge>
                              <Badge variant={preaching.isPublished ? "default" : "secondary"}>
                                {preaching.isPublished ? 'Publié' : 'Brouillon'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{preaching.pastorName || preaching.preacher || 'Non défini'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{(() => {
                                  const dateStr = preaching.sermonDate || preaching.preachingDate || preaching.date
                                  if (!dateStr) return 'Date non définie'
                                  try {
                                    const d = new Date(dateStr)
                                    return isNaN(d.getTime()) ? 'Date invalide' : d.toLocaleDateString('fr-FR')
                                  } catch { return 'Date invalide' }
                                })()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{preaching.viewCount || 0} vues</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{preaching.duration || '-'}</span>
                              </div>
                            </div>

                            {preaching.description && (
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {preaching.description}
                              </p>
                            )}

                            <div className="flex gap-2">
                              {preaching.videoUrl && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                                  <Video className="w-3 h-3 mr-1" />
                                  Vidéo
                                </Badge>
                              )}
                              {preaching.audioUrl && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                                  <Music className="w-3 h-3 mr-1" />
                                  Audio
                                </Badge>
                              )}
                              {preaching.thumbnailUrl && (
                                <Badge variant="outline" className="text-xs bg-[#fffefa] text-[#cc9b00]">
                                  <Image className="w-3 h-3 mr-1" />
                                  Miniature
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => handleEditPreaching(preaching)}
                              size="sm"
                              variant="outline"
                              className="bg-[#fffefa] hover:bg-[#fff3cc] text-[#5c4d00] border-[#e6af00]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeletePreaching(preaching.id)}
                              size="sm"
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Formulaire de création de prédication */}
          {showPreachingForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingPreaching ? 'Modifier la prédication' : 'Créer une nouvelle prédication'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePreachingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Titre de la prédication</label>
                      <input
                        type="text"
                        value={preachingData.title}
                        onChange={(e) => setPreachingData({...preachingData, title: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Prédicateur</label>
                      <input
                        type="text"
                        value={preachingData.preacher}
                        onChange={(e) => setPreachingData({...preachingData, preacher: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Date de la prédication</label>
                      <input
                        type="date"
                        value={preachingData.date}
                        onChange={(e) => setPreachingData({...preachingData, date: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Type de prédication</label>
                      <select
                        value={preachingData.preachingType}
                        onChange={(e) => setPreachingData({...preachingData, preachingType: e.target.value as 'AUDIO' | 'VIDEO' | 'LIVE'})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="VIDEO">Vidéo</option>
                        <option value="AUDIO">Audio</option>
                        <option value="LIVE">Live</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={preachingData.description}
                      onChange={(e) => setPreachingData({...preachingData, description: e.target.value})}
                      className="w-full p-2 border rounded-md h-24"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Versets bibliques (optionnel)</label>
                    <input
                      type="text"
                      value={preachingData.bibleVerses}
                      onChange={(e) => setPreachingData({...preachingData, bibleVerses: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="Ex: Jean 3:16, Matthieu 5:3-12"
                    />
                  </div>

                  {/* Upload des fichiers OU URLs externes */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
                      📁 Fichiers médias (upload ou URL)
                    </h4>
                    
                    {/* Section Vidéo */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <label className="block text-sm font-medium mb-2 text-red-700">
                        <Video className="w-4 h-4 inline mr-1" />
                        Vidéo
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Uploader un fichier</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e, 'video')}
                            className="w-full p-2 border rounded-md text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">OU coller une URL (YouTube, Vimeo...)</label>
                          <input
                            type="url"
                            value={preachingData.videoUrl}
                            onChange={(e) => setPreachingData({...preachingData, videoUrl: e.target.value})}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Audio */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <label className="block text-sm font-medium mb-2 text-green-700">
                        <Music className="w-4 h-4 inline mr-1" />
                        Audio
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Uploader un fichier</label>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileChange(e, 'audio')}
                            className="w-full p-2 border rounded-md text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">OU coller une URL (SoundCloud, etc.)</label>
                          <input
                            type="url"
                            value={preachingData.audioUrl}
                            onChange={(e) => setPreachingData({...preachingData, audioUrl: e.target.value})}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="https://soundcloud.com/..."
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Thumbnail */}
                    <div className="bg-[#fffefa] p-4 rounded-lg border border-[#e6af00]">
                      <label className="block text-sm font-medium mb-2 text-[#5c4d00]">
                        <Image className="w-4 h-4 inline mr-1" />
                        Image de couverture
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Uploader une image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'thumbnail')}
                            className="w-full p-2 border rounded-md text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">OU coller une URL d'image</label>
                          <input
                            type="url"
                            value={preachingData.thumbnailUrl}
                            onChange={(e) => setPreachingData({...preachingData, thumbnailUrl: e.target.value})}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Si vous uploadez une vidéo, la miniature sera générée automatiquement
                      </p>
                    </div>
                  </div>

                  {/* Barres de progression d'upload */}
                  {isUploading && (
                    <div className="space-y-3 p-4 bg-[#fffefa] rounded-lg border border-[#e6af00]">
                      <h4 className="font-medium text-[#3d3200]">Upload en cours...</h4>
                      
                      {preachingData.videoFile && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-[#5c4d00]">Vidéo</span>
                            <span className="text-sm text-[#cc9b00]">{uploadProgress.video}%</span>
                          </div>
                          <div className="w-full bg-[#e6af00]/30 rounded-full h-2">
                            <div 
                              className="bg-[#ffc200] h-2 rounded-full transition-all duration-300" 
                              style={{width: `${uploadProgress.video}%`}}
                            ></div>
                          </div>
                          {uploadStatus.video && (
                            <p className="text-xs text-[#cc9b00] mt-1">{uploadStatus.video}</p>
                          )}
                        </div>
                      )}
                      
                      {preachingData.audioFile && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-[#5c4d00]">Audio</span>
                            <span className="text-sm text-[#cc9b00]">{uploadProgress.audio}%</span>
                          </div>
                          <div className="w-full bg-[#e6af00]/30 rounded-full h-2">
                            <div 
                              className="bg-[#ffc200] h-2 rounded-full transition-all duration-300" 
                              style={{width: `${uploadProgress.audio}%`}}
                            ></div>
                          </div>
                          {uploadStatus.audio && (
                            <p className="text-xs text-[#cc9b00] mt-1">{uploadStatus.audio}</p>
                          )}
                        </div>
                      )}
                      
                      {preachingData.thumbnailFile && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-[#5c4d00]">Image</span>
                            <span className="text-sm text-[#cc9b00]">{uploadProgress.thumbnail}%</span>
                          </div>
                          <div className="w-full bg-[#e6af00]/30 rounded-full h-2">
                            <div 
                              className="bg-[#ffc200] h-2 rounded-full transition-all duration-300" 
                              style={{width: `${uploadProgress.thumbnail}%`}}
                            ></div>
                          </div>
                          {uploadStatus.thumbnail && (
                            <p className="text-xs text-[#cc9b00] mt-1">{uploadStatus.thumbnail}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {preachingData.preachingType === 'LIVE' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Lien Live (Facebook/YouTube)</label>
                      <input
                        type="url"
                        value={preachingData.liveUrl}
                        onChange={(e) => setPreachingData({...preachingData, liveUrl: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        placeholder="https://facebook.com/live/... ou https://youtube.com/watch?v=..."
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Upload en cours...
                        </>
                      ) : (
                        editingPreaching ? 'Modifier la prédication' : 'Créer la prédication'
                      )}
                    </Button>
                    <Button type="button" onClick={() => {
                      resetPreachingForm()
                      setShowPreachingForm(false)
                    }} variant="outline">
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

