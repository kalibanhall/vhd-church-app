import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testUsers() {
  console.log('👥 Utilisateurs disponibles pour test:')
  
  const users = await prisma.user.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      passwordHash: true
    },
    orderBy: [
      { role: 'asc' },
      { firstName: 'asc' }
    ]
  })

  for (const user of users) {
    // Tester le mot de passe générique "password123"
    const isValidPassword = await bcrypt.compare('password123', user.passwordHash)
    
    console.log(`\n📋 ${user.firstName} ${user.lastName}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   🎭 Rôle: ${user.role}`)
    console.log(`   🔑 Mot de passe "password123": ${isValidPassword ? '✅ Valide' : '❌ Invalide'}`)
    
    if (user.role === 'PASTEUR' || user.role === 'OUVRIER' || user.role === 'ADMIN') {
      console.log(`   ⚡ Permissions prédications: ✅ Créer/Modifier/Supprimer`)
    } else {
      console.log(`   ⚡ Permissions prédications: 👁️ Consulter seulement`)
    }
  }

  console.log('\n🧪 Test de connexion recommandé:')
  const pastor = users.find(u => u.role === 'PASTEUR')
  if (pastor) {
    console.log(`📧 Email: ${pastor.email}`)
    console.log(`🔑 Mot de passe: password123`)
    console.log(`🎯 Rôle: ${pastor.role}`)
  }

  await prisma.$disconnect()
}

testUsers().catch(console.error)