'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, Plus, Clock, CheckCircle, X, Send, AlertCircle, User, Calendar,
  Loader2, HeartPulse, Users, Flame, Filter
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { safeFormatDate } from '@/lib/utils'

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

const categories = [
  { id: 'GENERAL', label: 'Général' },
  { id: 'HEALTH', label: 'Santé' },
  { id: 'FAMILY', label: 'Famille' },
  { id: 'WORK', label: 'Travail' },
  { id: 'STUDIES', label: 'Études' },
  { id: 'CHURCH', label: 'Église' },
  { id: 'NATION', label: 'Nation' },
]

export default function PrayersPage() {
  const { user } = useAuth()
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'my' | 'pending'>('all')
  const [submitting, setSubmitting] = useState(false)
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    isPublic: true,
    isAnonymous: false
  })

  useEffect(() => {
    if (user) {
      fetchPrayers()
    }
  }, [user, filter])

  const fetchPrayers = async () => {
    try {
      setLoading(true)
      let url = `/api/prayers-proxy?userId=${user?.id}`
      
      if (filter === 'my') {
        url += '&userOnly=true'
      } else if (filter === 'pending') {
        url += '&status=pending'
      } else {
        url += '&status=approved'
      }

      const response = await authenticatedFetch(url)
      if (response.ok) {
        const data = await response.json()
        const prayersData = data.prayers || data.data || data
        setPrayers(Array.isArray(prayersData) ? prayersData : [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prières:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await authenticatedFetch(`/api/prayers-proxy?userId=${user?.id}`, {
        method: 'POST',
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
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrayForIntention = async (prayerId: string) => {
    if (!user?.id) return

    try {
      const response = await authenticatedFetch(`/api/prayers-proxy/support?prayerId=${prayerId}&userId=${user.id}`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchPrayers()
      }
    } catch (error) {
      console.error('Erreur lors de l\'action de prière:', error)
    }
  }

  const getCategoryInfo = (cat: string) => {
    return categories.find(c => c.id === cat) || categories[0]
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fffefa] flex items-center justify-center">
        <div className="text-center p-8">
          <HeartPulse className="h-16 w-16 text-[#cc9b00] mx-auto mb-4" />
          <p className="text-[#666]">Connectez-vous pour voir les intentions de prière</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Sujets de Prière</h1>
          <p className="text-[#666] mt-2">Chargement des intentions...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-church animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-16 bg-gray-200 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffefa]">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-[#ffc200] via-[#ffda66] to-[#fff3cc] text-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <HeartPulse className="h-8 w-8 text-[#0a0a0a]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Sujets de Prière</h1>
            <p className="text-[#0a0a0a]/70 text-sm">Partagez vos besoins, priez pour les autres</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-24 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#fff3cc] border border-[rgba(201,201,201,0.3)] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#cc9b00]">{prayers.length}</p>
            <p className="text-xs text-[#666]">Intentions</p>
          </div>
          <div className="bg-[#fff3cc] border border-[rgba(201,201,201,0.3)] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#cc9b00]">
              {prayers.reduce((sum, p) => sum + p.prayerCount, 0)}
            </p>
            <p className="text-xs text-[#666]">Prières</p>
          </div>
          <div className="bg-[#fff3cc] border border-[rgba(201,201,201,0.3)] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#cc9b00]">
              {prayers.filter(p => p.isAnswered).length}
            </p>
            <p className="text-xs text-[#666]">Exaucées</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex-1 bg-[#ffc200] hover:bg-[#cc9b00] text-[#0a0a0a] py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-church transition-all"
          >
            <Plus className="h-5 w-5" />
            Nouvelle intention
          </button>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Toutes', icon: Users },
            { key: 'my', label: 'Miennes', icon: User },
            { key: 'pending', label: 'En attente', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                filter === key
                  ? 'bg-[#ffc200] text-[#0a0a0a] shadow-church'
                  : 'bg-white text-[#666] border border-[rgba(201,201,201,0.3)] hover:border-[#cc9b00]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-church p-6 mb-6 border border-[rgba(201,201,201,0.3)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0a0a0a] flex items-center gap-2">
                <Flame className="h-5 w-5 text-[#cc9b00]" />
                Nouvelle intention de prière
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-[#fff3cc] rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-[#666]" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePrayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={newPrayer.title}
                  onChange={(e) => setNewPrayer(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Pour la guérison de ma famille"
                  className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Catégorie
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewPrayer(prev => ({ ...prev, category: cat.id }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        newPrayer.category === cat.id
                          ? 'bg-[#fff3cc] text-[#cc9b00] border-2 border-[#ffc200]'
                          : 'bg-[#f5f5f5] text-[#666] hover:bg-[#fff3cc]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Détails de votre demande
                </label>
                <textarea
                  value={newPrayer.content}
                  onChange={(e) => setNewPrayer(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Partagez votre intention de prière..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPrayer.isAnonymous}
                    onChange={(e) => setNewPrayer(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="w-4 h-4 text-[#ffc200] rounded focus:ring-[#ffc200]"
                  />
                  <span className="text-sm text-[#666]">Publier anonymement</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPrayer.isPublic}
                    onChange={(e) => setNewPrayer(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-[#ffc200] rounded focus:ring-[#ffc200]"
                  />
                  <span className="text-sm text-[#666]">Visible publiquement</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 border border-[rgba(201,201,201,0.3)] rounded-xl font-medium text-[#666] hover:bg-[#fff3cc] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#ffc200] hover:bg-[#cc9b00] text-[#0a0a0a] py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-church disabled:opacity-50"
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

        {/* Liste des prières */}
        <div className="space-y-4">
          {prayers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <AlertCircle className="h-12 w-12 text-[#999] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#0a0a0a] mb-2">Aucune intention de prière</h3>
              <p className="text-[#666] text-sm">
                {filter === 'my' ? 'Vous n\'avez pas encore partagé d\'intention.' : 
                 filter === 'pending' ? 'Aucune prière en attente de validation.' :
                 'Soyez le premier à partager une intention !'}
              </p>
            </div>
          ) : (
            prayers.map((prayer) => {
              const catInfo = getCategoryInfo(prayer.category)
              return (
                <div key={prayer.id} className="bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)] overflow-hidden hover:shadow-lg transition-all">
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#fff3cc] flex items-center justify-center">
                          <User className="h-5 w-5 text-[#cc9b00]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#0a0a0a]">
                            {prayer.isAnonymous ? 'Anonyme' : prayer.userName}
                          </p>
                          <p className="text-xs text-[#999] flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {safeFormatDate(prayer.prayerDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#fff3cc] text-[#cc9b00]">
                          {catInfo.label}
                        </span>
                        {prayer.status === 'PENDING' && (
                          <span className="px-2 py-1 bg-[#fff3cc] text-[#cc9b00] text-xs rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            En attente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-[#0a0a0a] mb-2">{prayer.title}</h3>
                    <p className="text-[#666] text-sm leading-relaxed mb-4">
                      {prayer.content}
                    </p>

                    {/* Actions */}
                    {prayer.status === 'APPROVED' && (
                      <div className="flex items-center justify-between pt-3 border-t border-[rgba(201,201,201,0.3)]">
                        <div className="flex items-center gap-1 text-sm text-[#666]">
                          <Heart className="h-4 w-4 text-[#cc9b00]" />
                          <span>{prayer.prayerCount} personne{prayer.prayerCount !== 1 ? 's' : ''} prie{prayer.prayerCount !== 1 ? 'nt' : ''}</span>
                        </div>
                        <button
                          onClick={() => handlePrayForIntention(prayer.id)}
                          className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                            prayer.hasUserPrayed
                              ? 'bg-[#fff3cc] text-[#cc9b00] hover:bg-[#ffe699]'
                              : 'bg-[#ffc200] hover:bg-[#cc9b00] text-[#0a0a0a] shadow-church'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${prayer.hasUserPrayed ? 'fill-current' : ''}`} />
                          {prayer.hasUserPrayed ? 'Je prie déjà' : 'Je prie'}
                        </button>
                      </div>
                    )}

                    {prayer.status === 'PENDING' && prayer.userId === user.id && (
                      <div className="flex items-center gap-2 p-3 bg-[#fff3cc] rounded-xl text-sm text-[#cc9b00]">
                        <Clock className="h-4 w-4" />
                        <span>Votre intention est en cours de validation</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Info bottom */}
        <div className="mt-6 bg-gradient-to-r from-[#fff3cc] to-[#ffe699] rounded-xl p-4 text-center">
          <p className="text-sm text-[#cc9b00]">
            🙏 « Priez les uns pour les autres » - Jacques 5:16
          </p>
        </div>
      </div>
    </div>
  )
}
