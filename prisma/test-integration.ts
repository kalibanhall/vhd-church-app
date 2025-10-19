import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testIntegration() {
  try {
    console.log('🔗 Test de l\'intégration Événements ↔ Prédications...')

    // Trouver un pasteur
    const pastor = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'PASTOR' },
          { role: 'ADMIN' }
        ]
      }
    })

    if (!pastor) {
      console.log('❌ Aucun pasteur trouvé')
      return
    }

    // Créer un événement avec prédication associée
    const newEvent = await prisma.event.create({
      data: {
        title: 'Culte Spécial - La Grâce Abondante',
        description: 'Un culte spécial sur la grâce transformatrice de Dieu dans nos vies.',
        eventDate: new Date('2025-09-29T10:30:00.000Z'),
        startTime: new Date('2025-09-29T10:30:00.000Z'),
        endTime: new Date('2025-09-29T12:00:00.000Z'),
        eventType: 'WORSHIP_SERVICE',
        location: 'Sanctuaire Principal',
        maxAttendees: 200,
        status: 'SCHEDULED',
        createdBy: pastor.id,
        eventImageUrl: 'https://youtube.com/live/culte-grace-abondante'
      }
    })

    console.log('✅ Événement créé:', newEvent.title)

    // Créer une prédication associée à cet événement
    const newSermon = await prisma.sermon.create({
      data: {
        title: 'La Grâce Abondante de Dieu',
        description: 'Découvrez comment la grâce de Dieu déborde dans nos vies et nous transforme de gloire en gloire.',
        bibleVerses: 'Éphésiens 2:8-9, 2 Corinthiens 12:9, Romains 5:20-21',
        sermonType: 'LIVE_STREAM',
        pastorId: pastor.id,
        eventId: newEvent.id, // 🔗 CONNEXION !
        sermonDate: newEvent.eventDate,
        isPublished: true,
        viewCount: 0,
        downloadCount: 0
      }
    })

    console.log('✅ Prédication créée et liée à l\'événement:', newSermon.title)

    // Vérifier la connexion en récupérant l'événement avec ses prédications
    const eventWithSermons = await prisma.event.findUnique({
      where: { id: newEvent.id },
      include: {
        sermons: {
          include: {
            pastor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    console.log('🔗 Événement avec prédications associées:')
    console.log(`   📅 ${eventWithSermons?.title}`)
    eventWithSermons?.sermons.forEach(sermon => {
      console.log(`   📖 → ${sermon.title} par ${sermon.pastor.firstName} ${sermon.pastor.lastName}`)
    })

    // Vérifier la connexion inverse : prédication avec événement
    const sermonWithEvent = await prisma.sermon.findUnique({
      where: { id: newSermon.id },
      include: {
        event: true,
        pastor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    console.log('🔗 Prédication avec événement associé:')
    console.log(`   📖 ${sermonWithEvent?.title}`)
    console.log(`   📅 → Événement: ${sermonWithEvent?.event?.title}`)
    
    console.log('🎉 Test d\'intégration réussi ! Les Événements et Prédications sont connectés.')
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'intégration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testIntegration().catch((error) => {
  console.error(error)
  process.exit(1)
})