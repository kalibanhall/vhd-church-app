import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initialisation de la base de données...')

  // Hash du mot de passe par défaut
  const defaultPasswordHash = await bcrypt.hash('password123', 10)

  // Création des utilisateurs
  console.log('👥 Création des utilisateurs...')
  
  const pastor = await prisma.user.create({
    data: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'pastor@mychurch.com',
      phone: '+33123456789',
      passwordHash: defaultPasswordHash,
      role: 'PASTOR',
      status: 'ACTIVE',
      birthDate: new Date('1975-05-15'),
      address: '123 Rue de la Paix, 75001 Paris',
      membershipDate: new Date('2020-01-01'),
      membershipNumber: 'PAST001',
      emergencyContactName: 'Marie Dupont',
      emergencyContactPhone: '+33123456790',
      baptismDate: new Date('1995-08-20'),
      maritalStatus: 'MARRIED',
      profession: 'Pasteur'
    }
  })

  const admin = await prisma.user.create({
    data: {
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'admin@mychurch.com',
      phone: '+33987654321',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      birthDate: new Date('1980-03-22'),
      address: '456 Avenue de la Liberté, 75002 Paris',
      membershipDate: new Date('2020-02-15'),
      membershipNumber: 'ADM001',
      maritalStatus: 'SINGLE',
      profession: 'Administratrice'
    }
  })

  const member1 = await prisma.user.create({
    data: {
      firstName: 'Pierre',
      lastName: 'Moreau',
      email: 'pierre.moreau@email.com',
      phone: '+33145789632',
      passwordHash: defaultPasswordHash,
      role: 'FIDELE',
      status: 'ACTIVE',
      birthDate: new Date('1990-07-10'),
      address: '789 Rue de l\'Espoir, 75003 Paris',
      membershipDate: new Date('2021-06-01'),
      membershipNumber: 'MEM001',
      maritalStatus: 'MARRIED',
      profession: 'Ingénieur'
    }
  })

  const worker = await prisma.user.create({
    data: {
      firstName: 'Sophie',
      lastName: 'Laurent',
      email: 'sophie.laurent@mychurch.com',
      phone: '+33156789012',
      passwordHash: defaultPasswordHash,
      role: 'OUVRIER',
      status: 'ACTIVE',
      birthDate: new Date('1985-12-03'),
      address: '456 Avenue des Ouvriers, 75004 Paris',
      membershipDate: new Date('2019-03-15'),
      membershipNumber: 'OUV001',
      maritalStatus: 'SINGLE',
      profession: 'Ouvrière de l\'Église'
    }
  })

  console.log('✅ 4 utilisateurs créés')

  // Création des canaux
  console.log('📢 Création des canaux...')
  
  const generalChannel = await prisma.channel.create({
    data: {
      name: 'Général',
      description: 'Discussion générale pour tous les membres',
      type: 'PUBLIC'
    }
  })

  const prayerChannel = await prisma.channel.create({
    data: {
      name: 'Prières',
      description: 'Partagez vos demandes de prière',
      type: 'PRAYER'
    }
  })

  console.log('✅ 2 canaux créés')

  // Ajout des membres aux canaux
  await prisma.channelMember.createMany({
    data: [
      {
        channelId: generalChannel.id,
        userId: pastor.id,
        role: 'ADMIN'
      },
      {
        channelId: generalChannel.id,
        userId: admin.id,
        role: 'MODERATOR'
      },
      {
        channelId: generalChannel.id,
        userId: member1.id,
        role: 'MEMBER'
      },
      {
        channelId: prayerChannel.id,
        userId: pastor.id,
        role: 'ADMIN'
      },
      {
        channelId: prayerChannel.id,
        userId: member1.id,
        role: 'MEMBER'
      },
      {
        channelId: generalChannel.id,
        userId: worker.id,
        role: 'MODERATOR'
      },
      {
        channelId: prayerChannel.id,
        userId: worker.id,
        role: 'MODERATOR'
      }
    ]
  })

  // Création d'une demande de prière
  console.log('🙏 Création d\'une demande de prière...')
  
  await prisma.prayer.create({
    data: {
      userId: member1.id,
      title: 'Guérison pour ma famille',
      content: 'Priez pour la guérison de ma mère qui est malade.',
      category: 'HEALING',
      isPublic: true
    }
  })

  // Création d'un témoignage
  console.log('✨ Création d\'un témoignage...')
  
  await prisma.testimony.create({
    data: {
      userId: member1.id,
      title: 'Dieu m\'a béni',
      content: 'Je veux témoigner de la bonté de Dieu dans ma vie.',
      category: 'SPIRITUAL_GROWTH',
      isApproved: true,
      isPublished: true,
      approvedBy: pastor.id,
      approvedAt: new Date(),
      publishedAt: new Date()
    }
  })

  // Création d'un don
  console.log('💰 Création d\'un don...')
  
  await prisma.donation.create({
    data: {
      userId: member1.id,
      amount: 100.00,
      donationType: 'TITHE',
      paymentMethod: 'CARD',
      donationDate: new Date(),
      status: 'COMPLETED',
      receiptNumber: 'DON001'
    }
  })

  console.log('🎉 Initialisation terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })