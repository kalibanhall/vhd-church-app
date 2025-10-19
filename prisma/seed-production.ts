/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID - SEED PRODUCTION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/kalibanhall/vhd-church-app
 * Version: 1.0.3 - PRODUCTION
 * Date: Octobre 2025
 * 
 * ATTENTION: Ce fichier ne contient PAS de comptes de test
 * Utilisation: Base de données de production uniquement
 * 
 * =============================================================================
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initialisation de la base de données PRODUCTION...')

  // Création des canaux de base seulement
  console.log('📢 Création des canaux de base...')
  
  const generalChannel = await prisma.channel.create({
    data: {
      name: 'Général',
      description: 'Discussion générale pour tous les membres',
      type: 'PUBLIC'
    }
  })

  const prayersChannel = await prisma.channel.create({
    data: {
      name: 'Prières',
      description: 'Canal dédié aux demandes de prières',
      type: 'PUBLIC'
    }
  })

  const announcementChannel = await prisma.channel.create({
    data: {
      name: 'Annonces',
      description: 'Annonces officielles de l\'église',
      type: 'PUBLIC'
    }
  })

  console.log('✅ 3 canaux de base créés')

  // Création des projets de donation de base
  console.log('💰 Création des projets de donation...')
  
  await prisma.donationProject.create({
    data: {
      projectName: 'Construction du nouveau sanctuaire',
      description: 'Projet de construction d\'un nouveau lieu de culte pour accueillir plus de fidèles',
      targetAmount: 50000.00,
      currentAmount: 0.00,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // +1 an
    }
  })

  await prisma.donationProject.create({
    data: {
      projectName: 'Aide aux familles dans le besoin',
      description: 'Soutien financier et matériel pour les familles de notre communauté',
      targetAmount: 10000.00,
      currentAmount: 0.00,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // +6 mois
    }
  })

  console.log('✅ 2 projets de donation créés')

  console.log('🎉 Initialisation PRODUCTION terminée avec succès !')
  console.log('⚠️  IMPORTANT: Créez votre premier administrateur via l\'interface web')
  console.log('🔗 URL: /auth puis cliquer sur "Créer le premier administrateur"')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })