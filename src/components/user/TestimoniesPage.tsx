'use client'

import { useState, useEffect } from 'react'
import { 
  MessageCircle, Star, Plus, Clock, X, Eye, Heart, Send, 
  Loader2, User, Calendar, Sparkles, ThumbsUp
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { safeFormatDate } from '@/lib/utils'

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
  hasUserLiked?: boolean
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
  const [submitting, setSubmitting] = useState(false)

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

      const response = await authenticatedFetch(`/api/testimonies-proxy?${params}`)
      if (response.ok) {
        const data = await response.json()
        const testimoniesData = data.testimonies || data.data || data
        setTestimonies(Array.isArray(testimoniesData) ? testimoniesData : [])
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
    setSubmitting(true)

    try {
      const response = await authenticatedFetch(`/api/testimonies-proxy?userId=${user.id}`, {
        method: 'POST',
        body: JSON.stringify(newTestimony),
      })

      if (response.ok) {
        setNewTestimony({ title: '', content: '', isAnonymous: false })
        setShowAddForm(false)
        fetchTestimonies()
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (testimonyId: string) => {
    if (!user?.id) return

    try {
      const response = await authenticatedFetch(`/api/testimonies-proxy/like?userId=${user.id}&testimonyId=${testimonyId}`, {
        method: 'POST'
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
      const response = await authenticatedFetch(`/api/testimonies-proxy/comments?testimonyId=${testimonyId}`)
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
      const response = await authenticatedFetch(`/api/testimonies-proxy/comments?userId=${user.id}&testimonyId=${testimonyId}`, {
        method: 'POST',
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
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-yellow-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Témoignages</h1>
          <p className="text-gray-600 mt-2">Chargement des témoignages...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Témoignages</h1>
            <p className="text-yellow-100 text-sm">Découvrez comment Dieu agit dans nos vies</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-24 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-yellow-600">{testimonies.length}</p>
            <p className="text-xs text-gray-600">Témoignages</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-amber-600">
              {testimonies.reduce((sum, t) => sum + t.likeCount, 0)}
            </p>
            <p className="text-xs text-gray-600">Amen</p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-orange-600">
              {testimonies.reduce((sum, t) => sum + t.viewCount, 0)}
            </p>
            <p className="text-xs text-gray-600">Vues</p>
          </div>
        </div>

        {/* Tabs et actions */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex bg-white rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-yellow-500 text-white shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'my' 
                  ? 'bg-yellow-500 text-white shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes témoignages
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:from-yellow-600 hover:to-amber-600 transition-all"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Partager</span>
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-yellow-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Partager votre témoignage
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTestimony} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du témoignage
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dieu a guéri mon enfant"
                  value={newTestimony.title}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Racontez votre témoignage
                </label>
                <textarea
                  placeholder="Partagez comment Dieu a agi dans votre vie..."
                  value={newTestimony.content}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newTestimony.isAnonymous}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Publier de manière anonyme
                </label>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Soumettre
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des témoignages */}
        <div className="space-y-4">
          {testimonies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'all' ? 'Aucun témoignage publié' : 'Vous n\'avez pas encore de témoignage'}
              </h3>
              <p className="text-gray-600 text-sm">
                {activeTab === 'all' 
                  ? 'Les témoignages apparaîtront ici après validation.' 
                  : 'Partagez votre première expérience avec Dieu.'}
              </p>
            </div>
          ) : (
            testimonies.map((testimony) => (
              <div 
                key={testimony.id} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                  testimony.status === 'PENDING' ? 'border-yellow-200' : 'border-gray-100'
                }`}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{testimony.userName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {safeFormatDate(testimony.testimonyDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {testimony.status === 'PENDING' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          En attente
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="h-3 w-3" />
                        {testimony.viewCount}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{testimony.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {testimony.content}
                  </p>

                  {/* Actions */}
                  {testimony.status === 'APPROVED' && (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(testimony.id)}
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            testimony.hasUserLiked 
                              ? 'text-red-500' 
                              : 'text-gray-600 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${testimony.hasUserLiked ? 'fill-current' : ''}`} />
                          <span>{testimony.likeCount} Amen</span>
                        </button>
                        <button 
                          onClick={() => toggleComments(testimony.id)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span>{testimony.commentCount}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section commentaires */}
                  {expandedComments === testimony.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-3 mb-4">
                        {comments[testimony.id]?.length > 0 ? (
                          comments[testimony.id].map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-3 rounded-xl">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm text-gray-900">{comment.user.name}</span>
                                <span className="text-xs text-gray-500">
                                  {safeFormatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">Aucun commentaire</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ajouter un commentaire..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(testimony.id)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                        />
                        <button
                          onClick={() => handleAddComment(testimony.id)}
                          className="p-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info bottom */}
        <div className="mt-6 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-800">
            ⭐ « Ils l'ont vaincu... par la parole de leur témoignage » - Apocalypse 12:11
          </p>
        </div>
      </div>
    </div>
  )
}