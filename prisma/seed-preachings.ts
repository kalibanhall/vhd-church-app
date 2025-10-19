import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPreachings() {
  try {
    console.log('🎙️ Génération des prédications de test...')

    // Récupérer un pasteur pour les prédications
    let pastor = await prisma.user.findFirst({
      where: { role: 'PASTEUR' }
    })

    // Si pas de pasteur, en créer un
    if (!pastor) {
      console.log('👨‍🙏 Création d\'un pasteur pour les prédications...')
      pastor = await prisma.user.create({
        data: {
          firstName: 'Paul',
          lastName: 'Kabamba',
          email: 'pasteur.paul@church.app',
          passwordHash: '$2b$10$8K4qOjv5GKk4vK5QxT0k0eXz5h.FN4zT0Q6vK5QxT0k0eXz5h.FN4z',
          role: 'PASTEUR',
          status: 'ACTIVE',
          membershipDate: new Date(),
          membershipNumber: 'PAST-001',
          phone: '+33123456789'
        }
      })
    }

    // Supprimer les anciennes prédications de test
    await prisma.sermon.deleteMany({
      where: {
        title: {
          in: [
            'La foi qui sauve',
            'L\'amour de Dieu',
            'La puissance de la prière',
            'Marcher dans la lumière',
            'La grâce abondante',
            'Le plan parfait de Dieu'
          ]
        }
      }
    })

    const preachings = [
      {
        title: 'La foi qui sauve',
        description: 'Une prédication puissante sur la foi qui transforme nos vies et nous sauve par la grâce de Dieu.',
        bibleVerses: 'Éphésiens 2:8-9',
        sermonType: 'VIDEO',
        durationMinutes: 45,
        videoUrl: 'https://example.com/video1.mp4',
        thumbnailUrl: 'https://via.placeholder.com/640x360/4F46E5/ffffff?text=La+foi+qui+sauve',
        sermonDate: new Date('2025-09-20'),
        isPublished: true
      },
      {
        title: 'L\'amour de Dieu',
        description: 'Découvrez l\'amour inconditionnel de Dieu pour chacun de nous et comment cet amour change nos vies.',
        bibleVerses: 'Jean 3:16, 1 Jean 4:8',
        sermonType: 'AUDIO',
        durationMinutes: 38,
        audioUrl: 'https://example.com/audio1.mp3',
        thumbnailUrl: 'https://via.placeholder.com/640x360/059669/ffffff?text=L%27amour+de+Dieu',
        sermonDate: new Date('2025-09-15'),
        isPublished: true
      },
      {
        title: 'La puissance de la prière',
        description: 'Comment la prière peut transformer nos circonstances et fortifier notre relation avec Dieu.',
        bibleVerses: 'Matthieu 21:22, Jacques 5:16',
        sermonType: 'VIDEO',
        durationMinutes: 42,
        videoUrl: 'https://example.com/video2.mp4',
        thumbnailUrl: 'https://via.placeholder.com/640x360/DC2626/ffffff?text=Puissance+pri%C3%A8re',
        sermonDate: new Date('2025-09-10'),
        isPublished: true
      },
      {
        title: 'Marcher dans la lumière',
        description: 'Vivre selon les voies de Dieu et marcher dans sa lumière divine chaque jour.',
        bibleVerses: '1 Jean 1:7, Psaume 119:105',
        sermonType: 'AUDIO',
        durationMinutes: 35,
        audioUrl: 'https://example.com/audio2.mp3',
        thumbnailUrl: 'https://via.placeholder.com/640x360/F59E0B/ffffff?text=Marcher+lumi%C3%A8re',
        sermonDate: new Date('2025-09-05'),
        isPublished: true
      },
      {
        title: 'La grâce abondante',
        description: 'La grâce de Dieu nous suffit dans toutes les circonstances de la vie.',
        bibleVerses: '2 Corinthiens 12:9, Romains 5:20',
        sermonType: 'VIDEO',
        durationMinutes: 50,
        videoUrl: 'https://example.com/video3.mp4',
        thumbnailUrl: 'https://via.placeholder.com/640x360/7C3AED/ffffff?text=Gr%C3%A2ce+abondante',
        sermonDate: new Date('2025-09-01'),
        isPublished: true
      },
      {
        title: 'Le plan parfait de Dieu',
        description: 'Comment Dieu orchestre toutes choses pour notre bien et selon son plan parfait.',
        bibleVerses: 'Romains 8:28, Jérémie 29:11',
        sermonType: 'LIVE_STREAM',
        durationMinutes: 40,
        videoUrl: 'https://example.com/live1',
        thumbnailUrl: 'https://via.placeholder.com/640x360/EF4444/ffffff?text=Plan+parfait+LIVE',
        sermonDate: new Date('2025-09-25'),
        isPublished: true
      }
    ]

    console.log(`📝 Création de ${preachings.length} prédications...`)

    let createdCount = 0
    for (const preachingData of preachings) {
      try {
        const sermon = await prisma.sermon.create({
          data: {
            ...preachingData,
            pastorId: pastor.id,
            viewCount: Math.floor(Math.random() * 200) + 50, // Entre 50 et 250 vues
            downloadCount: Math.floor(Math.random() * 50) + 10 // Entre 10 et 60 téléchargements
          }
        })
        
        console.log(`✅ "${sermon.title}" - ${sermon.sermonType}`)
        createdCount++
      } catch (error) {
        console.error(`❌ Erreur création "${preachingData.title}":`, error)
      }
    }

    console.log(`\n🎉 ${createdCount} prédications créées avec succès!`)
    console.log(`👨‍🙏 Pasteur: ${pastor.firstName} ${pastor.lastName}`)
    
    // Afficher les types de prédications créées
    const typesCreated = await prisma.sermon.groupBy({
      by: ['sermonType'],
      _count: {
        sermonType: true
      }
    })

    console.log('\n📊 Répartition par type:')
    typesCreated.forEach(type => {
      console.log(`   • ${type.sermonType}: ${type._count.sermonType} prédication(s)`)
    })

    console.log('\n🔗 Accès API:')
    console.log('   • GET /api/preachings - Consulter toutes les prédications')
    console.log('   • POST /api/preachings - Créer (PASTEUR/OUVRIER/ADMIN)')
    console.log('   • PUT /api/preachings - Modifier (PASTEUR/OUVRIER/ADMIN)')
    console.log('   • DELETE /api/preachings?id=xxx - Supprimer (PASTEUR/OUVRIER/ADMIN)')

  } catch (error) {
    console.error('❌ Erreur lors de la génération des prédications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPreachings()