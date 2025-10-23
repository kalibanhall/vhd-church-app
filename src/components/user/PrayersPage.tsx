'use client'

import { useState, useEffect } from 'react'
import { Heart, Plus, Clock, CheckCircle, X, Send, Eye, AlertCircle, User, Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'

interface Prayer {
  id: string
  title: string
  content: string
  category: string
  isPublic: boolean
  isAnonymous: boolean
  status: string
  isAnswered: boolean
  prayerDate: string
  prayerCount: number
  userId: string
  userName: string
  canEdit: boolean
  hasUserPrayed?: boolean
}

export default function PrayersPage() {
  const { user } = useAuth()
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'my' | 'pending'>('all')
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    isPublic: true,
    isAnonymous: false
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPrayers()
    }
  }, [user, filter])

  const fetchPrayers = async () => {
    try {
      setLoading(true)
      let url = `/api/prayers?userId=${user?.id}`
      
      if (filter === 'my') {
        url += '&userOnly=true'
      } else if (filter === 'pending') {
        url += '&status=pending'
      } else {
        url += '&status=approved'
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setPrayers(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prières:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!newPrayer.title.trim()) {
      setFormError('Le titre de la prière est requis.')
      return
    }
    if (!newPrayer.content.trim()) {
      setFormError('Le contenu de la prière est requis.')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch(`/api/prayers?userId=${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newPrayer)
      })

      if (response.ok) {
        setNewPrayer({
          title: '',
          content: '',
          category: 'GENERAL',
          isPublic: true,
          isAnonymous: false
        })
        setShowCreateForm(false)
        fetchPrayers()
        setFormError(null)
        alert('Votre intention de prière a été soumise pour validation')
      } else {
        const error = await response.json()
        setFormError(error.error || 'Erreur lors de la soumission')
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      setFormError('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrayForIntention = async (prayerId: string, currentStatus: boolean) => {
    try {
      if (!user?.id) {
        alert('Vous devez être connecté pour prier pour cette intention')
        return
      }

      // L'API gère automatiquement l'ajout/suppression selon l'état actuel
      const response = await fetch(`/api/prayers/support?prayerId=${prayerId}&userId=${user.id}`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        console.log(result.message)
        
        // Rafraîchir la liste pour mettre à jour l'état
        fetchPrayers()
      } else {
        const error = await response.json()
        console.error('Erreur:', error.error)
        alert('Erreur lors de l\'action de prière')
      }
    } catch (error) {
      console.error('Erreur lors de l\'action de prière:', error)
      alert('Erreur de connexion')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approuvé</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejeté</Badge>
      default:
        return null
    }
  }

  if (!user) {
    return <div className="p-6 text-center">Veuillez vous connecter pour voir les intentions de prière.</div>
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => (
            <Card key={i} className="h-48">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intentions de prière</h1>
          <p className="text-gray-600 mt-2">Partagez vos besoins de prière et priez pour les autres</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle intention
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="flex-1 sm:flex-none py-3 text-base"
        >
          Toutes les prières
        </Button>
        <Button
          variant={filter === 'my' ? 'default' : 'outline'}
          onClick={() => setFilter('my')}
          className="flex-1 sm:flex-none py-3 text-base"
        >
          Mes prières
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          className="flex-1 sm:flex-none py-3 text-base"
        >
          En attente de validation
        </Button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Nouvelle intention de prière
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePrayer} className="space-y-4">
              {formError && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la prière
                </label>
                <Input
                  type="text"
                  value={newPrayer.title}
                  onChange={(e) => setNewPrayer(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="ex: Pour la guérison de ma famille"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Détails de votre demande
                </label>
                <Textarea
                  value={newPrayer.content}
                  onChange={(e) => setNewPrayer(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Partagez votre intention de prière..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center mr-4">
                  <input
                    type="radio"
                    name="prayerType"
                    checked={newPrayer.isAnonymous}
                    onChange={() => setNewPrayer(prev => ({ ...prev, isAnonymous: true, isPublic: false }))}
                    className="mr-2"
                  />
                  Anonyme
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="prayerType"
                    checked={newPrayer.isPublic}
                    onChange={() => setNewPrayer(prev => ({ ...prev, isAnonymous: false, isPublic: true }))}
                    className="mr-2"
                  />
                  Publique
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="py-3 text-base"
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 py-3 text-base"
                  disabled={submitting || !newPrayer.title.trim() || !newPrayer.content.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Envoi...' : 'Soumettre pour validation'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des prières */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prayers.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune intention de prière</h3>
            <p className="text-gray-600">
              {filter === 'my' ? 'Vous n\'avez pas encore partagé d\'intention de prière.' : 
               filter === 'pending' ? 'Aucune prière en attente de validation.' :
               'Aucune intention de prière disponible.'}
            </p>
          </div>
        ) : (
          prayers.map((prayer) => (
            <Card key={prayer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{prayer.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-3 w-3" />
                      <span>{prayer.isAnonymous ? 'Anonyme' : prayer.userName}</span>
                      <Calendar className="h-3 w-3 ml-2" />
                      <span>{new Date(prayer.prayerDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  {getStatusBadge(prayer.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {prayer.content}
                </p>

                {prayer.status === 'APPROVED' && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Heart className="h-4 w-4" />
                      <span>{prayer.prayerCount} personne{prayer.prayerCount !== 1 ? 's' : ''} pri{prayer.prayerCount !== 1 ? 'ent' : 'e'}</span>
                    </div>
                    <Button
                      onClick={() => handlePrayForIntention(prayer.id, prayer.hasUserPrayed || false)}
                      className={prayer.hasUserPrayed ? 
                        "bg-red-100 text-red-700 hover:bg-red-200" : 
                        "bg-red-600 text-white hover:bg-red-700"
                      }
                      size="sm"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${prayer.hasUserPrayed ? 'fill-current' : ''}`} />
                      {prayer.hasUserPrayed ? 'Je prie déjà' : 'Je prie pour cette intention'}
                    </Button>
                  </div>
                )}

                {prayer.status === 'PENDING' && prayer.userId === user.id && (
                  <div className="flex items-center gap-2 pt-4 border-t text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span>Votre intention est en cours de validation par l'équipe pastorale</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}