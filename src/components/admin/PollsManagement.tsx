'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Plus, 
  BarChart, 
  Settings, 
  Trash2, 
  Clock, 
  Users,
  PieChart,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface PollOption {
  id: string
  text: string
  order: number
  voteCount: number
  percentage: number
}

interface Poll {
  id: string
  title: string
  description?: string
  creatorId: string
  isActive: boolean
  isAnonymous: boolean
  allowMultiple: boolean
  expiresAt?: string
  createdAt: string
  totalVotes: number
  hasVoted: boolean
  isExpired: boolean
  options: PollOption[]
  creator: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
}

export default function PollsManagement() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    isAnonymous: false,
    allowMultiple: false,
    expiresAt: ''
  })

  useEffect(() => {
    loadPolls()
  }, [])

  const loadPolls = async () => {
    try {
      const response = await authenticatedFetch('/api/polls-proxy?includeExpired=true')
      
      if (response.ok) {
        const data = await response.json()
        setPolls(data.polls || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sondages:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filtrer les options vides
    const validOptions = formData.options.filter(option => option.trim() !== '')
    
    if (validOptions.length < 2) {
      alert('Veuillez fournir au moins 2 options')
      return
    }

    try {
      const response = await authenticatedFetch('/api/polls-proxy', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          options: validOptions,
          expiresAt: formData.expiresAt || null
        })
      })

      if (response.ok) {
        await loadPolls()
        setShowCreateForm(false)
        setFormData({
          title: '',
          description: '',
          options: ['', ''],
          isAnonymous: false,
          allowMultiple: false,
          expiresAt: ''
        })
        alert('Sondage créé avec succès!')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la création du sondage')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création du sondage')
    }
  }

  const togglePollStatus = async (pollId: string, currentStatus: boolean) => {
    try {
      const response = await authenticatedFetch(`/api/polls-proxy/${pollId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        await loadPolls()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la modification du sondage')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la modification du sondage')
    }
  }

  const deletePoll = async (pollId: string, pollTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le sondage "${pollTitle}" ? Cette action est irréversible.`)) {
      return
    }

    try {
      const response = await authenticatedFetch(`/api/polls-proxy/${pollId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadPolls()
        alert('Sondage supprimé avec succès')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression du sondage')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression du sondage')
    }
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }))
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffc200]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Gestion des Sondages</h1>
          <p className="text-gray-600 mt-2">Créez et gérez les sondages de la communauté</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#ffc200] hover:bg-[#cc9b00] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Sondage
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-[#cc9b00]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sondages</p>
                <p className="text-2xl font-bold text-gray-900">{polls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(p => p.isActive && !p.isExpired).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expirés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(p => p.isExpired).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des sondages */}
      <div className="space-y-4">
        {polls.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun sondage</h3>
              <p className="text-gray-600 mb-4">Créez votre premier sondage pour engager la communauté</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#ffc200] hover:bg-[#cc9b00] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un sondage
              </Button>
            </CardContent>
          </Card>
        ) : (
          polls.map((poll) => (
            <Card key={poll.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{poll.title}</CardTitle>
                      <div className="flex gap-1">
                        {poll.isActive && !poll.isExpired && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Actif
                          </span>
                        )}
                        {poll.isExpired && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Expiré
                          </span>
                        )}
                        {!poll.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Inactif
                          </span>
                        )}
                        {poll.isAnonymous && (
                          <span className="px-2 py-1 text-xs font-medium bg-[#fff3cc] text-[#3d3200] rounded-full">
                            Anonyme
                          </span>
                        )}
                        {poll.allowMultiple && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Choix multiples
                          </span>
                        )}
                      </div>
                    </div>
                    {poll.description && (
                      <p className="text-gray-600 text-sm mb-2">{poll.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Par {poll.creator.firstName} {poll.creator.lastName}</span>
                      <span>{poll.totalVotes} vote{poll.totalVotes > 1 ? 's' : ''}</span>
                      <span>{new Date(poll.createdAt).toLocaleDateString('fr-FR')}</span>
                      {poll.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expire le {new Date(poll.expiresAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPoll(poll)}
                    >
                      <BarChart className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePollStatus(poll.id, poll.isActive)}
                      className={poll.isActive ? 'text-red-600' : 'text-green-600'}
                    >
                      {poll.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePoll(poll.id, poll.title)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {poll.options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option.text}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#ffc200] h-2 rounded-full"
                            style={{ width: `${option.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {option.percentage}%
                        </span>
                        <span className="text-sm text-gray-600 w-8 text-right">
                          ({option.voteCount})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de création */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Créer un nouveau sondage</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createPoll} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre du sondage</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Entrez le titre du sondage"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (optionnelle)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez le contexte du sondage"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Options de réponse</label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {formData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeOption(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une option
                  </Button>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isAnonymous" className="text-sm font-medium">
                      Sondage anonyme
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowMultiple"
                      checked={formData.allowMultiple}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowMultiple: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="allowMultiple" className="text-sm font-medium">
                      Choix multiples
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date d'expiration (optionnelle)</label>
                  <Input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#ffc200] hover:bg-[#cc9b00] text-white"
                  >
                    Créer le sondage
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </div>
      )}

      {/* Modal des détails */}
      {selectedPoll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedPoll.title}</CardTitle>
                  {selectedPoll.description && (
                    <p className="text-gray-600 mt-2">{selectedPoll.description}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPoll(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-[#fffefa] rounded-lg">
                  <Users className="h-8 w-8 text-[#cc9b00] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#cc9b00]">{selectedPoll.totalVotes}</p>
                  <p className="text-sm text-gray-600">Total des votes</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {selectedPoll.isActive && !selectedPoll.isExpired ? 'Actif' : 'Inactif'}
                  </p>
                  <p className="text-sm text-gray-600">Statut</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-orange-600">
                    {selectedPoll.expiresAt 
                      ? new Date(selectedPoll.expiresAt).toLocaleDateString('fr-FR')
                      : 'Pas d\'expiration'
                    }
                  </p>
                  <p className="text-sm text-gray-600">Expiration</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Résultats détaillés</h3>
                {selectedPoll.options.map((option, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{option.text}</span>
                      <span className="text-sm text-gray-600">
                        {option.voteCount} vote{option.voteCount > 1 ? 's' : ''} ({option.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-[#ffc200] h-3 rounded-full transition-all duration-300"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </div>
      )}
    </div>
  )
}