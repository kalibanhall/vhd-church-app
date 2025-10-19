import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMoreChatMessages() {
  try {
    console.log('📝 Ajout de plus de messages de test...')

    // Récupérer les canaux et utilisateurs
    const channels = await prisma.channel.findMany()
    const users = await prisma.user.findMany()

    if (channels.length === 0 || users.length === 0) {
      console.log('❌ Aucun canal ou utilisateur trouvé')
      return
    }

    // Messages additionnels par canal
    const additionalMessages = {
      general: [
        'Bonjour à tous ! Comment allez-vous aujourd\'hui ? 😊',
        'Que Dieu vous bénisse en ce beau jour ! ✨',
        'N\'oubliez pas notre réunion de prière de ce soir à 19h',
        'Merci pasteur pour le beau message de dimanche dernier 🙏',
        'Quelqu\'un a des nouvelles de sœur Marie ?',
        'Les répétitions de la chorale auront lieu samedi à 15h 🎵',
        'Gloire à Dieu pour sa bonté ! Alléluia ! 🙌'
      ],
      announcements: [
        '🎉 Félicitations à Pierre et Marie pour leur mariage !',
        '📅 Rappel: Conférence spéciale vendredi soir avec Pasteur Jean',
        '🍽️ Repas communautaire dimanche après le culte',
        '💒 Baptêmes prévus le mois prochain - inscriptions ouvertes',
        '📚 Nouvelle étude biblique chaque mercredi à 18h'
      ],
      prayer: [
        'Prions pour la guérison de notre frère Paul 🙏',
        'Merci de prier pour mon entretien d\'embauche demain',
        'Demande de prière pour la paix dans notre pays',
        'Prions pour les missions en Afrique 🌍',
        'Intercédons pour les jeunes de notre communauté',
        'Action de grâces pour les bénédictions reçues ! ✨'
      ],
      youth: [
        'Salut les jeunes ! Qui vient au camp d\'été ? 🏕️',
        'On organise un tournoi de foot samedi, vous venez ? ⚽',
        'Super soirée d\'hier les gars ! 🎉',
        'Quelqu\'un peut m\'aider avec mes devoirs de maths ? 📚',
        'Concert de louange ce weekend, on y va ensemble ?',
        'Prions pour nos examens qui arrivent 📖'
      ],
      worship: [
        'Quelqu\'un connaît "How Great Thou Art" ? 🎵',
        'Les accords de "Amazing Grace" svp ? 🎸',
        'Répétition dimanche avant le culte à 9h',
        'Nouveau cantique appris : "Tu es mon refuge" ❤️',
        'Besoin d\'un batteur pour dimanche prochain 🥁',
        'Gloire à Dieu pour sa musique dans nos cœurs ! 🎶'
      ]
    }

    // Ajouter les messages
    for (const channel of channels) {
      const channelKey = channel.id as keyof typeof additionalMessages
      const messages = additionalMessages[channelKey] || []

      for (let i = 0; i < messages.length; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        
        // Créer le message avec un délai pour avoir des timestamps différents
        const createdAt = new Date()
        createdAt.setMinutes(createdAt.getMinutes() - (messages.length - i) * 15)

        await prisma.message.create({
          data: {
            channelId: channel.id,
            senderId: randomUser.id,
            content: messages[i],
            messageType: 'TEXT',
            createdAt
          }
        })

        console.log(`💬 Message ajouté dans ${channel.name}`)
      }

      // Mettre à jour la dernière activité du canal
      await prisma.channel.update({
        where: { id: channel.id },
        data: { updatedAt: new Date() }
      })
    }

    // Ajouter quelques réactions aléatoires
    const allMessages = await prisma.message.findMany()
    const emojis = ['👍', '❤️', '🙏', '😊', '🎉', '✨', '🙌']

    for (let i = 0; i < Math.min(15, allMessages.length); i++) {
      const message = allMessages[i]
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
        console.log(`👍 Réaction ${randomEmoji} ajoutée`)
      }
    }

    console.log('🎉 Messages additionnels ajoutés avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des messages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  addMoreChatMessages()
}

export default addMoreChatMessages