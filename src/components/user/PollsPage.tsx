'use client'
import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Clock, 
  Users,
  CheckCircle,
  Calendar,
  AlertCircle,
  Vote
} from 'lucide-react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { safeFormatDate } from '@/lib/utils'

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
  isActive: boolean
  isAnonymous: boolean
  allowMultiple: boolean
  expiresAt?: string
  createdAt: string
  totalVotes: number
  hasVoted: boolean
  userVotes: any[]
  isExpired: boolean
  options: PollOption[]
  creator: {
    firstName: string
    lastName: string
    role: string
  }
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [votingFor, setVotingFor] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<{ [pollId: string]: string[] }>({})

  useEffect(() => {
    loadPolls()
  }, [])

  const loadPolls = async () => {
    try {
      const response = await authenticatedFetch('/api/polls-proxy')
      
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

  const handleVote = async (pollId: string) => {
    const optionIds = selectedOptions[pollId] || []
    
    if (optionIds.length === 0) {
      alert('Veuillez sélectionner au moins une option')
      return
    }

    setVotingFor(pollId)
    
    try {
      const response = await authenticatedFetch('/api/polls-proxy/vote', {
        method: 'POST',
        body: JSON.stringify({ pollId, optionIds })
      })

      if (response.ok) {
        await loadPolls()
        setSelectedOptions(prev => ({ ...prev, [pollId]: [] }))
        alert('Votre vote a été enregistré avec succès!')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors du vote')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du vote')
    } finally {
      setVotingFor(null)
    }
  }

  const handleOptionSelect = (pollId: string, optionId: string, allowMultiple: boolean) => {
    setSelectedOptions(prev => {
      const currentSelections = prev[pollId] || []
      
      if (allowMultiple) {
        // Mode choix multiples
        if (currentSelections.includes(optionId)) {
          return {
            ...prev,
            [pollId]: currentSelections.filter(id => id !== optionId)
          }
        } else {
          return {
            ...prev,
            [pollId]: [...currentSelections, optionId]
          }
        }
      } else {
        // Mode choix unique
        return {
          ...prev,
          [pollId]: currentSelections.includes(optionId) ? [] : [optionId]
        }
      }
    })
  }

  const removeVote = async (pollId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer votre vote ?')) {
      return
    }

    try {
      const response = await authenticatedFetch(`/api/polls-proxy/vote?pollId=${pollId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadPolls()
        alert('Votre vote a été retiré avec succès')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors du retrait du vote')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du retrait du vote')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activePolls = polls.filter(poll => poll.isActive && !poll.isExpired)
  const expiredPolls = polls.filter(poll => poll.isExpired)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Sondages Communautaires</h1>
        <p className="text-gray-600">Participez aux sondages de la communauté et exprimez votre opinion</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <Vote className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{activePolls.length}</p>
          <p className="text-sm text-blue-600">Sondages actifs</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">
            {polls.filter(p => p.hasVoted).length}
          </p>
          <p className="text-sm text-green-600">Votes effectués</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">
            {polls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
          </p>
          <p className="text-sm text-purple-600">Total des votes</p>
        </div>
      </div>

      {/* Sondages actifs */}
      {activePolls.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Vote className="h-6 w-6 text-blue-600" />
            Sondages Actifs
          </h2>
          
          {activePolls.map((poll) => (
            <div key={poll.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{poll.title}</h3>
                    {poll.description && (
                      <p className="text-gray-600 mb-3">{poll.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>Par {poll.creator.firstName} {poll.creator.lastName}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {poll.totalVotes} vote{poll.totalVotes > 1 ? 's' : ''}
                      </span>
                      {poll.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Expire le {safeFormatDate(poll.expiresAt)}
                        </span>
                      )}
                    </div>
                    
                    {poll.allowMultiple && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Vous pouvez sélectionner plusieurs options
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {poll.hasVoted && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Voté</span>
                    </div>
                  )}
                </div>

                {/* Options de vote */}
                <div className="space-y-3 mb-6">
                  {poll.options.map((option) => {
                    const isSelected = (selectedOptions[poll.id] || []).includes(option.id)
                    const userVoted = poll.hasVoted
                    
                    return (
                      <div key={option.id} className="relative">
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                            userVoted 
                              ? 'bg-gray-50 cursor-default' 
                              : isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                          }`}
                          onClick={() => !userVoted && handleOptionSelect(poll.id, option.id, poll.allowMultiple)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {!userVoted && (
                                <input
                                  type={poll.allowMultiple ? "checkbox" : "radio"}
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="text-blue-600"
                                  disabled={userVoted}
                                />
                              )}
                              <span className={`font-medium ${userVoted ? 'text-gray-700' : 'text-gray-900'}`}>
                                {option.text}
                              </span>
                            </div>
                            {userVoted && (
                              <span className="text-sm text-gray-600">
                                {option.voteCount} vote{option.voteCount > 1 ? 's' : ''} ({option.percentage}%)
                              </span>
                            )}
                          </div>
                          
                          {userVoted && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  {poll.hasVoted ? (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        Merci pour votre participation ! Total: {poll.totalVotes} vote{poll.totalVotes > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => removeVote(poll.id)}
                        className="text-sm text-red-600 hover:text-red-700 underline"
                      >
                        Retirer mon vote
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleVote(poll.id)}
                        disabled={
                          !selectedOptions[poll.id] || 
                          selectedOptions[poll.id].length === 0 || 
                          votingFor === poll.id
                        }
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {votingFor === poll.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Vote className="w-4 h-4" />
                            Voter
                          </>
                        )}
                      </button>
                      {(selectedOptions[poll.id] || []).length > 0 && (
                        <span className="text-sm text-gray-600">
                          {selectedOptions[poll.id].length} option{selectedOptions[poll.id].length > 1 ? 's' : ''} sélectionnée{selectedOptions[poll.id].length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sondages expirés */}
      {expiredPolls.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-gray-600" />
            Sondages Terminés
          </h2>
          
          {expiredPolls.map((poll) => (
            <div key={poll.id} className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm overflow-hidden opacity-75">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-700">{poll.title}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Expiré
                      </span>
                    </div>
                    {poll.description && (
                      <p className="text-gray-600 mb-3">{poll.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>Par {poll.creator.firstName} {poll.creator.lastName}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {poll.totalVotes} vote{poll.totalVotes > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expiré le {safeFormatDate(poll.expiresAt, 'N/A')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Résultats finaux */}
                <div className="space-y-3">
                  {poll.options.map((option) => (
                    <div key={option.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{option.text}</span>
                        <span className="text-sm text-gray-600">
                          {option.voteCount} vote{option.voteCount > 1 ? 's' : ''} ({option.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* État vide */}
      {activePolls.length === 0 && expiredPolls.length === 0 && (
        <div className="text-center py-12">
          <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun sondage disponible</h3>
          <p className="text-gray-600">
            Il n'y a actuellement aucun sondage disponible. Revenez plus tard !
          </p>
        </div>
      )}
    </div>
  )
}