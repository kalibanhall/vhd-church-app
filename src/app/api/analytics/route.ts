import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

// Vérification de l'authentification et du rôle administrateur
async function verifyAuth(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return { error: 'Token manquant', status: 401 }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.id || decoded.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, firstName: true, lastName: true }
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé', status: 404 }
    }

    if (!['ADMIN', 'PASTEUR'].includes(user.role)) {
      return { 
        error: `Accès réservé aux administrateurs et pasteurs. Votre rôle: ${user.role}`, 
        status: 403 
      }
    }

    return { user }
  } catch (error) {
    console.error('Erreur lors de la vérification JWT:', error)
    return { error: 'Token invalide', status: 401 }
  }
}

// GET - Récupérer les statistiques analytics
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/analytics appelée')
    
    const auth = await verifyAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Statistiques des membres
    const totalMembers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    })

    const newMembersThisMonth = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        membershipDate: { gte: startOfMonth }
      }
    })

    const newMembersLastMonth = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        membershipDate: {
          gte: startOfLastMonth,
          lt: startOfMonth
        }
      }
    })

    // 2. Statistiques des donations
    const totalDonationsThisMonth = await prisma.donation.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true }
    })

    const totalDonationsLastMonth = await prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth
        }
      },
      _sum: { amount: true }
    })

    const totalDonationsThisYear = await prisma.donation.aggregate({
      where: { createdAt: { gte: startOfYear } },
      _sum: { amount: true }
    })

    // 3. Statistiques des événements
    const totalEvents = await prisma.event.count()
    const upcomingEvents = await prisma.event.count({
      where: {
        eventDate: { gte: today },
        status: 'SCHEDULED'
      }
    })

    // 4. Statistiques des prédications/sermons avec vues
    const totalSermons = await prisma.sermon.count()
    const publishedSermons = await prisma.sermon.count({
      where: { isPublished: true }
    })

    const sermonViews = await prisma.sermon.aggregate({
      _sum: { viewCount: true }
    })

    const sermonDownloads = await prisma.sermon.aggregate({
      _sum: { downloadCount: true }
    })

    // Top 10 des sermons les plus vus
    const topSermons = await prisma.sermon.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        viewCount: true,
        downloadCount: true,
        createdAt: true,
        event: {
          select: {
            title: true,
            eventDate: true
          }
        }
      }
    })

    // 5. Statistiques des prières et témoignages
    const totalPrayers = await prisma.prayer.count()
    const prayersThisMonth = await prisma.prayer.count({
      where: { createdAt: { gte: startOfMonth } }
    })

    const totalTestimonies = await prisma.testimony.count()
    const testimoniesThisMonth = await prisma.testimony.count({
      where: { createdAt: { gte: startOfMonth } }
    })

    // 6. Messages et engagement
    const totalMessages = await prisma.message.count()
    const messagesThisMonth = await prisma.message.count({
      where: { createdAt: { gte: startOfMonth } }
    })

    // 7. Engagement des utilisateurs (top 10)
    const userEngagement = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            donations: { where: { createdAt: { gte: startOfMonth } } },
            prayers: { where: { createdAt: { gte: startOfMonth } } },
            testimonies: { where: { createdAt: { gte: startOfMonth } } },
            messages: { where: { createdAt: { gte: startOfMonth } } }
          }
        }
      },
      take: 10
    })

    // 8. Calcul des taux de croissance
    const memberGrowth = newMembersLastMonth > 0 
      ? ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100
      : newMembersThisMonth > 0 ? 100 : 0

    const donationGrowth = (totalDonationsLastMonth._sum.amount || 0) > 0
      ? (((totalDonationsThisMonth._sum.amount || 0) - (totalDonationsLastMonth._sum.amount || 0)) / (totalDonationsLastMonth._sum.amount || 1)) * 100
      : (totalDonationsThisMonth._sum.amount || 0) > 0 ? 100 : 0

    // 9. Activité récente
    const recentDonations = await prisma.donation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    const recentEvents = await prisma.event.findMany({
      where: { eventDate: { gte: today } },
      take: 5,
      orderBy: { eventDate: 'asc' },
      include: {
        creator: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    const analyticsData = {
      // Vue d'ensemble
      totalMembers,
      newMembersThisMonth,
      totalDonationsThisMonth: totalDonationsThisMonth._sum.amount || 0,
      totalDonationsThisYear: totalDonationsThisYear._sum.amount || 0,
      totalEvents,
      upcomingEvents,
      totalSermons,
      publishedSermons,
      totalSermonViews: sermonViews._sum.viewCount || 0,
      totalSermonDownloads: sermonDownloads._sum.downloadCount || 0,
      totalPrayers,
      prayersThisMonth,
      totalTestimonies,
      testimoniesThisMonth,
      totalMessages,
      messagesThisMonth,

      // Croissance
      memberGrowth: Math.round(memberGrowth * 10) / 10,
      donationGrowth: Math.round(donationGrowth * 10) / 10,

      // Données détaillées
      topSermons,
      userEngagement: userEngagement.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        totalInteractions: 
          user._count.donations + 
          user._count.prayers + 
          user._count.testimonies + 
          user._count.messages,
        donations: user._count.donations,
        prayers: user._count.prayers,
        testimonies: user._count.testimonies,
        messages: user._count.messages
      })),

      // Activités récentes
      recentDonations: recentDonations.map(d => ({
        id: d.id,
        type: 'donation',
        description: `Don de ${d.amount.toLocaleString()} CDF`,
        user: `${d.user.firstName} ${d.user.lastName}`,
        date: d.createdAt,
        amount: d.amount
      })),

      recentEvents: recentEvents.map(e => ({
        id: e.id,
        type: 'event',
        title: e.title,
        date: e.eventDate,
        creator: `${e.creator.firstName} ${e.creator.lastName}`,
        status: e.status
      }))
    }

    console.log('✅ Analytics récupérés avec succès')
    return NextResponse.json({ 
      success: true, 
      analytics: analyticsData 
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des analytics:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}