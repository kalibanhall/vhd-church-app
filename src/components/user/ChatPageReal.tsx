/**
 * =============================================================================
 * DISCUSSION - MESSAGERIE ENTRE MEMBRES
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Module de messagerie privee entre membres de l'eglise.
 * - Liste des membres avec statut en ligne (vert) / hors ligne (orange)
 * - Conversations privees 1-1
 * - Notifications integrees
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  MessageCircle, 
  Send, 
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  User,
  Circle,
  Clock
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner, { InlineLoader } from '@/components/ui/LoadingSpinner'

// Types
interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isOnline: boolean
  lastSeen?: string
  unreadCount: number
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
}

interface Conversation {
  id: string
  participantId: string
  participant: Member
  lastMessage?: Message
  unreadCount: number
}

const ChatPageReal: React.FC = () => {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [activeTab, setActiveTab] = useState<'conversations' | 'members'>('conversations')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Charger les membres
  const loadMembers = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/chat-proxy?type=members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('[Chat] Erreur chargement membres:', error)
    }
  }, [])

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/chat-proxy?type=conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('[Chat] Erreur chargement conversations:', error)
    }
  }, [])

  // Charger les messages d'une conversation
  const loadMessages = async (memberId: string) => {
    setLoadingMessages(true)
    try {
      const response = await authenticatedFetch(`/api/chat-proxy?type=messages&memberId=${memberId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        
        // Marquer comme lus
        await authenticatedFetch('/api/chat-proxy', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark-read', memberId })
        })
        
        // Mettre à jour le compteur local
        setConversations(prev => prev.map(c => 
          c.participantId === memberId ? { ...c, unreadCount: 0 } : c
        ))
      }
    } catch (error) {
      console.error('[Chat] Erreur chargement messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMember || sending) return

    setSending(true)
    try {
      const response = await authenticatedFetch('/api/chat-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          receiverId: selectedMember.id,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
        scrollToBottom()
        loadConversations() // Actualiser la liste
      }
    } catch (error) {
      console.error('[Chat] Erreur envoi message:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Sélectionner un membre pour discuter
  const selectMember = (member: Member) => {
    setSelectedMember(member)
    loadMessages(member.id)
    setActiveTab('conversations')
  }

  // Retourner à la liste
  const goBack = () => {
    setSelectedMember(null)
    setMessages([])
  }

  // Formatage du temps
  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Jamais connecte'
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'A l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Chargement initial
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadMembers(), loadConversations()])
      setLoading(false)
    }
    init()
  }, [loadMembers, loadConversations])

  // Polling pour les nouveaux messages
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations()
      if (selectedMember) {
        loadMessages(selectedMember.id)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedMember, loadConversations])

  // Auto-scroll
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Gestion de la touche Entree
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Filtrer les membres
  const filteredMembers = members.filter(m => 
    m.id !== user?.id && 
    (`${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Calcul du total des messages non lus
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  if (loading) {
    return <LoadingSpinner size="md" text="Chargement des discussions..." />
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-[#fffefa] rounded-xl overflow-hidden border border-[rgba(201,201,201,0.3)] shadow-church">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ffc200] via-[#ffda66] to-[#fff3cc] p-3 md:p-4 text-[#0a0a0a]">
        <div className="flex items-center justify-between">
          {selectedMember ? (
            <>
              <button 
                onClick={goBack}
                className="md:hidden p-1.5 hover:bg-white/20 rounded-lg mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/30 rounded-full flex items-center justify-center text-sm md:text-base font-medium">
                    {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-[#ffc200] ${
                    selectedMember.isOnline ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-sm md:text-base truncate">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h2>
                  <p className="text-xs text-[#cc9b00] truncate">
                    {selectedMember.isOnline ? 'En ligne' : formatLastSeen(selectedMember.lastSeen)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div>
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                Discussion
              </h1>
              <p className="text-xs md:text-sm text-[#cc9b00]">
                Messagerie privee entre membres
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Liste des conversations/membres - Cachee sur mobile si conversation ouverte */}
        <div className={`${selectedMember ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-[rgba(201,201,201,0.3)] bg-white`}>
          {/* Onglets */}
          <div className="flex border-b border-[rgba(201,201,201,0.3)]">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium transition-colors ${
                activeTab === 'conversations' 
                  ? 'text-[#cc9b00] border-b-2 border-[#ffc200] bg-[#fff3cc]' 
                  : 'text-[#666] hover:text-[#0a0a0a]'
              }`}
            >
              Conversations
              {totalUnread > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium transition-colors ${
                activeTab === 'members' 
                  ? 'text-[#cc9b00] border-b-2 border-[#ffc200] bg-[#fff3cc]' 
                  : 'text-[#666] hover:text-[#0a0a0a]'
              }`}
            >
              Membres ({members.length})
            </button>
          </div>

          {/* Recherche */}
          <div className="p-2 md:p-3 border-b border-[rgba(201,201,201,0.3)]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#999]" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 md:py-2 text-sm border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'conversations' ? (
              conversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageCircle className="h-10 w-10 md:h-12 md:w-12 text-[#999] mx-auto mb-3" />
                  <p className="text-[#666] text-sm">Aucune conversation</p>
                  <p className="text-[#999] text-xs mt-1">
                    Selectionnez un membre pour demarrer
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[rgba(201,201,201,0.3)]">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => selectMember(conv.participant)}
                      className={`w-full p-2.5 md:p-3 flex items-center gap-2.5 md:gap-3 hover:bg-[#fffefa] transition-colors text-left ${
                        selectedMember?.id === conv.participantId ? 'bg-[#fff3cc]' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#ffc200] to-[#cc9b00] rounded-full flex items-center justify-center text-white text-sm md:text-base font-medium">
                          {conv.participant.firstName[0]}{conv.participant.lastName[0]}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          conv.participant.isOnline ? 'bg-green-500' : 'bg-orange-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#0a0a0a] text-sm truncate">
                            {conv.participant.firstName} {conv.participant.lastName}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs text-[#999] flex-shrink-0 ml-2">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-[#666] truncate pr-2">
                            {conv.lastMessage?.content || 'Nouvelle conversation'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-[#ffc200] text-[#0a0a0a] text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              filteredMembers.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <User className="h-10 w-10 md:h-12 md:w-12 text-[#999] mx-auto mb-3" />
                  <p className="text-[#666] text-sm">Aucun membre trouve</p>
                </div>
              ) : (
                <div className="divide-y divide-[rgba(201,201,201,0.3)]">
                  {filteredMembers.map(member => (
                    <button
                      key={member.id}
                      onClick={() => selectMember(member)}
                      className="w-full p-2.5 md:p-3 flex items-center gap-2.5 md:gap-3 hover:bg-[#fffefa] transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#999] to-[#666] rounded-full flex items-center justify-center text-white text-sm md:text-base font-medium">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          member.isOnline ? 'bg-green-500' : 'bg-orange-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-[#0a0a0a] text-sm block truncate">
                          {member.firstName} {member.lastName}
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${
                          member.isOnline ? 'text-green-600' : 'text-[#999]'
                        }`}>
                          <Circle className={`h-2 w-2 ${member.isOnline ? 'fill-green-500' : 'fill-orange-400'}`} />
                          {member.isOnline ? 'En ligne' : formatLastSeen(member.lastSeen)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className={`${selectedMember ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#fffefa]`}>
          {selectedMember ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-[#ffc200]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-[#999] mx-auto mb-3" />
                    <p className="text-[#666] text-sm">Aucun message</p>
                    <p className="text-[#999] text-xs">Commencez la conversation !</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.senderId === user?.id
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] md:max-w-[70%] ${
                          isMe 
                            ? 'bg-[#ffc200] text-[#0a0a0a] rounded-l-xl rounded-tr-xl' 
                            : 'bg-white text-[#0a0a0a] rounded-r-xl rounded-tl-xl shadow-church'
                        } px-3 py-2`}>
                          <p className="text-sm break-words">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            isMe ? 'text-[#cc9b00]' : 'text-[#999]'
                          }`}>
                            <span className="text-xs">{formatTime(message.createdAt)}</span>
                            {isMe && (
                              message.read 
                                ? <CheckCheck className="h-3 w-3" />
                                : <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="bg-white border-t border-[rgba(201,201,201,0.3)] p-2 md:p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ecrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="flex-1 px-3 py-2 text-sm border border-[rgba(201,201,201,0.3)] rounded-full focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="p-2 bg-[#ffc200] text-[#0a0a0a] rounded-full hover:bg-[#cc9b00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 bg-[#fff3cc] rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-10 w-10 text-[#ffc200]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">
                Bienvenue dans Discussion
              </h3>
              <p className="text-[#666] text-sm max-w-sm">
                Selectionnez un membre dans la liste pour demarrer une conversation privee.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPageReal

