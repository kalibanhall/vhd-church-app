import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateRoles() {
  try {
    console.log('🚀 Migration des rôles utilisateurs...')

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany()
    
    console.log(`📊 ${users.length} utilisateurs trouvés`)

    let updatedCount = 0

    for (const user of users) {
      let newRole = user.role

      // Mapper les anciens rôles vers les nouveaux
      switch (user.role) {
        case 'MEMBER':
          newRole = 'FIDELE'
          break
        case 'PASTOR':
          newRole = 'PASTEUR'
          break
        case 'DEACON':
          newRole = 'OUVRIER'
          break
        case 'ADMIN':
          newRole = 'ADMIN'
          break
        default:
          if (!['FIDELE', 'OUVRIER', 'PASTEUR', 'ADMIN'].includes(user.role)) {
            newRole = 'FIDELE' // Par défaut
          }
      }

      if (newRole !== user.role) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: newRole as any }
          })
          
          console.log(`✅ ${user.firstName} ${user.lastName}: ${user.role} → ${newRole}`)
          updatedCount++
        } catch (error) {
          console.error(`❌ Erreur mise à jour ${user.firstName} ${user.lastName}:`, error)
        }
      }
    }

    console.log(`\n🎉 Migration terminée!`)
    console.log(`📈 ${updatedCount} utilisateurs mis à jour`)
    console.log(`\n📋 Nouveaux rôles disponibles:`)
    console.log(`   • FIDELE (anciennement MEMBER)`)
    console.log(`   • OUVRIER (anciennement DEACON)`)
    console.log(`   • PASTEUR (anciennement PASTOR)`)
    console.log(`   • ADMIN (inchangé)`)

    // Créer un compte pasteur et ouvrier de test si pas encore existants
    const pastorExists = await prisma.user.findFirst({
      where: { role: 'PASTEUR' }
    })

    const ouvierExists = await prisma.user.findFirst({
      where: { role: 'OUVRIER' }
    })

    if (!pastorExists) {
      console.log('\n👨‍🙏 Création d\'un compte Pasteur de test...')
      await prisma.user.create({
        data: {
          firstName: 'Paul',
          lastName: 'Kabamba',
          email: 'pasteur@myChurch.app',
          passwordHash: '$2b$10$8K4qOjv5GKk4vK5QxT0k0eXz5h.FN4zT0Q6vK5QxT0k0eXz5h.FN4z', // password: pastor123
          role: 'PASTEUR',
          status: 'ACTIVE',
          membershipDate: new Date(),
          membershipNumber: 'P-2025-001',
          phone: '+33123456789'
        }
      })
      console.log('✅ Compte Pasteur créé: pasteur@myChurch.app / pastor123')
    }

    if (!ouvierExists) {
      console.log('\n👷 Création d\'un compte Ouvrier de test...')
      await prisma.user.create({
        data: {
          firstName: 'Marie',
          lastName: 'Durand',
          email: 'ouvrier@myChurch.app',
          passwordHash: '$2b$10$8K4qOjv5GKk4vK5QxT0k0eXz5h.FN4zT0Q6vK5QxT0k0eXz5h.FN4z', // password: ouvrier123
          role: 'OUVRIER',
          status: 'ACTIVE',
          membershipDate: new Date(),
          membershipNumber: 'O-2025-001',
          phone: '+33987654321'
        }
      })
      console.log('✅ Compte Ouvrier créé: ouvrier@myChurch.app / ouvrier123')
    }

    console.log('\n🔐 Permissions pour les prédications:')
    console.log('   • PASTEUR: Créer, modifier ses prédications, supprimer ses prédications')
    console.log('   • OUVRIER: Créer, modifier ses prédications, supprimer ses prédications')
    console.log('   • ADMIN: Créer, modifier toutes, supprimer toutes')
    console.log('   • FIDELE: Consulter seulement les prédications publiées')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateRoles()