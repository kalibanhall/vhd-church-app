'use client'

import { useState, useEffect } from 'react'
import { 
  MessageCircle, Star, Plus, Clock, X, Eye, Heart, Send, 
  Loader2, User, Calendar, Sparkles
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
      console.error('[Testimonies] Error loading:', error)
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
      console.error('[Testimonies] Error submitting:', error)
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
      console.error('[Testimonies] Error liking:', error)
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
      console.error('[Testimonies] Error loading comments:', error)
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
      console.error('[Testimonies] Error adding comment:', error)
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
      <div className="min-h-screen bg-[#fffefa] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#ffc200] animate-spin mx-auto mb-4" />
          <p className="text-[#999]">Chargement des temoignages...</p>
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
            <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-7 w-7 text-[#0a0a0a]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Temoignages</h1>
            <p className="text-[#0a0a0a]/70 text-sm">Decouvrez comment Dieu agit dans nos vies</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 -mt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 shadow-church border border-[rgba(201,201,201,0.3)] text-center">
            <p className="text-xl font-bold text-[#cc9b00]">{testimonies.length}</p>
            <p className="text-xs text-[#999]">Temoignages</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-church border border-[rgba(201,201,201,0.3)] text-center">
            <p className="text-xl font-bold text-[#cc9b00]">
              {testimonies.reduce((sum, t) => sum + t.likeCount, 0)}
            </p>
            <p className="text-xs text-[#999]">Amen</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-church border border-[rgba(201,201,201,0.3)] text-center">
            <p className="text-xl font-bold text-[#cc9b00]">
              {testimonies.reduce((sum, t) => sum + t.viewCount, 0)}
            </p>
            <p className="text-xs text-[#999]">Vues</p>
          </div>
        </div>

        {/* Tabs et actions */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex bg-white rounded-xl p-1 shadow-church border border-[rgba(201,201,201,0.3)]">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-[#ffc200] text-[#0a0a0a]' 
                  : 'text-[#666] hover:text-[#0a0a0a]'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'my' 
                  ? 'bg-[#ffc200] text-[#0a0a0a]' 
                  : 'text-[#666] hover:text-[#0a0a0a]'
              }`}
            >
              Mes temoignages
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#ffc200] hover:bg-[#ffda66] text-[#0a0a0a] px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-church transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Partager</span>
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)] p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[#0a0a0a] flex items-center gap-2">
                <Star className="h-5 w-5 text-[#cc9b00]" />
                Partager votre temoignage
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-[#fffefa] rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-[#999]" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTestimony} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Titre du temoignage
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dieu a gueri mon enfant"
                  value={newTestimony.title}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] bg-[#fffefa]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Racontez votre temoignage
                </label>
                <textarea
                  placeholder="Partagez comment Dieu a agi dans votre vie..."
                  value={newTestimony.content}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] bg-[#fffefa]"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newTestimony.isAnonymous}
                  onChange={(e) => setNewTestimony(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="w-4 h-4 text-[#ffc200] rounded focus:ring-[#ffc200] border-[rgba(201,201,201,0.3)]"
                />
                <label htmlFor="anonymous" className="text-sm text-[#666]">
                  Publier de maniere anonyme
                </label>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-[rgba(201,201,201,0.3)] rounded-lg font-medium text-[#666] hover:bg-[#fffefa] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#ffc200] hover:bg-[#ffda66] text-[#0a0a0a] py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
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

        {/* Liste des temoignages */}
        <div className="space-y-4">
          {testimonies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)]">
              <div className="w-16 h-16 bg-[#fff3cc] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-[#cc9b00]" />
              </div>
              <h3 className="font-medium text-[#0a0a0a] mb-2">
                {activeTab === 'all' ? 'Aucun temoignage publie' : 'Vous n\'avez pas encore de temoignage'}
              </h3>
              <p className="text-sm text-[#999]">
                {activeTab === 'all' 
                  ? 'Les temoignages apparaitront ici apres validation.' 
                  : 'Partagez votre premiere experience avec Dieu.'}
              </p>
            </div>
          ) : (
            testimonies.map((testimony) => (
              <div 
                key={testimony.id} 
                className={`bg-white rounded-xl shadow-church border overflow-hidden hover:border-[#ffc200]/50 transition-all ${
                  testimony.status === 'PENDING' ? 'border-[#ffc200]' : 'border-[rgba(201,201,201,0.3)]'
                }`}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffc200] to-[#cc9b00] flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0a0a0a]">{testimony.userName}</p>
                        <p className="text-xs text-[#999] flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {safeFormatDate(testimony.testimonyDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {testimony.status === 'PENDING' && (
                        <span className="px-2 py-1 bg-[#fff3cc] text-[#cc9b00] text-xs rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          En attente
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-[#999]">
                        <Eye className="h-3 w-3" />
                        {testimony.viewCount}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-[#0a0a0a] text-lg mb-2">{testimony.title}</h3>
                  <p className="text-[#666] text-sm leading-relaxed mb-4">
                    {testimony.content}
                  </p>

                  {/* Actions */}
                  {testimony.status === 'APPROVED' && (
                    <div className="flex items-center justify-between pt-3 border-t border-[rgba(201,201,201,0.2)]">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(testimony.id)}
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            testimony.hasUserLiked 
                              ? 'text-[#cc9b00]' 
                              : 'text-[#666] hover:text-[#cc9b00]'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${testimony.hasUserLiked ? 'fill-current' : ''}`} />
                          <span>{testimony.likeCount} Amen</span>
                        </button>
                        <button 
                          onClick={() => toggleComments(testimony.id)}
                          className="flex items-center gap-2 text-sm text-[#666] hover:text-[#cc9b00] transition-colors"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span>{testimony.commentCount}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section commentaires */}
                  {expandedComments === testimony.id && (
                    <div className="mt-4 pt-4 border-t border-[rgba(201,201,201,0.2)]">
                      <div className="space-y-3 mb-4">
                        {comments[testimony.id]?.length > 0 ? (
                          comments[testimony.id].map((comment) => (
                            <div key={comment.id} className="bg-[#fffefa] p-3 rounded-lg border border-[rgba(201,201,201,0.2)]">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm text-[#0a0a0a]">{comment.user.name}</span>
                                <span className="text-xs text-[#999]">
                                  {safeFormatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-[#666]">{comment.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-[#999] text-center py-2">Aucun commentaire</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ajouter un commentaire..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(testimony.id)}
                          className="flex-1 px-4 py-2 border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] bg-[#fffefa] text-sm"
                        />
                        <button
                          onClick={() => handleAddComment(testimony.id)}
                          className="p-2 bg-[#ffc200] hover:bg-[#ffda66] text-[#0a0a0a] rounded-lg transition-colors"
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
        <div className="mt-6 bg-[#fff3cc] rounded-xl p-4 text-center border border-[rgba(201,201,201,0.2)]">
          <p className="text-sm text-[#cc9b00]">
            Ils l'ont vaincu... par la parole de leur temoignage - Apocalypse 12:11
          </p>
        </div>
      </div>
    </div>
  )
}
