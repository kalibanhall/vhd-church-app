import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEvents() {
  try {
    console.log('🌱 Ajout d\'événements d\'exemple...')

    // Trouver des utilisateurs existants
    const existingUsers = await prisma.user.findMany({
      take: 3
    })

    if (existingUsers.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Créez d\'abord un utilisateur.')
      return
    }

    // Trouver un pasteur ou utiliser le premier utilisateur
    const pastor = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'PASTOR' },
          { role: 'ADMIN' }
        ]
      }
    }) || existingUsers[0]

    // Supprimer les anciens événements pour éviter les doublons
    await prisma.event.deleteMany({})

    const now = new Date()
    const events = [
      {
        title: 'Culte Dominical - Communion',
        description: 'Rejoignez-nous pour un temps de louange, prédication et communion fraternelle. Message sur "L\'Amour de Dieu"',
        eventDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 10.5 * 60 * 60 * 1000), // 10h30
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // 12h00
        eventType: 'WORSHIP_SERVICE',
        location: 'Sanctuaire Principal',
        maxAttendees: 150,
        status: 'SCHEDULED',
        createdBy: pastor.id,
        eventImageUrl: 'https://youtube.com/live/culte-dominical' // URL de stream
      },
      {
        title: '🔴 LIVE: Réunion de Prière Spéciale',
        description: 'Temps d\'intercession pour notre nation et notre communauté. Streaming en direct disponible.',
        eventDate: now,
        startTime: now,
        endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Dans 2h
        eventType: 'PRAYER_MEETING',
        location: 'Salle de Prière',
        maxAttendees: 80,
        status: 'IN_PROGRESS',
        createdBy: pastor.id,
        eventImageUrl: 'https://youtube.com/live/priere-intercession'
      },
      {
        title: 'Étude Biblique - Livre des Actes',
        description: 'Continuation de notre série sur les Actes des Apôtres, chapitre 15. Apportez votre Bible !',
        eventDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // 19h00
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 20.5 * 60 * 60 * 1000), // 20h30
        eventType: 'BIBLE_STUDY',
        location: 'Salle d\'Étude',
        maxAttendees: 40,
        status: 'SCHEDULED',
        createdBy: pastor.id
      },
      {
        title: 'Réunion Jeunes - Soirée Louange',
        description: 'Soirée spéciale pour les jeunes avec temps de louange, témoignages et partage autour d\'un repas.',
        eventDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 18h00
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 21 * 60 * 60 * 1000), // 21h00
        eventType: 'YOUTH_MEETING',
        location: 'Salle des Jeunes',
        maxAttendees: 60,
        status: 'SCHEDULED',
        createdBy: pastor.id
      },
      {
        title: 'Conférence Spéciale - "La Foi en Action"',
        description: 'Conférence exceptionnelle avec orateur invité. Thème: Comment vivre notre foi au quotidien.',
        eventDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
        startTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // 15h00
        endTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // 17h00
        eventType: 'SPECIAL_EVENT',
        location: 'Auditorium Principal',
        maxAttendees: 200,
        status: 'SCHEDULED',
        createdBy: pastor.id,
        eventImageUrl: 'https://youtube.com/live/conference-foi-action'
      }
    ]

    for (const event of events) {
      await prisma.event.create({
        data: event
      })
    }

    console.log('✅ Événements d\'exemple ajoutés')
    console.log('🎉 Seed des événements terminé avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des événements:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEvents().catch((error) => {
  console.error(error)
  process.exit(1)
})