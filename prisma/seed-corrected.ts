import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  try {
    console.log('🌱 Ajout de données initiales...')

    // Trouver des utilisateurs existants
    const existingUsers = await prisma.user.findMany({
      take: 3
    })

    if (existingUsers.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Créez d\'abord un utilisateur.')
      return
    }

    console.log(`✅ ${existingUsers.length} utilisateurs trouvés`)

    // Trouver un pasteur ou utiliser le premier utilisateur
    const pastor = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'PASTOR' },
          { role: 'ADMIN' }
        ]
      }
    }) || existingUsers[0]

    if (pastor) {
      // Supprimer les anciennes prédications pour éviter les doublons
      await prisma.sermon.deleteMany({})
      
      // Ajouter quelques prédications d'exemple
      const preachings = [
        {
          title: 'La Grâce Transformatrice',
          description: 'Découvrez comment la grâce de Dieu peut transformer votre vie quotidienne et vos relations.',
          bibleVerses: 'Éphésiens 2:8-9, Tite 2:11-12',
          sermonType: 'VIDEO',
          durationMinutes: 42,
          pastorId: pastor.id,
          sermonDate: new Date('2025-09-20'),
          isPublished: true,
          viewCount: 156,
          downloadCount: 23,
          videoUrl: 'https://example.com/sermon1.mp4',
          thumbnailUrl: 'https://example.com/sermon1-thumb.jpg'
        },
        {
          title: 'L\'Amour en Action',
          description: 'Comment mettre l\'amour chrétien en pratique dans notre communauté et notre quotidien.',
          bibleVerses: '1 Corinthiens 13:1-13, 1 Jean 4:7-21',
          sermonType: 'LIVE_STREAM',
          durationMinutes: 38,
          pastorId: pastor.id,
          sermonDate: new Date(),
          isPublished: true,
          viewCount: 89,
          downloadCount: 15,
          videoUrl: 'https://example.com/live-stream',
          thumbnailUrl: 'https://example.com/sermon2-thumb.jpg'
        },
        {
          title: '🔴 LIVE: Culte du Dimanche - Louange et Adoration',
          description: 'Rejoignez-nous pour un temps de louange, de prière et d\'enseignement de la Parole de Dieu.',
          bibleVerses: 'Psaume 95:1-7, Jean 4:23-24',
          sermonType: 'LIVE_STREAM',
          durationMinutes: null,
          pastorId: pastor.id,
          sermonDate: new Date(),
          isPublished: true,
          viewCount: 203,
          downloadCount: 0,
          videoUrl: 'https://youtube.com/live/example',
          thumbnailUrl: 'https://example.com/live-thumb.jpg'
        }
      ]

      for (const preaching of preachings) {
        await prisma.sermon.create({
          data: preaching
        })
      }

      console.log('✅ Prédications ajoutées')
    }

    // Supprimer les anciennes donations pour éviter les doublons
    await prisma.donation.deleteMany({})

    // Trouver un utilisateur normal pour les donations
    const user = await prisma.user.findFirst({
      where: {
        role: 'MEMBER'
      }
    }) || existingUsers[0]

    if (user) {
      // Ajouter quelques donations d'exemple
      const donations = [
        {
          amount: 50.0,
          donationType: 'OFFERING',
          paymentMethod: 'CARD',
          userId: user.id,
          donationDate: new Date('2025-09-22'),
          status: 'COMPLETED',
          notes: 'Pour la gloire de Dieu'
        },
        {
          amount: 100.0,
          donationType: 'TITHE',
          paymentMethod: 'BANK_TRANSFER',
          userId: user.id,
          donationDate: new Date('2025-09-10'),
          status: 'COMPLETED',
          notes: 'Dîme mensuelle'
        },
        {
          amount: 25.0,
          donationType: 'OFFERING',
          paymentMethod: 'CASH',
          userId: user.id,
          donationDate: new Date(),
          status: 'COMPLETED',
          notes: 'Offrande spéciale'
        }
      ]

      for (const donation of donations) {
        await prisma.donation.create({
          data: donation
        })
      }

      console.log('✅ Donations ajoutées')
    }

    console.log('🎉 Données initiales ajoutées avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})