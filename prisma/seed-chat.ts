import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedChatData() {
  try {
    console.log('🌱 Démarrage du seed des données de chat...')

    // Récupérer les utilisateurs existants
    const users = await prisma.user.findMany()
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Créez d\'abord des utilisateurs.')
      return
    }

    console.log(`📊 ${users.length} utilisateurs trouvés`)

    // Créer les canaux de base
    const channels = [
      {
        id: 'general',
        name: '💬 Général',
        description: 'Discussions générales de la communauté',
        type: 'PUBLIC'
      },
      {
        id: 'announcements', 
        name: '📢 Annonces',
        description: 'Annonces officielles de l\'église',
        type: 'ANNOUNCEMENT'
      },
      {
        id: 'prayer',
        name: '🙏 Prières',
        description: 'Demandes de prière et intercession',
        type: 'PRAYER'
      },
      {
        id: 'youth',
        name: '🎯 Jeunesse',
        description: 'Canal dédié aux jeunes de l\'église',
        type: 'PUBLIC'
      },
      {
        id: 'worship',
        name: '🎵 Louange',
        description: 'Discussions sur la louange et la musique',
        type: 'PUBLIC'
      }
    ]

    for (const channelData of channels) {
      // Vérifier si le canal existe déjà
      const existingChannel = await prisma.channel.findUnique({
        where: { id: channelData.id }
      })

      if (!existingChannel) {
        const channel = await prisma.channel.create({
          data: {
            id: channelData.id,
            name: channelData.name,
            description: channelData.description,
            type: channelData.type,
            isActive: true
          }
        })
        console.log(`✅ Canal créé: ${channel.name}`)

        // Ajouter tous les utilisateurs aux canaux publics
        if (channelData.type === 'PUBLIC' || channelData.type === 'ANNOUNCEMENT') {
          for (const user of users) {
            await prisma.channelMember.create({
              data: {
                channelId: channel.id,
                userId: user.id,
                role: user.role === 'PASTOR' || user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
              }
            })
          }
          console.log(`👥 ${users.length} membres ajoutés au canal ${channel.name}`)
        }
      } else {
        console.log(`⏭️  Canal ${channelData.name} existe déjà`)
      }
    }

    // Créer des messages d'exemple
    const sampleMessages = [
      {
        channelId: 'general',
        content: 'Bienvenue dans le canal général ! N\'hésitez pas à partager et à échanger.',
        senderId: users.find((u: any) => u.role === 'PASTOR')?.id || users[0].id
      },
      {
        channelId: 'general', 
        content: 'Que la paix du Seigneur soit avec vous tous ! 🙏',
        senderId: users[1]?.id || users[0].id
      },
      {
        channelId: 'announcements',
        content: '📢 Rappel: Culte spécial ce dimanche à 10h. Venez nombreux !',
        senderId: users.find((u: any) => u.role === 'PASTOR')?.id || users[0].id
      },
      {
        channelId: 'prayer',
        content: 'Prions pour la guérison de nos frères et sœurs malades. 🙏❤️',
        senderId: users[2]?.id || users[0].id
      },
      {
        channelId: 'youth',
        content: 'Salut les jeunes ! Qui est partant pour la sortie de samedi ? 🎉',
        senderId: users[3]?.id || users[0].id
      },
      {
        channelId: 'worship',
        content: 'Quelqu\'un connaît les accords de "Amazing Grace" ? 🎵',
        senderId: users[4]?.id || users[0].id
      }
    ]

    for (const messageData of sampleMessages) {
      // Vérifier si des messages existent déjà dans ce canal
      const existingMessages = await prisma.message.findMany({
        where: { channelId: messageData.channelId }
      })

      if (existingMessages.length === 0) {
        await prisma.message.create({
          data: {
            channelId: messageData.channelId,
            senderId: messageData.senderId,
            content: messageData.content,
            messageType: 'TEXT'
          }
        })
        console.log(`💬 Message créé dans le canal ${messageData.channelId}`)
      }
    }

    // Ajouter quelques réactions d'exemple
    const messages = await prisma.message.findMany()
    if (messages.length > 0) {
      const emojis = ['👍', '❤️', '🙏', '😊', '🎉']
      
      for (let i = 0; i < Math.min(3, messages.length); i++) {
        const message = messages[i]
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

        // Vérifier si la réaction existe déjà
        const existingReaction = await prisma.messageReaction.findUnique({
          where: {
            messageId_userId_emoji: {
              messageId: message.id,
              userId: randomUser.id,
              emoji: randomEmoji
            }
          }
        })

        if (!existingReaction) {
          await prisma.messageReaction.create({
            data: {
              messageId: message.id,
              userId: randomUser.id,
              emoji: randomEmoji
            }
          })
          console.log(`👍 Réaction ${randomEmoji} ajoutée au message`)
        }
      }
    }

    console.log('🎉 Seed des données de chat terminé avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors du seed des données de chat:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le seed si appelé directement
if (require.main === module) {
  seedChatData()
}

export default seedChatData