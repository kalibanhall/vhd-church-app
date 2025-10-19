import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Fonction pour extraire l'utilisateur du token JWT
function getUserFromToken(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value

    if (!token) {
      console.error('Aucun token fourni')
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Vérifier que le token contient les informations nécessaires
    if (!decoded.userId) {
      console.error('Token JWT invalide - userId manquant:', decoded)
      return null
    }

    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    console.error('Erreur lors du décodage du token JWT:', error)
    return null
  }
}

// GET - Récupérer tous les canaux de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const withMessages = searchParams.get('withMessages') === 'true'
    const getOnlineUsers = searchParams.get('onlineUsers') === 'true'

    if (getOnlineUsers) {
      // Simuler des utilisateurs en ligne (à remplacer par une vraie gestion de présence)
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        },
        take: 10
      })

      // Simuler que 30-50% des utilisateurs sont en ligne
      const onlineCount = Math.floor(allUsers.length * (0.3 + Math.random() * 0.2))
      const onlineUsers = allUsers.slice(0, onlineCount).map((user: any) => ({
        ...user,
        lastSeen: new Date(),
        status: 'online'
      }))

      return NextResponse.json(onlineUsers)
    }

    if (channelId) {
      // Récupérer un canal spécifique avec ses messages
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          messages: withMessages ? {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              },
              reactions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            },
            take: 100 // Limiter à 100 messages récents
          } : false
        }
      })

      if (!channel) {
        return NextResponse.json({ error: 'Canal non trouvé' }, { status: 404 })
      }

      // Vérifier si l'utilisateur est membre du canal
      const isMember = channel.members.some((member: any) => member.userId === user.id)
      if (!isMember && channel.type === 'PRIVATE') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
      }

      return NextResponse.json(channel)
    } else {
      // Récupérer tous les canaux accessibles à l'utilisateur
      const channels = await prisma.channel.findMany({
        where: {
          OR: [
            { type: 'PUBLIC' },
            { type: 'ANNOUNCEMENT' },
            { 
              members: {
                some: {
                  userId: user.id
                }
              }
            }
          ],
          isActive: true
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      return NextResponse.json(channels)
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des canaux:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau canal ou envoyer un message
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    console.log('Utilisateur extrait du token:', user)
    
    if (!user || !user.id) {
      console.error('Utilisateur non authentifié ou ID manquant:', user)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body
    console.log('Action demandée:', action, 'Data:', data)

    if (action === 'create_channel') {
      // Créer un nouveau canal
      const { name, description, type = 'PUBLIC', memberIds = [] } = data

      if (!name) {
        return NextResponse.json({ error: 'Le nom du canal est requis' }, { status: 400 })
      }

      // Vérifier les permissions pour créer un canal
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id }
      })

      if (!userRecord) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
      }

      // Seuls les ouvriers, pasteurs et admins peuvent créer des canaux
      if (!['OUVRIER', 'PASTOR', 'ADMIN'].includes(userRecord.role)) {
        return NextResponse.json({ error: 'Seuls les ouvriers, pasteurs et administrateurs peuvent créer des canaux' }, { status: 403 })
      }

      // Seuls les pasteurs et admins peuvent créer des canaux d'annonce
      if (type === 'ANNOUNCEMENT' && !['PASTOR', 'ADMIN'].includes(userRecord.role)) {
        return NextResponse.json({ error: 'Seuls les pasteurs et administrateurs peuvent créer des canaux d\'annonce' }, { status: 403 })
      }

      const channel = await prisma.channel.create({
        data: {
          name,
          description,
          type: type.toUpperCase(),
          members: {
            create: [
              {
                userId: user.id,
                role: 'ADMIN'
              },
              ...memberIds.map((id: string) => ({
                userId: id,
                role: 'MEMBER'
              }))
            ]
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true
                }
              }
            }
          }
        }
      })

      return NextResponse.json(channel, { status: 201 })
    } else if (action === 'send_message') {
      // Envoyer un message
      const { channelId, content, messageType = 'TEXT', fileUrl, fileName } = data

      if (!channelId || !content) {
        return NextResponse.json({ error: 'Canal et contenu requis' }, { status: 400 })
      }

      // Vérifier que l'utilisateur peut envoyer des messages dans ce canal
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          members: true
        }
      })

      if (!channel) {
        return NextResponse.json({ error: 'Canal non trouvé' }, { status: 404 })
      }

      const isMember = channel.members.some((member: any) => member.userId === user.id)
      
      // Permettre l'accès aux canaux publics même sans être membre explicitement
      if (!isMember && channel.type === 'PRIVATE') {
        return NextResponse.json({ error: 'Accès interdit - Canal privé' }, { status: 403 })
      }
      
      // Pour les canaux d'annonce, seuls les pasteurs et admins peuvent envoyer des messages
      if (channel.type === 'ANNOUNCEMENT') {
        const userRecord = await prisma.user.findUnique({
          where: { id: user.id }
        })
        
        if (!userRecord || !['PASTOR', 'ADMIN'].includes(userRecord.role)) {
          return NextResponse.json({ error: 'Seuls les pasteurs et administrateurs peuvent publier des annonces' }, { status: 403 })
        }
      }

      // Vérifier si le canal est restreint (basé sur la description pour maintenant)
      const isRestrictedChannel = channel.description && channel.description.includes('Canal restreint - Seuls les administrateurs peuvent écrire')
      if (isRestrictedChannel) {
        // Vérifier si l'utilisateur est admin du canal
        const channelMember = channel.members.find((member: any) => member.userId === user.id)
        if (!channelMember || channelMember.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Ce canal est restreint aux administrateurs' }, { status: 403 })
        }
      }

      // Si l'utilisateur n'est pas membre d'un canal public, l'ajouter automatiquement
      if (!isMember && channel.type === 'PUBLIC') {
        await prisma.channelMember.create({
          data: {
            channelId,
            userId: user.id,
            role: 'MEMBER'
          }
        }).catch(() => {
          // Ignorer si l'utilisateur est déjà membre (race condition)
        })
      }

      const message = await prisma.message.create({
        data: {
          channelId,
          senderId: user.id,
          content,
          messageType: messageType.toUpperCase(),
          fileUrl,
          fileName
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      // Mettre à jour l'activité du canal
      await prisma.channel.update({
        where: { id: channelId },
        data: {
          updatedAt: new Date()
        }
      })

      return NextResponse.json(message, { status: 201 })
    } else if (action === 'remove_member') {
      // Retirer un membre du canal
      const { channelId, memberId } = data

      if (!channelId || !memberId) {
        return NextResponse.json({ error: 'Canal et membre requis' }, { status: 400 })
      }

      // Vérifier que l'utilisateur est admin du canal
      const channelMember = await prisma.channelMember.findFirst({
        where: { 
          channelId,
          userId: user.id,
          role: 'ADMIN'
        }
      })

      if (!channelMember) {
        return NextResponse.json({ error: 'Seuls les administrateurs du canal peuvent retirer des membres' }, { status: 403 })
      }

      // Supprimer le membre
      await prisma.channelMember.deleteMany({
        where: {
          channelId,
          userId: memberId
        }
      })

      return NextResponse.json({ success: true, message: 'Membre retiré du canal' })
    } else if (action === 'delete_channel') {
      // Supprimer le canal
      const { channelId } = data

      if (!channelId) {
        return NextResponse.json({ error: 'ID du canal requis' }, { status: 400 })
      }

      // Vérifier que l'utilisateur est admin du canal ou admin système
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id }
      })

      const channelMember = await prisma.channelMember.findFirst({
        where: { 
          channelId,
          userId: user.id,
          role: 'ADMIN'
        }
      })

      const isSystemAdmin = userRecord && ['ADMIN', 'PASTOR'].includes(userRecord.role)

      if (!channelMember && !isSystemAdmin) {
        return NextResponse.json({ error: 'Seuls les administrateurs du canal ou les administrateurs système peuvent supprimer le canal' }, { status: 403 })
      }

      // Supprimer tous les messages, réactions et membres d'abord
      await prisma.messageReaction.deleteMany({
        where: {
          message: {
            channelId
          }
        }
      })

      await prisma.message.deleteMany({
        where: { channelId }
      })

      await prisma.channelMember.deleteMany({
        where: { channelId }
      })

      // Supprimer le canal
      await prisma.channel.delete({
        where: { id: channelId }
      })

      return NextResponse.json({ success: true, message: 'Canal supprimé avec succès' })
    } else if (action === 'toggle_restricted') {
      // Basculer la restriction d'écriture du canal
      const { channelId, restricted } = data

      if (!channelId || typeof restricted !== 'boolean') {
        return NextResponse.json({ error: 'Canal et statut de restriction requis' }, { status: 400 })
      }

      // Vérifier que l'utilisateur est admin du canal
      const channelMember = await prisma.channelMember.findFirst({
        where: { 
          channelId,
          userId: user.id,
          role: 'ADMIN'
        }
      })

      if (!channelMember) {
        return NextResponse.json({ error: 'Seuls les administrateurs du canal peuvent modifier les restrictions' }, { status: 403 })
      }

      // Mettre à jour les métadonnées du canal (on va ajouter un champ customData)
      const channel = await prisma.channel.update({
        where: { id: channelId },
        data: {
          description: restricted ? 
            'Canal restreint - Seuls les administrateurs peuvent écrire' : 
            (await prisma.channel.findUnique({ where: { id: channelId } }))?.description || ''
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: restricted ? 'Canal restreint aux administrateurs' : 'Restrictions levées',
        channel 
      })
    } else {
      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erreur lors de l\'opération:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// PUT - Modifier un canal ou un message  
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'edit_message') {
      const { messageId, content } = data

      if (!messageId || !content) {
        return NextResponse.json({ error: 'ID du message et contenu requis' }, { status: 400 })
      }

      // Vérifier que l'utilisateur est le propriétaire du message
      const message = await prisma.message.findUnique({
        where: { id: messageId }
      })

      if (!message) {
        return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 })
      }

      if (message.senderId !== user.id) {
        return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
      }

      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content,
          isEdited: true
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      return NextResponse.json(updatedMessage)
    } else if (action === 'add_reaction') {
      const { messageId, emoji } = data

      if (!messageId || !emoji) {
        return NextResponse.json({ error: 'ID du message et emoji requis' }, { status: 400 })
      }

      // Créer ou supprimer la réaction
      const existingReaction = await prisma.messageReaction.findUnique({
        where: {
          messageId_userId_emoji: {
            messageId,
            userId: user.id,
            emoji
          }
        }
      })

      if (existingReaction) {
        // Supprimer la réaction existante
        await prisma.messageReaction.delete({
          where: { id: existingReaction.id }
        })
        return NextResponse.json({ action: 'removed' })
      } else {
        // Ajouter la réaction
        const reaction = await prisma.messageReaction.create({
          data: {
            messageId,
            userId: user.id,
            emoji
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        })
        return NextResponse.json({ action: 'added', reaction })
      }
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un message ou quitter un canal
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const channelId = searchParams.get('channelId')

    if (messageId) {
      // Supprimer un message
      const message = await prisma.message.findUnique({
        where: { id: messageId }
      })

      if (!message) {
        return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 })
      }

      if (message.senderId !== user.id) {
        // Vérifier si l'utilisateur est modérateur du canal
        const channelMember = await prisma.channelMember.findUnique({
          where: {
            channelId_userId: {
              channelId: message.channelId,
              userId: user.id
            }
          }
        })

        if (!channelMember || !['MODERATOR', 'ADMIN'].includes(channelMember.role)) {
          return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
        }
      }

      await prisma.message.delete({
        where: { id: messageId }
      })

      return NextResponse.json({ message: 'Message supprimé' })
    } else if (channelId) {
      // Quitter un canal
      const membership = await prisma.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId: user.id
          }
        }
      })

      if (!membership) {
        return NextResponse.json({ error: 'Vous n\'êtes pas membre de ce canal' }, { status: 404 })
      }

      await prisma.channelMember.delete({
        where: { id: membership.id }
      })

      return NextResponse.json({ message: 'Canal quitté' })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}