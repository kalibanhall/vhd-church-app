import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuthentication } from '../../../../../lib/auth-middleware'

// GET - Vérifier et programmer les notifications d'anniversaire
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    // Vérifier les permissions admin
    if (!['ADMIN', 'PASTEUR', 'PASTOR'].includes(auth.user!.role)) {
      return NextResponse.json({
        error: 'Accès non autorisé - Droits administrateur requis'
      }, { status: 403 })
    }

    const today = new Date()
    const todayMonth = today.getMonth() + 1
    const todayDay = today.getDate()

    // Trouver les utilisateurs qui ont leur anniversaire aujourd'hui
    const birthdayUsers = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        birthDate: {
          not: null
        }
      }
    })

    const todayBirthdays = birthdayUsers.filter(user => {
      if (!user.birthDate) return false
      const birthDate = new Date(user.birthDate)
      return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay
    })

    // Créer des notifications pour tous les autres utilisateurs
    let sentNotifications = 0
    const allActiveUsers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true }
    })

    for (const birthdayUser of todayBirthdays) {
      const age = today.getFullYear() - new Date(birthdayUser.birthDate!).getFullYear()
      
      // Créer une notification pour chaque utilisateur actif
      for (const user of allActiveUsers) {
        // Vérifier si une notification d'anniversaire n'a pas déjà été envoyée aujourd'hui
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: 'birthday',
            message: {
              contains: birthdayUser.firstName
            },
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
            }
          }
        })

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              title: `🎉 Anniversaire de ${birthdayUser.firstName} ${birthdayUser.lastName}`,
              message: `C'est l'anniversaire de ${birthdayUser.firstName} ${birthdayUser.lastName} ! Il/Elle fête ses ${age} ans aujourd'hui. N'hésitez pas à lui souhaiter un joyeux anniversaire ! 🎂`,
              type: 'birthday',
              userId: user.id,
              isRead: false
            }
          })
          sentNotifications++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Vérification des anniversaires terminée`,
      birthdaysToday: todayBirthdays.length,
      birthdayUsers: todayBirthdays.map(u => `${u.firstName} ${u.lastName}`),
      notificationsSent: sentNotifications
    })

  } catch (error) {
    console.error('Erreur lors de la vérification des anniversaires:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// POST - Créer une notification de bienvenue pour un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    // Vérifier les permissions admin
    if (!['ADMIN', 'PASTEUR', 'PASTOR'].includes(auth.user!.role)) {
      return NextResponse.json({
        error: 'Accès non autorisé - Droits administrateur requis'
      }, { status: 403 })
    }

    const { userId, customMessage } = await request.json()

    if (!userId) {
      return NextResponse.json({
        error: 'ID utilisateur requis'
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({
        error: 'Utilisateur non trouvé'
      }, { status: 404 })
    }

    // Message de bienvenue par défaut ou personnalisé
    const welcomeMessage = customMessage || 
      `Bienvenue dans la communauté des Ministères Vaillants Hommes de David ! 🙏 ` +
      `Nous sommes ravis de vous accueillir parmi nous. N'hésitez pas à explorer l'application ` +
      `et à participer aux différentes activités de notre communauté. Que Dieu vous bénisse ! ✨`

    // Créer la notification de bienvenue
    const notification = await prisma.notification.create({
      data: {
        title: `👋 Bienvenue ${user.firstName} !`,
        message: welcomeMessage,
        type: 'welcome',
        userId: user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification de bienvenue envoyée',
      notification
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de bienvenue:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}