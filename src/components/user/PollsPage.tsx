'use client'
import { useState, useEffect } from 'react'
import { 
  Vote,
  Clock, 
  Users,
  CheckCircle,
  Calendar,
  AlertCircle,
  Loader2,
  User,
  ChevronRight,
  X,
  Trophy
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

// Mock data congolais pour démonstration
const mockPolls: Poll[] = [
  {
    id: '1',
    title: 'Horaire du culte de dimanche',
    description: 'Quel horaire préférez-vous pour le culte dominical?',
    isActive: true,
    isAnonymous: false,
    allowMultiple: false,
    expiresAt: '2026-01-20T23:59:59Z',
    createdAt: '2026-01-05T10:00:00Z',
    totalVotes: 45,
    hasVoted: false,
    userVotes: [],
    isExpired: false,
    options: [
      { id: 'opt1', text: '8h00 - 11h00', order: 1, voteCount: 18, percentage: 40 },
      { id: 'opt2', text: '9h00 - 12h00', order: 2, voteCount: 20, percentage: 44 },
      { id: 'opt3', text: '10h00 - 13h00', order: 3, voteCount: 7, percentage: 16 }
    ],
    creator: { firstName: 'Pasteur', lastName: 'Mukendi', role: 'PASTOR' }
  },
  {
    id: '2',
    title: 'Lieu de la retraite annuelle',
    description: 'Votez pour le lieu de notre prochaine retraite spirituelle',
    isActive: true,
    isAnonymous: true,
    allowMultiple: true,
    expiresAt: '2026-01-25T23:59:59Z',
    createdAt: '2026-01-08T14:00:00Z',
    totalVotes: 32,
    hasVoted: true,
    userVotes: [{ optionId: 'opt4' }],
    isExpired: false,
    options: [
      { id: 'opt4', text: 'Kinkole - Au bord du fleuve', order: 1, voteCount: 15, percentage: 47 },
      { id: 'opt5', text: 'Mont Ngaliema', order: 2, voteCount: 10, percentage: 31 },
      { id: 'opt6', text: 'Maluku - Centre de retraite', order: 3, voteCount: 7, percentage: 22 }
    ],
    creator: { firstName: 'Diacre', lastName: 'Kabongo', role: 'DEACON' }
  },
  {
    id: '3',
    title: 'Thème de la convention 2026',
    description: 'Choisissez le thème de notre grande convention annuelle',
    isActive: false,
    isAnonymous: false,
    allowMultiple: false,
    expiresAt: '2025-12-31T23:59:59Z',
    createdAt: '2025-12-15T09:00:00Z',
    totalVotes: 78,
    hasVoted: true,
    userVotes: [{ optionId: 'opt8' }],
    isExpired: true,
    options: [
      { id: 'opt7', text: 'La Foi qui déplace les montagnes', order: 1, voteCount: 28, percentage: 36 },
      { id: 'opt8', text: 'Marchons dans la lumière', order: 2, voteCount: 35, percentage: 45 },
      { id: 'opt9', text: 'Ensemble pour le Royaume', order: 3, voteCount: 15, percentage: 19 }
    ],
    creator: { firstName: 'Sœur', lastName: 'Mbuyi', role: 'MEMBER' }
  }
]

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
        setPolls(data.polls && data.polls.length > 0 ? data.polls : mockPolls)
      } else {
        setPolls(mockPolls)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sondages:', error)
      setPolls(mockPolls)
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

  // État de chargement
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sondages</h1>
          <p className="text-gray-600 mt-2">Chargement des sondages...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded-lg" />
                <div className="h-10 bg-gray-200 rounded-lg" />
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const activePolls = polls.filter(poll => poll.isActive && !poll.isExpired)
  const expiredPolls = polls.filter(poll => poll.isExpired)
  const votedPolls = polls.filter(poll => poll.hasVoted)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffefa] via-[#fff3cc] to-[#fffefa]">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-[#ffc200] via-[#e6af00] to-[#cc9b00] text-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Vote className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Sondages</h1>
            <p className="text-[#3d3200] text-sm">Donnez votre avis sur les décisions de l'église</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-24 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-[#ffc200]">
            <p className="text-2xl font-bold text-[#cc9b00]">{activePolls.length}</p>
            <p className="text-xs text-gray-600">Actifs</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-green-100">
            <p className="text-2xl font-bold text-green-600">{votedPolls.length}</p>
            <p className="text-xs text-gray-600">Votés</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-gray-600">{expiredPolls.length}</p>
            <p className="text-xs text-gray-600">Terminés</p>
          </div>
        </div>

        {/* Sondages actifs */}
        {activePolls.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#fff3cc] flex items-center justify-center">
                <Vote className="h-4 w-4 text-[#cc9b00]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sondages Actifs</h2>
            </div>
            
            <div className="space-y-4">
              {activePolls.map((poll) => (
                <div key={poll.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header du sondage */}
                  <div className="p-4 border-b border-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">{poll.title}</h3>
                      {poll.hasVoted && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Voté
                        </span>
                      )}
                    </div>
                    {poll.description && (
                      <p className="text-sm text-gray-600 mb-3">{poll.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {poll.creator.firstName} {poll.creator.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {poll.totalVotes} vote{poll.totalVotes > 1 ? 's' : ''}
                      </span>
                      {poll.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expire le {safeFormatDate(poll.expiresAt)}
                        </span>
                      )}
                      {poll.isAnonymous && (
                        <span className="bg-[#fff3cc] text-[#cc9b00] px-2 py-0.5 rounded-full">
                          Anonyme
                        </span>
                      )}
                    </div>
                    
                    {poll.allowMultiple && !poll.hasVoted && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-[#cc9b00] bg-[#fff3cc] px-3 py-2 rounded-lg">
                        <AlertCircle className="w-3 h-3" />
                        <span>Choix multiples autorisés</span>
                      </div>
                    )}
                  </div>

                  {/* Options de vote */}
                  <div className="p-4 space-y-2">
                    {poll.options.map((option) => {
                      const isSelected = (selectedOptions[poll.id] || []).includes(option.id)
                      const userVoted = poll.hasVoted
                      const isWinning = userVoted && option.percentage === Math.max(...poll.options.map(o => o.percentage))
                      
                      return (
                        <div 
                          key={option.id}
                          onClick={() => !userVoted && handleOptionSelect(poll.id, option.id, poll.allowMultiple)}
                          className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                            userVoted 
                              ? 'cursor-default' 
                              : 'cursor-pointer hover:shadow-md'
                          } ${
                            isSelected && !userVoted
                              ? 'ring-2 ring-[#ffc200] ring-offset-1' 
                              : ''
                          }`}
                        >
                          {/* Barre de progression en background */}
                          {userVoted && (
                            <div 
                              className={`absolute inset-0 ${isWinning ? 'bg-[#fff3cc]' : 'bg-gray-100'}`}
                              style={{ width: `${option.percentage}%` }}
                            />
                          )}
                          
                          <div className={`relative flex items-center justify-between p-3 ${
                            !userVoted 
                              ? isSelected 
                                ? 'bg-[#fff3cc] border-2 border-[#ffc200]' 
                                : 'bg-gray-50 border-2 border-gray-200'
                              : 'border-2 border-transparent'
                          } rounded-lg`}>
                            <div className="flex items-center gap-3">
                              {!userVoted && (
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'border-[#cc9b00] bg-[#ffc200]' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && <CheckCircle className="w-3 h-3 text-[#0a0a0a]" />}
                                </div>
                              )}
                              <span className={`text-sm font-medium ${
                                isWinning ? 'text-[#5c4d00]' : 'text-gray-700'
                              }`}>
                                {option.text}
                              </span>
                            </div>
                            {userVoted && (
                              <span className={`text-sm font-semibold ${
                                isWinning ? 'text-[#cc9b00]' : 'text-gray-500'
                              }`}>
                                {option.percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4">
                    {poll.hasVoted ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Total: {poll.totalVotes} vote{poll.totalVotes > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => removeVote(poll.id)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Retirer mon vote
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        {(selectedOptions[poll.id] || []).length > 0 && (
                          <span className="text-xs text-[#cc9b00]">
                            {selectedOptions[poll.id].length} sélectionné{selectedOptions[poll.id].length > 1 ? 's' : ''}
                          </span>
                        )}
                        <button
                          onClick={() => handleVote(poll.id)}
                          disabled={
                            !selectedOptions[poll.id] || 
                            selectedOptions[poll.id].length === 0 || 
                            votingFor === poll.id
                          }
                          className="ml-auto bg-gradient-to-r from-[#ffc200] to-[#cc9b00] text-[#0a0a0a] px-6 py-2 rounded-lg hover:from-[#e6af00] hover:to-[#cc9b00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                        >
                          {votingFor === poll.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Vote className="w-4 h-4" />
                              Voter
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sondages terminés */}
        {expiredPolls.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sondages Terminés</h2>
            </div>
            
            <div className="space-y-4">
              {expiredPolls.map((poll) => (
                <div key={poll.id} className="bg-white/80 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-700 flex-1">{poll.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Terminé
                      </span>
                    </div>
                    {poll.description && (
                      <p className="text-sm text-gray-500 mb-3">{poll.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {poll.creator.firstName} {poll.creator.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {poll.totalVotes} vote{poll.totalVotes > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Clos le {safeFormatDate(poll.expiresAt, 'N/A')}
                      </span>
                    </div>
                  </div>

                  {/* Résultats */}
                  <div className="p-4 space-y-2">
                    {poll.options.map((option) => {
                      const isWinning = option.percentage === Math.max(...poll.options.map(o => o.percentage))
                      
                      return (
                        <div key={option.id} className="relative rounded-lg overflow-hidden">
                          <div 
                            className={`absolute inset-0 ${isWinning ? 'bg-green-100' : 'bg-gray-100'}`}
                            style={{ width: `${option.percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between p-3">
                            <span className={`text-sm font-medium ${
                              isWinning ? 'text-green-800' : 'text-gray-600'
                            }`}>
                              {option.text}
                              {isWinning && <span className="ml-2"><Trophy className="h-4 w-4 inline text-amber-500" /></span>}
                            </span>
                            <span className={`text-sm font-semibold ${
                              isWinning ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {option.voteCount} ({option.percentage}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* État vide */}
        {activePolls.length === 0 && expiredPolls.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Vote className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun sondage disponible</h3>
            <p className="text-gray-600 text-sm">
              Il n'y a actuellement aucun sondage. Revenez plus tard pour participer aux décisions de l'église !
            </p>
          </div>
        )}

        {/* Info bottom */}
        <div className="mt-6 bg-gradient-to-r from-[#fff3cc] to-[#fffefa] rounded-xl p-4 border border-[#ffc200]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffda66] flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-[#cc9b00]" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Votre voix compte!</h4>
              <p className="text-sm text-gray-600">
                Participez aux sondages pour aider la communauté à prendre les meilleures décisions. 
                Vos votes sont importants pour l'avenir de notre église.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}