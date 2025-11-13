'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Plus, Clock, CheckCircle, X, Send, Eye } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

interface Testimony {
  id: string
  title: string
  content: string
  isAnonymous: boolean
  isApproved: boolean
  isPublished: boolean
  status: string
  testimonyDate: string
  likeCount: number
  commentCount: number
  viewCount: number
  userId: string
  userName: string
  canEdit: boolean
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

export default function TestimoniesPage() {
  const { user } = useAuth()
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({})
  const [newComment, setNewComment] = useState('')

  const [newTestimony, setNewTestimony] = useState({
    title: '',
    content: '',
    isAnonymous: false
  })

  useEffect(() => {
    fetchTestimonies()
  }, [activeTab, user?.id])

  const fetchTestimonies = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        userId: user.id,
        ...(activeTab === 'my' && { userOnly: 'true' }),
        ...(activeTab === 'all' && { status: 'approved' })
      })

      const response = await fetch(`/api/testimonies-proxy?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTestimonies(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des témoignages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTestimony = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !newTestimony.title || !newTestimony.content) return

    try {
      const response = await fetch(`/api/testimonies-proxy?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newTestimony),
      })

      if (response.ok) {
        setNewTestimony({ title: '', content: '', isAnonymous: false })
        setShowAddForm(false)
        fetchTestimonies()
        alert('Témoignage soumis avec succès ! Il sera visible après validation.')
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Erreur lors de la soumission du témoignage')
    }
  }

  const handleLike = async (testimonyId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/testimonies-proxy/like?userId=${user.id}&testimonyId=${testimonyId}`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        fetchTestimonies()
      }
    } catch (error) {
      console.error('Erreur lors du like:', error)
    }
  }

  const fetchComments = async (testimonyId: string) => {
    try {
      const response = await fetch(`/api/testimonies-proxy/comments?testimonyId=${testimonyId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setComments(prev => ({ ...prev, [testimonyId]: data }))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error)
    }
  }

  const handleAddComment = async (testimonyId: string) => {
    if (!user?.id || !newComment.trim()) return

    try {
      const response = await fetch(`/api/testimonies-proxy/comments?userId=${user.id}&testimonyId=${testimonyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment('')
        fetchComments(testimonyId)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
    }
  }

  const toggleComments = (testimonyId: string) => {
    if (expandedComments === testimonyId) {
      setExpandedComments(null)
    } else {
      setExpandedComments(testimonyId)
      if (!comments[testimonyId]) {
        fetchComments(testimonyId)
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
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
    <div className="p-2 md:p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header - Compact mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Témoignages</h1>
          <p className="text-xs md:text-sm lg:text-base text-gray-600 mt-1 md:mt-2">Découvrez comment Dieu agit</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-xs md:text-sm py-2 md:py-2.5"
        >
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Partager
        </Button>
      </div>

      {/* Tabs - Responsive */}
      <div className="flex space-x-1 mb-4 md:mb-6 bg-gray-100 p-1 rounded-lg w-full">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-3 sm:py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
            activeTab === 'all' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mes témoignages
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <Card className="mb-6 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Partager votre témoignage</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTestimony} className="space-y-4">
              <div>
                <Input
                  placeholder="Titre du témoignage"
                  value={newTestimony.title}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Racontez votre témoignage..."
                  value={newTestimony.content}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newTestimony.isAnonymous}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Publier de manière anonyme
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 py-3 text-base">
                  Soumettre pour validation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="py-3 text-base"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des témoignages */}
      <div className="space-y-6">
        {testimonies.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'all' ? 'Aucun témoignage publié' : 'Vous n\'avez pas encore de témoignage'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? 'Les témoignages apparaîtront ici après validation.' 
                    : 'Partagez votre première expérience avec Dieu.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          testimonies.map((testimony) => (
            <Card key={testimony.id} className={`${
              testimony.status === 'PENDING' 
                ? 'border-yellow-200 bg-yellow-50' 
                : 'border-gray-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {testimony.userName}
                      </p>
                      {testimony.status === 'PENDING' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(testimony.testimonyDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{testimony.viewCount}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {testimony.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {testimony.content}
                  </p>
                </div>
                
                {testimony.status === 'APPROVED' && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleLike(testimony.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Heart className="h-5 w-5" />
                        <span>{testimony.likeCount}</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(testimony.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>{testimony.commentCount}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Section commentaires */}
                {expandedComments === testimony.id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-3">
                      {comments[testimony.id]?.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">{comment.user.name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Input
                        placeholder="Ajouter un commentaire..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(testimony.id)}
                      />
                      <Button
                        onClick={() => handleAddComment(testimony.id)}
                        size="sm"
                        className="px-3"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
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