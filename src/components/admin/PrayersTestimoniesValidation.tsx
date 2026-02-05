'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Heart, BookOpen, Clock, CheckCircle, XCircle, Eye, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { safeFormatDateTime } from '@/lib/utils'

interface Prayer {
  id: string
  userId: string
  userName: string
  title: string
  content: string
  isAnonymous: boolean
  isPublic: boolean
  prayerDate: string
  status: 'pending' | 'approved' | 'rejected'
  prayerCount: number
}

interface Testimony {
  id: string
  userId: string
  userName: string
  title: string
  content: string
  isAnonymous: boolean
  testimonyDate: string
  status: 'pending' | 'approved' | 'rejected'
  likeCount: number
  viewCount: number
}

export default function PrayersTestimoniesValidation() {
  const { user } = useAuth()
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'prayers' | 'testimonies'>('prayers')

  useEffect(() => {
    if (user?.id) {
      fetchPendingItems()
    }
  }, [user])

  const fetchPendingItems = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Récupérer les prières en attente
      const prayersResponse = await authenticatedFetch('/api/admin/validation?type=prayers')
      if (prayersResponse.ok) {
        const prayersData = await prayersResponse.json()
        setPrayers(prayersData)
      } else {
        console.error('Erreur prières:', await prayersResponse.json())
      }

      // Récupérer les témoignages en attente
      const testimoniesResponse = await authenticatedFetch('/api/admin/validation?type=testimonies')
      if (testimoniesResponse.ok) {
        const testimoniesData = await testimoniesResponse.json()
        setTestimonies(testimoniesData)
      } else {
        console.error('Erreur témoignages:', await testimoniesResponse.json())
      }
        
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setLoading(false)
    }
  }

  const handlePrayerAction = async (prayerId: string, action: 'approve' | 'reject') => {
    if (!user?.id) return
    
    try {

      // Appeler l'API pour approuver/rejeter la prière
      const response = await authenticatedFetch('/api/admin/validation/moderate', {
        method: 'PATCH',
        body: JSON.stringify({ 
          type: 'prayer',
          itemId: prayerId,
          action
        })
      })

      if (response.ok) {
        setPrayers(prev => prev.filter(p => p.id !== prayerId))
        const actionText = action === 'approve' ? 'approuvée' : 'rejetée'
        alert(`Prière ${actionText} avec succès`)
      } else {
        const error = await response.json()
        alert('Erreur: ' + error.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'action')
    }
  }

  const handleTestimonyAction = async (testimonyId: string, action: 'approve' | 'reject') => {
    if (!user?.id) return
    
    try {

      // Appeler l'API pour approuver/rejeter le témoignage
      const response = await authenticatedFetch('/api/admin/validation/moderate', {
        method: 'PATCH',
        body: JSON.stringify({ 
          type: 'testimony',
          itemId: testimonyId,
          action
        })
      })

      if (response.ok) {
        setTestimonies(prev => prev.filter(t => t.id !== testimonyId))
        const actionText = action === 'approve' ? 'approuvé' : 'rejeté'
        alert(`Témoignage ${actionText} avec succès`)
      } else {
        const error = await response.json()
        alert('Erreur: ' + error.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'action')
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Validation Témoignages</h1>
          <p className="text-gray-600 mt-2">Modération des prières et témoignages</p>
        </div>
        
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <Card key={i} className="animate-pulse">
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Validation Témoignages</h1>
        <p className="text-gray-600 mt-2">Modération des prières et témoignages en attente</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('prayers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'prayers' 
              ? 'bg-white text-[#cc9b00] shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart className="h-4 w-4 inline mr-2" />
          Prières ({prayers.length})
        </button>
        <button
          onClick={() => setActiveTab('testimonies')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'testimonies' 
              ? 'bg-white text-[#cc9b00] shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Témoignages ({testimonies.length})
        </button>
      </div>

      {/* Prayers Tab */}
      {activeTab === 'prayers' && (
        <div className="space-y-4">
          {prayers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune prière en attente</h3>
                  <p className="text-gray-600">Toutes les demandes de prière ont été traitées.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            prayers.map((prayer) => (
              <Card key={prayer.id} className="border-l-4 border-l-pink-400">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Heart className="h-5 w-5 text-pink-500" />
                        {prayer.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {prayer.isAnonymous ? 'Anonyme' : prayer.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {safeFormatDateTime(prayer.prayerDate)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          prayer.isPublic 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prayer.isPublic ? 'Public' : 'Privé'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {prayer.content}
                  </p>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handlePrayerAction(prayer.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => handlePrayerAction(prayer.id, 'reject')}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Testimonies Tab */}
      {activeTab === 'testimonies' && (
        <div className="space-y-4">
          {testimonies.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun témoignage en attente</h3>
                  <p className="text-gray-600">Tous les témoignages ont été traités.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            testimonies.map((testimony) => (
              <Card key={testimony.id} className="border-l-4 border-l-yellow-400">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-yellow-500" />
                        {testimony.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {testimony.isAnonymous ? 'Anonyme' : testimony.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {safeFormatDateTime(testimony.testimonyDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {testimony.content}
                  </p>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleTestimonyAction(testimony.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => handleTestimonyAction(testimony.id, 'reject')}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}