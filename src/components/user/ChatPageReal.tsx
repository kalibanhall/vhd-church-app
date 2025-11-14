'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, 
  Send, 
  Users, 
  Hash,
  Megaphone,
  Search,
  Plus,
  Settings,
  Smile,
  Heart,
  ThumbsUp,
  Trash2,
  UserMinus,
  Lock,
  Unlock,
  MoreVertical,
  Shield,
  Clock
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface Channel {
  id: string
  name: string
  description?: string
  type: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  members: Array<{
    id: string
    userId: string
    role: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      role: string
    }
  }>
  messages: Array<{
    id: string
    senderId: string
    content: string
    messageType: string
    createdAt: string
    isEdited: boolean
    sender: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    reactions: Array<{
      id: string
      emoji: string
      user: {
        id: string
        firstName: string
        lastName: string
      }
    }>
  }>
}

interface Message {
  id: string
  senderId: string
  content: string
  messageType: string
  createdAt: string
  isEdited: boolean
  sender: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  reactions: Array<{
    id: string
    emoji: string
    user: {
      id: string
      firstName: string
      lastName: string
    }
  }>
}

const ChatPageReal: React.FC = () => {
  const { user } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelType, setNewChannelType] = useState('PUBLIC')
  const [showMembers, setShowMembers] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  // États pour les options d'expiration des messages (Admin uniquement)
  const [showExpirationSettings, setShowExpirationSettings] = useState(false)
  const [expirationConfig, setExpirationConfig] = useState({
    isEnabled: false,
    defaultDurationHours: 24,
    autoDelete: false
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Afficher une notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000) // Auto-dismiss après 4 secondes
  }

  // Charger les canaux
  const loadChannels = async () => {
    try {
      const response = await authenticatedFetch('/api/chat')

      if (response.ok) {
        const channelsData = await response.json()
        setChannels(channelsData)
        
        // Sélectionner le premier canal par défaut
        if (channelsData.length > 0 && !selectedChannel) {
          loadChannelMessages(channelsData[0])
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des canaux:', error)
    }
  }

  // Créer un nouveau canal
  const createChannel = async () => {
    if (!newChannelName.trim()) return

    try {
      const response = await authenticatedFetch('/api/chat', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'create_channel',
          name: newChannelName.trim(),
          description: newChannelDescription.trim(),
          type: newChannelType,
          memberIds: []
        })
      })

      if (response.ok) {
        const newChannel = await response.json()
        setChannels(prev => [...prev, newChannel])
        setNewChannelName('')
        setNewChannelDescription('')
        setNewChannelType('PUBLIC')
        setShowCreateChannel(false)
        loadChannelMessages(newChannel)
      } else {
        const error = await response.json()
        alert('Erreur lors de la création du canal: ' + error.error)
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création du canal')
    }
  }

  // Retirer un membre du canal
  const removeMember = async (channelId: string, memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre du canal ?')) {
      return
    }

    try {
      const response = await authenticatedFetch('/api/chat', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'remove_member',
          channelId,
          memberId
        })
      })

      if (response.ok) {
        showNotification('Membre retiré du canal', 'success')
        // Recharger les informations du canal
        if (selectedChannel && selectedChannel.id === channelId) {
          loadChannelMessages(selectedChannel)
        }
        loadChannels()
      } else {
        const errorData = await response.json()
        showNotification(errorData.error || 'Erreur lors du retrait du membre', 'error')
      }
    } catch (error) {
      showNotification('Erreur de connexion', 'error')
      console.error('Erreur lors du retrait du membre:', error)
    }
  }

  // Supprimer le canal
  const deleteChannel = async (channelId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce canal ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await authenticatedFetch('/api/chat', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'delete_channel',
          channelId
        })
      })

      if (response.ok) {
        showNotification('Canal supprimé avec succès', 'success')
        // Si c'était le canal sélectionné, le déselectionner
        if (selectedChannel && selectedChannel.id === channelId) {
          setSelectedChannel(null)
          setMessages([])
        }
        loadChannels()
      } else {
        const errorData = await response.json()
        showNotification(errorData.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      showNotification('Erreur de connexion', 'error')
      console.error('Erreur lors de la suppression:', error)
    }
  }

  // Basculer la restriction du canal
  const toggleChannelRestriction = async (channelId: string, currentlyRestricted: boolean) => {
    const action = currentlyRestricted ? 'lever les restrictions' : 'restreindre le canal'
    if (!confirm(`Êtes-vous sûr de vouloir ${action} ?`)) {
      return
    }

    try {
      const response = await authenticatedFetch('/api/chat', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'toggle_restricted',
          channelId,
          restricted: !currentlyRestricted
        })
      })

      if (response.ok) {
        const result = await response.json()
        showNotification(result.message, 'success')
        // Recharger les canaux pour refléter les changements
        loadChannels()
        if (selectedChannel && selectedChannel.id === channelId) {
          loadChannelMessages(selectedChannel)
        }
      } else {
        const errorData = await response.json()
        showNotification(errorData.error || 'Erreur lors de la modification', 'error')
      }
    } catch (error) {
      showNotification('Erreur de connexion', 'error')
      console.error('Erreur lors de la modification:', error)
    }
  }

  // Vérifier si l'utilisateur peut créer des canaux
  const canCreateChannels = () => {
    return user && ['OUVRIER', 'PASTOR', 'ADMIN'].includes(user.role)
  }

  // Vérifier si l'utilisateur est admin du canal
  const isChannelAdmin = (channel: Channel) => {
    if (!user || !channel) return false
    const member = channel.members.find(m => m.userId === user.id)
    return member && member.role === 'ADMIN'
  }

  // Vérifier si le canal est restreint
  const isChannelRestricted = (channel: Channel) => {
    return channel.description && channel.description.includes('Canal restreint - Seuls les administrateurs peuvent écrire')
  }

  // Vérifier si l'utilisateur peut écrire dans le canal
  const canWriteInChannel = (channel: Channel) => {
    if (!user || !channel) return false
    
    // Pour les canaux d'annonce, seuls les pasteurs et admins peuvent écrire
    if (channel.type === 'ANNOUNCEMENT') {
      return ['PASTOR', 'ADMIN'].includes(user.role)
    }
    
    // Pour les canaux restreints, seuls les admins du canal peuvent écrire
    if (isChannelRestricted(channel)) {
      return isChannelAdmin(channel)
    }
    
    return true
  }

  // Fonctions pour gérer l'expiration des messages (Admin uniquement)
  const loadExpirationConfig = async (channelId: string) => {
    if (!isChannelAdmin(selectedChannel!)) return
    
    try {
      const response = await authenticatedFetch(`/api/chat/expiration?channelId=${channelId}`)

      if (response.ok) {
        const data = await response.json()
        setExpirationConfig(data.config)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la config d\'expiration:', error)
    }
  }

  const updateExpirationConfig = async () => {
    if (!selectedChannel || !isChannelAdmin(selectedChannel)) return

    try {
      const response = await authenticatedFetch('/api/chat/expiration', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          ...expirationConfig
        })
      })

      if (response.ok) {
        showNotification('Configuration d\'expiration mise à jour', 'success')
        setShowExpirationSettings(false)
      } else {
        const errorData = await response.json()
        showNotification(errorData.error || 'Erreur lors de la mise à jour', 'error')
      }
    } catch (error) {
      showNotification('Erreur de connexion', 'error')
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  // Charger les utilisateurs en ligne
  const loadOnlineUsers = async () => {
    try {
      const response = await authenticatedFetch('/api/chat?onlineUsers=true')

      if (response.ok) {
        const users = await response.json()
        const onlineUserIds = users.map((u: any) => u.id)
        setOnlineUsers(onlineUserIds)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs en ligne:', error)
    }
  }

  // Charger les messages d'un canal
  const loadChannelMessages = async (channel: Channel) => {
    try {
      const response = await authenticatedFetch(`/api/chat?channelId=${channel.id}&withMessages=true`)

      if (response.ok) {
        const channelData = await response.json()
        setSelectedChannel(channelData)
        setMessages(channelData.messages || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur de chargement' }))
        const errorMessage = errorData.error || 'Impossible de charger les messages'
        
        console.error('Erreur lors du chargement des messages:', errorData)
        // Optionnel: afficher l'erreur à l'utilisateur si critique
        if (response.status === 403 || response.status === 404) {
          showNotification(errorMessage, 'error')
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
      showNotification('Erreur de connexion lors du chargement des messages.', 'error')
    }
  }

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || sending) return

    setSending(true)
    try {
      const response = await authenticatedFetch('/api/chat', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'send_message',
          channelId: selectedChannel.id,
          content: newMessage.trim(),
          messageType: 'TEXT'
        })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
        scrollToBottom()
        // Optionnel: notification de succès discrète
        // showNotification('Message envoyé', 'success')
      } else {
        // Récupérer les détails de l'erreur depuis l'API
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        const errorMessage = errorData.error || 'Impossible d\'envoyer le message'
        
        // Afficher un message d'erreur à l'utilisateur
        showNotification(errorMessage, 'error')
        console.error('Erreur lors de l\'envoi du message:', errorData)
      }
    } catch (error) {
      // Erreur de réseau ou autre erreur inattendue
      showNotification('Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.', 'error')
      console.error('Erreur lors de l\'envoi:', error)
    } finally {
      setSending(false)
    }
  }

  // Ajouter une réaction
  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await authenticatedFetch('/api/chat', {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'add_reaction',
          messageId,
          emoji
        })
      })

      if (response.ok) {
        // Recharger les messages pour voir les nouvelles réactions
        if (selectedChannel) {
          loadChannelMessages(selectedChannel)
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur de réaction' }))
        console.error('Erreur lors de l\'ajout de la réaction:', errorData)
        
        // Ne pas afficher d'alerte pour les réactions, juste loguer
        if (response.status === 403) {
          console.warn('Vous n\'êtes pas autorisé à ajouter cette réaction')
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Charger les données au montage
  useEffect(() => {
    loadChannels().finally(() => setLoading(false))
    loadOnlineUsers()
    
    // Recharger les utilisateurs en ligne toutes les 30 secondes
    const interval = setInterval(loadOnlineUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Gestion de la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Filtrer les canaux
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Formater la date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier'
    } else {
      return date.toLocaleDateString('fr-FR')
    }
  }

  // Icône selon le type de canal
  const getChannelIcon = (type: string, channel?: Channel) => {
    const isRestricted = channel && isChannelRestricted(channel)
    
    let icon
    switch (type) {
      case 'ANNOUNCEMENT': icon = <Megaphone className="w-4 h-4" />; break
      case 'PRAYER': icon = <span className="text-sm">🙏</span>; break
      default: icon = <Hash className="w-4 h-4" />; break
    }
    
    return (
      <div className="flex items-center space-x-1">
        {icon}
        {isRestricted && (
          <div title="Canal restreint">
            <Lock className="w-3 h-3 text-orange-500" />
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar des canaux - Responsive */}
      <div className="w-full md:w-64 lg:w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header sidebar - Compact mobile */}
        <div className="p-2 md:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">💬 Discussion</h2>
            <div className="flex space-x-1 md:space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMembers(!showMembers)}
                title="Voir les membres en ligne"
                className="p-1.5 md:p-2"
              >
                <Users className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              {canCreateChannels() && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreateChannel(!showCreateChannel)}
                  title="Créer un canal"
                  className="p-1.5 md:p-2"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 md:pl-10 text-xs md:text-sm py-1.5 md:py-2"
            />
          </div>

          {/* Formulaire de création de canal - Compact */}
          {showCreateChannel && (
            <div className="mt-2 md:mt-3 p-2 md:p-3 bg-gray-50 rounded-lg border">
              <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2">Nouveau canal</h3>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nom du canal..."
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="text-xs md:text-sm py-1.5"
                />
                <Input
                  type="text"
                  placeholder="Description..."
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  className="text-xs md:text-sm py-1.5"
                />
                <select
                  value={newChannelType}
                  onChange={(e) => setNewChannelType(e.target.value)}
                  className="w-full p-1.5 md:p-2 text-xs md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Privé</option>
                  <option value="PRAYER">Prières</option>
                </select>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={createChannel}
                    disabled={!newChannelName.trim()}
                    className="flex-1"
                  >
                    Créer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCreateChannel(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Membres du canal */}
          {showMembers && selectedChannel && (
            <div className="mt-3 space-y-3">
              {/* Membres en ligne */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  En ligne ({selectedChannel.members.filter(member => onlineUsers.includes(member.userId)).length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedChannel.members
                    .filter(member => onlineUsers.includes(member.userId))
                    .map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                            {member.user.firstName[0]}
                          </div>
                          <span className="text-gray-700">
                            {member.user.firstName} {member.user.lastName}
                          </span>
                          {member.role !== 'MEMBER' && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                              {member.role}
                            </span>
                          )}
                        </div>
                        {/* Bouton retirer membre (seulement pour les admins du canal) */}
                        {isChannelAdmin(selectedChannel) && member.userId !== user?.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeMember(selectedChannel.id, member.userId)
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                            title="Retirer du canal"
                          >
                            <UserMinus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  {selectedChannel.members.filter(member => onlineUsers.includes(member.userId)).length === 0 && (
                    <div className="text-sm text-gray-500">
                      Aucun membre en ligne pour le moment
                    </div>
                  )}
                </div>
              </div>

              {/* Tous les membres */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Tous les membres ({selectedChannel.members.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedChannel.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs ${
                          onlineUsers.includes(member.userId) ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {member.user.firstName[0]}
                        </div>
                        <span className="text-gray-700">
                          {member.user.firstName} {member.user.lastName}
                        </span>
                        <span className="text-xs text-gray-500">({member.user.role})</span>
                        {member.role !== 'MEMBER' && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                            {member.role}
                          </span>
                        )}
                      </div>
                      {/* Bouton retirer membre (seulement pour les admins du canal) */}
                      {isChannelAdmin(selectedChannel) && member.userId !== user?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeMember(selectedChannel.id, member.userId)
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                          title="Retirer du canal"
                        >
                          <UserMinus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des canaux */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => loadChannelMessages(channel)}
                className={`p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                  selectedChannel?.id === channel.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getChannelIcon(channel.type, channel)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {channel.name}
                      </div>
                      {channel.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {channel.description}
                        </div>
                      )}
                      {channel.messages && channel.messages.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {channel.messages[channel.messages.length - 1].sender.firstName}: {
                            channel.messages[channel.messages.length - 1].content.length > 30
                              ? channel.messages[channel.messages.length - 1].content.substring(0, 30) + '...'
                              : channel.messages[channel.messages.length - 1].content
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {channel.members.length}
                      </span>
                    </div>
                    {channel.members.some(member => onlineUsers.includes(member.userId)) && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Membres en ligne"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone de chat principale - Responsive */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Header du canal - Compact mobile */}
            <div className="bg-white border-b border-gray-200 p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3 overflow-hidden">
                  {getChannelIcon(selectedChannel.type, selectedChannel)}
                  <div className="overflow-hidden">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                      {selectedChannel.name}
                    </h3>
                    {selectedChannel.description && (
                      <p className="text-xs md:text-sm text-gray-500 truncate">
                        {selectedChannel.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowMembers(!showMembers)}
                    className="p-1.5 md:p-2"
                  >
                    <Users className="w-3 h-3 md:w-4 md:h-4 mr-0.5 md:mr-1" />
                    <span className="hidden md:inline">{selectedChannel.members.length}</span>
                    {selectedChannel.members.some(member => onlineUsers.includes(member.userId)) && (
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full ml-0.5 md:ml-1"></div>
                    )}
                  </Button>

                  {/* Boutons d'administration du canal */}
                  {isChannelAdmin(selectedChannel) && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleChannelRestriction(selectedChannel.id, !!isChannelRestricted(selectedChannel))}
                        title={isChannelRestricted(selectedChannel) ? "Lever les restrictions" : "Restreindre aux administrateurs"}
                      >
                        {isChannelRestricted(selectedChannel) ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowExpirationSettings(true)
                          loadExpirationConfig(selectedChannel.id)
                        }}
                        title="Options d'expiration des messages"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteChannel(selectedChannel.id)}
                        title="Supprimer le canal"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadChannels}
                    title="Actualiser"
                  >
                    🔄
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages - Compact mobile */}
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4">
              {messages.map((message, index) => {
                const showDateDivider = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt)

                return (
                  <div key={message.id}>
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-2 md:my-4">
                        <div className="bg-gray-100 text-gray-500 text-xs px-2 md:px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 md:space-x-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0">
                        {message.sender.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-1 md:space-x-2">
                          <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                            {message.sender.firstName} {message.sender.lastName}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isEdited && (
                            <span className="text-xs text-gray-400 italic hidden md:inline">
                              (modifié)
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs md:text-sm text-gray-700 break-words">
                          {message.content}
                        </div>
                        
                        {/* Réactions - Compact */}
                        <div className="flex items-center space-x-1 mt-1 md:mt-2">
                          {message.reactions.map((reaction) => (
                            <div
                              key={reaction.id}
                              className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs cursor-pointer"
                              title={`${reaction.user.firstName} ${reaction.user.lastName}`}
                            >
                              <span>{reaction.emoji}</span>
                            </div>
                          ))}
                          
                          {/* Boutons d'ajout de réactions */}
                          <div className="flex space-x-1">
                            {['👍', '❤️', '🙏'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(message.id, emoji)}
                                className="w-6 h-6 hover:bg-gray-100 rounded text-xs flex items-center justify-center transition-colors"
                                title={`Ajouter ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie - Compact mobile */}
            <div className="bg-white border-t border-gray-200 p-2 md:p-4">
              {canWriteInChannel(selectedChannel) ? (
                <div className="flex items-end space-x-1 md:space-x-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={`Message...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      className="text-xs md:text-sm py-1.5 md:py-2"
                    />
                  </div>
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || sending}
                    className="px-2 md:px-3 py-1.5 md:py-2"
                  >
                    <Send className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center p-2 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Lock className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">
                      {selectedChannel.type === 'ANNOUNCEMENT' 
                        ? 'Seuls les pasteurs et administrateurs peuvent publier dans ce canal d\'annonces'
                        : 'Ce canal est restreint aux administrateurs'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Bienvenue dans le Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Sélectionnez un canal pour commencer à discuter avec la communauté.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal de configuration d'expiration des messages */}
      {showExpirationSettings && selectedChannel && isChannelAdmin(selectedChannel) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Expiration des Messages
              </h3>
              <button
                onClick={() => setShowExpirationSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Activation/Désactivation */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Activer l'expiration automatique
                </label>
                <input
                  type="checkbox"
                  checked={expirationConfig.isEnabled}
                  onChange={(e) => setExpirationConfig(prev => ({
                    ...prev,
                    isEnabled: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Durée par défaut */}
              {expirationConfig.isEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée avant expiration (heures)
                    </label>
                    <select
                      value={expirationConfig.defaultDurationHours}
                      onChange={(e) => setExpirationConfig(prev => ({
                        ...prev,
                        defaultDurationHours: parseInt(e.target.value)
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 heure</option>
                      <option value={6}>6 heures</option>
                      <option value={12}>12 heures</option>
                      <option value={24}>24 heures (1 jour)</option>
                      <option value={48}>48 heures (2 jours)</option>
                      <option value={168}>168 heures (1 semaine)</option>
                      <option value={720}>720 heures (1 mois)</option>
                    </select>
                  </div>

                  {/* Suppression automatique */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Suppression automatique
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Si activé, les messages expirés seront supprimés automatiquement.
                        Sinon, ils seront simplement masqués.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={expirationConfig.autoDelete}
                      onChange={(e) => setExpirationConfig(prev => ({
                        ...prev,
                        autoDelete: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  {/* Information */}
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      ℹ️ Cette configuration s'applique uniquement aux nouveaux messages de ce canal.
                      Les messages existants ne sont pas affectés.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowExpirationSettings(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={updateExpirationConfig}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Composant de notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
          notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' :
          'bg-blue-100 border-blue-400 text-blue-700'
        } border-l-4`}>
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPageReal

