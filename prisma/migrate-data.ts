import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🗄️ Migration SQLite vers PostgreSQL compatible...')

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@church.com' }
  })

  if (!existingAdmin) {
    // Créer l'utilisateur admin
    const adminPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        firstName: 'Administrateur',
        lastName: 'Système',
        email: 'admin@church.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        membershipDate: new Date(),
        membershipNumber: 'ADMIN001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Admin créé:', admin.email)
  }

  // Créer quelques utilisateurs de test
  const testUsers = [
    {
      firstName: 'Jean',
      lastName: 'Pasteur',
      email: 'pasteur@church.com',
      role: 'PASTOR',
      membershipNumber: 'PAST002'
    },
    {
      firstName: 'Marie',
      lastName: 'Diacre',
      email: 'diacre@church.com',
      role: 'DEACON',
      membershipNumber: 'DEAC002'
    },
    {
      firstName: 'Pierre',
      lastName: 'Membre',
      email: 'membre@church.com',
      role: 'MEMBER',
      membershipNumber: 'MEM002'
    }
  ]

  for (const userData of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existing) {
      const hashedPassword = await bcrypt.hash('password123', 12)
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          passwordHash: hashedPassword,
          status: 'ACTIVE',
          membershipDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log('✅ Utilisateur créé:', user.email)
    }
  }

  console.log('🎉 Migration terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })