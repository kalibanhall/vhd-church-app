/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * Version: 1.0.3
 * Date: Octobre 2025
 * 
 * Script de seed pour initialiser l'admin par défaut
 * =============================================================================
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seedDefaultAdmin() {
  try {
    console.log('🌱 Initialisation admin par défaut...')
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin existant trouvé:', existingAdmin.email)
      return existingAdmin
    }
    
    // Créer l'admin par défaut Chris Kasongo
    const adminEmail = 'admin@vhd.app'
    const adminPassword = 'Qualis@2025'
    
    console.log('👤 Création admin par défaut...')
    
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Chris',
        lastName: 'Kasongo',
        phone: '+243 999 999 999',
        role: 'ADMIN',
        status: 'ACTIVE',
        membershipDate: new Date(),
        membershipNumber: `ADM${Date.now().toString().slice(-6)}`
      }
    })
    
    console.log('✅ Admin créé avec succès:')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Nom: ${admin.firstName} ${admin.lastName}`)
    console.log(`🎯 Rôle: ${admin.role}`)
    console.log(`📊 Statut: ${admin.status}`)
    console.log(`🔢 Numéro: ${admin.membershipNumber}`)
    
    return admin
    
  } catch (error) {
    console.error('❌ Erreur création admin:', error)
    throw error
  }
}

export async function seedBasicData(adminId: string) {
  try {
    console.log('🌱 Seed des données de base...')
    
    // Événement d'exemple
    const eventDate = new Date()
    eventDate.setDate(eventDate.getDate() + 7) // Dimanche prochain
    
    const startTime = new Date(eventDate)
    startTime.setHours(10, 0, 0, 0) // 10:00 AM
    
    const endTime = new Date(eventDate)  
    endTime.setHours(12, 0, 0, 0) // 12:00 PM
    
    const exampleEvent = await prisma.event.upsert({
      where: { id: 'example-event-1' },
      update: {},
      create: {
        id: 'example-event-1',
        title: 'Culte Dominical',
        description: 'Culte hebdomadaire du dimanche matin avec prédication, louange et communion fraternelle.',
        eventDate: eventDate,
        startTime: startTime,
        endTime: endTime,
        eventType: 'WORSHIP_SERVICE',
        location: 'Sanctuaire Principal - Église VHD, Kinshasa',
        createdBy: adminId,
        animatedBy: adminId,
        showOnHomepage: true
      }
    })
    
    console.log('✅ Événement exemple créé:', exampleEvent.title)
    
  } catch (error) {
    console.error('❌ Erreur seed données:', error)
    throw error
  }
}

// Fonction principale de seed
export async function runSeed() {
  try {
    console.log('🚀 DÉMARRAGE DU SEED VHD CHURCH APP')
    console.log('=' .repeat(50))
    
    const admin = await seedDefaultAdmin()
    await seedBasicData(admin.id)
    
    console.log('=' .repeat(50))
    console.log('✅ SEED TERMINÉ AVEC SUCCÈS !')
    console.log('')
    console.log('🎯 INFORMATIONS DE CONNEXION ADMIN:')
    console.log('📧 Email: admin@vhd.app')
    console.log('🔑 Mot de passe: Qualis@2025')
    console.log('')
    console.log('🌐 Accédez à votre application et connectez-vous !')
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE SEED:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le seed si appelé directement
if (require.main === module) {
  runSeed()
}