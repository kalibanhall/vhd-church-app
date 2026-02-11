/**
 * =============================================================================
 * API CHAT PROXY - MESSAGERIE PRIVÉE ENTRE MEMBRES
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: API pour la messagerie privée 1-1 entre membres de l'église.
 * Gère les conversations, messages, statuts en ligne et notifications.
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

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

// Stockage en mémoire (à remplacer par une vraie base de données)
let messages: Message[] = []
let onlineStatus: Record<string, { isOnline: boolean; lastSeen: string }> = {}

// Simuler les membres depuis le backend ou cache local
let cachedMembers: Member[] = []

/**
 * GET - Récupérer les membres, conversations ou messages
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'members'
    const memberId = searchParams.get('memberId')

    // Extraire l'ID utilisateur du token
    let currentUserId = ''
    try {
      const tokenData = token.replace('Bearer ', '')
      const payload = JSON.parse(atob(tokenData.split('.')[1]))
      currentUserId = payload.sub || payload.id || ''
    } catch {}

    // Charger les membres depuis le backend
    if (cachedMembers.length === 0 || type === 'members') {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          cache: 'no-store'
        })

        if (response.ok) {
          const data = await response.json()
          const users = data.users || data || []
          
          cachedMembers = users.map((u: any) => ({
            id: u.id,
            firstName: u.firstName || 'Membre',
            lastName: u.lastName || '',
            email: u.email || '',
            role: u.role || 'FIDELE',
            isOnline: onlineStatus[u.id]?.isOnline || false,
            lastSeen: onlineStatus[u.id]?.lastSeen || new Date().toISOString(),
            unreadCount: messages.filter(m => m.receiverId === currentUserId && m.senderId === u.id && !m.read).length
          }))
        }
      } catch (error) {
        console.log('Erreur chargement membres:', error)
      }
    }

    // Mettre à jour le statut en ligne de l'utilisateur actuel
    if (currentUserId) {
      onlineStatus[currentUserId] = {
        isOnline: true,
        lastSeen: new Date().toISOString()
      }
    }

    // Type: members - Liste des membres
    if (type === 'members') {
      const membersWithStatus = cachedMembers
        .filter(m => m.id !== currentUserId)
        .map(m => ({
          ...m,
          isOnline: onlineStatus[m.id]?.isOnline || false,
          lastSeen: onlineStatus[m.id]?.lastSeen || m.lastSeen,
          unreadCount: messages.filter(msg => msg.receiverId === currentUserId && msg.senderId === m.id && !msg.read).length
        }))

      return NextResponse.json({ members: membersWithStatus })
    }

    // Type: conversations - Liste des conversations
    if (type === 'conversations') {
      // Grouper les messages par conversation
      const conversationMap = new Map<string, Conversation>()
      
      messages
        .filter(m => m.senderId === currentUserId || m.receiverId === currentUserId)
        .forEach(msg => {
          const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId
          const existing = conversationMap.get(partnerId)
          
          if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessage?.createdAt || '')) {
            const partner = cachedMembers.find(m => m.id === partnerId)
            if (partner) {
              conversationMap.set(partnerId, {
                id: `conv_${partnerId}`,
                participantId: partnerId,
                participant: {
                  ...partner,
                  isOnline: onlineStatus[partnerId]?.isOnline || false,
                  lastSeen: onlineStatus[partnerId]?.lastSeen || partner.lastSeen
                },
                lastMessage: msg,
                unreadCount: messages.filter(m => m.receiverId === currentUserId && m.senderId === partnerId && !m.read).length
              })
            }
          }
        })

      const conversations = Array.from(conversationMap.values())
        .sort((a, b) => {
          const dateA = a.lastMessage?.createdAt || ''
          const dateB = b.lastMessage?.createdAt || ''
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

      return NextResponse.json({ conversations })
    }

    // Type: messages - Messages d'une conversation
    if (type === 'messages' && memberId) {
      const conversationMessages = messages
        .filter(m => 
          (m.senderId === currentUserId && m.receiverId === memberId) ||
          (m.senderId === memberId && m.receiverId === currentUserId)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      return NextResponse.json({ messages: conversationMessages })
    }

    // Type: unread-count - Nombre total de messages non lus
    if (type === 'unread-count') {
      const unreadCount = messages.filter(m => m.receiverId === currentUserId && !m.read).length
      return NextResponse.json({ unreadCount })
    }

    return NextResponse.json({ error: 'Type non reconnu' }, { status: 400 })

  } catch (error: unknown) {
    console.error('❌ Chat GET proxy error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST - Envoyer un message
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { action, receiverId, content } = body

    // Extraire l'ID utilisateur du token
    let currentUserId = ''
    let senderName = 'Membre'
    try {
      const tokenData = token.replace('Bearer ', '')
      const payload = JSON.parse(atob(tokenData.split('.')[1]))
      currentUserId = payload.sub || payload.id || ''
      senderName = payload.firstName || 'Membre'
    } catch {}

    if (!currentUserId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 })
    }

    if (action === 'send' || !action) {
      if (!receiverId || !content?.trim()) {
        return NextResponse.json({ error: 'Destinataire et contenu requis' }, { status: 400 })
      }

      const newMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: currentUserId,
        receiverId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        read: false
      }

      messages.push(newMessage)

      // Essayer d'envoyer au backend
      try {
        await fetch(`${API_BASE_URL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(newMessage)
        })
      } catch {
        console.log('Backend non disponible, message stocké localement')
      }

      return NextResponse.json(newMessage, { status: 201 })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

  } catch (error: unknown) {
    console.error('❌ Chat POST proxy error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PUT - Marquer comme lu ou mettre à jour le statut
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { action, memberId } = body

    // Extraire l'ID utilisateur du token
    let currentUserId = ''
    try {
      const tokenData = token.replace('Bearer ', '')
      const payload = JSON.parse(atob(tokenData.split('.')[1]))
      currentUserId = payload.sub || payload.id || ''
    } catch {}

    if (action === 'mark-read' && memberId) {
      // Marquer tous les messages de ce membre comme lus
      messages = messages.map(m => {
        if (m.senderId === memberId && m.receiverId === currentUserId && !m.read) {
          return { ...m, read: true }
        }
        return m
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'update-status') {
      onlineStatus[currentUserId] = {
        isOnline: true,
        lastSeen: new Date().toISOString()
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'go-offline') {
      onlineStatus[currentUserId] = {
        isOnline: false,
        lastSeen: new Date().toISOString()
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

  } catch (error: unknown) {
    console.error('❌ Chat PUT proxy error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
