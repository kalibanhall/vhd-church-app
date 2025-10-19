import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDonationProjects() {
  console.log('🌱 Création des projets de donation...')

  try {
    // Supprimer les projets existants
    await prisma.donationProject.deleteMany({})
    console.log('✅ Anciens projets supprimés')

    // Créer des projets de donations
    const projects = [
      {
        projectName: 'Nouvelle salle de prière',
        description: 'Construction d\'une nouvelle salle de prière pour accueillir plus de fidèles',
        targetAmount: 60000,
        currentAmount: 45000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        status: 'ACTIVE'
      },
      {
        projectName: 'Aide aux familles',
        description: 'Programme d\'aide aux familles en difficulté de notre communauté',
        targetAmount: 20000,
        currentAmount: 8000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        status: 'ACTIVE'
      },
      {
        projectName: 'Équipement audiovisuel',
        description: 'Modernisation du système son et vidéo pour les services',
        targetAmount: 15000,
        currentAmount: 13500,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        status: 'ACTIVE'
      },
      {
        projectName: 'Centre jeunesse',
        description: 'Création d\'un espace dédié aux activités des jeunes',
        targetAmount: 35000,
        currentAmount: 12000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
        status: 'ACTIVE'
      },
      {
        projectName: 'Rénovation toit',
        description: 'Rénovation complète de la toiture du bâtiment principal',
        targetAmount: 25000,
        currentAmount: 5000,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-08-31'),
        status: 'ACTIVE'
      }
    ]

    for (const project of projects) {
      const createdProject = await prisma.donationProject.create({
        data: project
      })
      console.log(`✅ Projet créé: ${createdProject.projectName}`)
    }

    console.log('✅ Projets de donations créés avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la création des projets:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDonationProjects()