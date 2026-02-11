/**
 * =============================================================================
 * API FORMATIONS - GESTION DES PARCOURS DE FORMATION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: API pour gérer les formations, cours et progression des membres.
 * Les formations sont créées par l'admin et les membres peuvent s'y inscrire.
 * Aucune donnée n'est prédéfinie - tout est créé via le backoffice admin.
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

// Types
interface Course {
  id: string
  title: string
  description: string
  category: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  duration: string
  lessons: Lesson[]
  instructor?: string
  imageUrl?: string
  isPublished: boolean
  enrolledCount: number
  createdAt: string
}

interface Lesson {
  id: string
  courseId: string
  title: string
  content: string
  videoUrl?: string
  order: number
  duration?: string
}

interface Enrollment {
  id: string
  userId: string
  userName: string
  courseId: string
  courseName: string
  progress: number
  completedLessons: string[]
  startedAt: string
  completedAt?: string
  certificateId?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED'
}

// Stockage en mémoire (sera remplacé par la BD)
// Commencer avec des tableaux vides - les formations sont créées par l'admin
let courses: Course[] = []
let enrollments: Enrollment[] = []

/**
 * GET - Récupérer les cours ou les inscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'courses'
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    const category = searchParams.get('category')
    const isAdmin = searchParams.get('admin') === 'true'

    // Essayer de récupérer depuis le backend
    try {
      const backendUrl = new URL(`${API_BASE_URL}/training/${type}`)
      if (userId) backendUrl.searchParams.set('userId', userId)
      if (courseId) backendUrl.searchParams.set('courseId', courseId)
      if (category) backendUrl.searchParams.set('category', category)
      if (isAdmin) backendUrl.searchParams.set('admin', 'true')

      const response = await fetch(backendUrl.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour le cache local
        if (data.courses) courses = data.courses
        if (data.enrollments) {
          if (type === 'enrollments') {
            enrollments = data.enrollments
          }
        }
        return NextResponse.json(data)
      }
    } catch (err) {
      console.log('Backend non disponible, utilisation du cache local')
    }

    // Fallback: utiliser les données locales
    if (type === 'courses') {
      let filteredCourses = isAdmin ? courses : courses.filter(c => c.isPublished)
      if (category) {
        filteredCourses = filteredCourses.filter(c => c.category === category)
      }
      return NextResponse.json({ 
        courses: filteredCourses,
        total: filteredCourses.length,
        source: 'local'
      })
    }

    if (type === 'enrollments') {
      // Admin: récupérer toutes les inscriptions
      return NextResponse.json({ 
        enrollments: enrollments,
        total: enrollments.length,
        source: 'local'
      })
    }

    if (type === 'course' && courseId) {
      const course = courses.find(c => c.id === courseId)
      if (!course) {
        return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
      }
      return NextResponse.json({ course })
    }

    if (type === 'my-enrollments' && userId) {
      const userEnrollments = enrollments.filter(e => e.userId === userId)
      return NextResponse.json({ 
        enrollments: userEnrollments,
        total: userEnrollments.length,
        source: 'local'
      })
    }

    if (type === 'enrollment' && courseId && userId) {
      const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId)
      return NextResponse.json({ enrollment })
    }

    return NextResponse.json({ 
      courses: isAdmin ? courses : courses.filter(c => c.isPublished),
      source: 'local'
    })

  } catch (error: unknown) {
    console.error('❌ Training GET proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST - S'inscrire à un cours, créer un cours, ou autres actions
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { action, userId, userName, courseId, lessonId } = body

    // Essayer d'envoyer au backend
    try {
      const response = await fetch(`${API_BASE_URL}/training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data, { status: 201 })
      }
    } catch {
      console.log('Backend non disponible, traitement local')
    }

    // Fallback: traitement local
    if (action === 'enroll') {
      // Vérifier si déjà inscrit
      const existingEnrollment = enrollments.find(
        e => e.userId === userId && e.courseId === courseId
      )
      if (existingEnrollment) {
        return NextResponse.json(
          { error: 'Vous êtes déjà inscrit à ce cours' },
          { status: 400 }
        )
      }

      // Trouver le cours
      const course = courses.find(c => c.id === courseId)
      if (!course) {
        return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
      }

      // Créer l'inscription (en attente de validation par l'admin)
      const newEnrollment: Enrollment = {
        id: `enroll_${Date.now()}`,
        userId,
        userName: userName || 'Utilisateur',
        courseId,
        courseName: course.title,
        progress: 0,
        completedLessons: [],
        startedAt: new Date().toISOString(),
        status: 'PENDING' // En attente de validation admin
      }

      enrollments.push(newEnrollment)

      return NextResponse.json({
        message: 'Demande d\'inscription envoyée. Elle sera validée par un administrateur.',
        enrollment: newEnrollment
      }, { status: 201 })
    }

    // Admin: Créer un nouveau cours
    if (action === 'create') {
      const { title, description, category, level, duration, instructor, imageUrl, isPublished, lessons } = body
      
      const courseIdGen = `course_${Date.now()}`
      const newCourse: Course = {
        id: courseIdGen,
        title,
        description: description || '',
        category: category || 'FOUNDATIONS',
        level: level || 'BEGINNER',
        duration: duration || '4 semaines',
        instructor: instructor || '',
        imageUrl: imageUrl || '',
        isPublished: isPublished || false,
        enrolledCount: 0,
        createdAt: new Date().toISOString(),
        lessons: (lessons || []).map((lesson: Partial<Lesson>, index: number) => ({
          id: `lesson_${Date.now()}_${index}`,
          courseId: courseIdGen,
          title: lesson.title || '',
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          duration: lesson.duration || '',
          order: index + 1
        }))
      }

      courses.push(newCourse)

      return NextResponse.json({
        success: true,
        message: 'Formation créée avec succès',
        course: newCourse
      }, { status: 201 })
    }

    // Admin: Mettre à jour un cours
    if (action === 'update') {
      const { courseId: updateCourseId, title, description, category, level, duration, instructor, imageUrl, isPublished, lessons } = body
      
      const courseIndex = courses.findIndex(c => c.id === updateCourseId)
      if (courseIndex === -1) {
        return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
      }

      courses[courseIndex] = {
        ...courses[courseIndex],
        title: title || courses[courseIndex].title,
        description: description || courses[courseIndex].description,
        category: category || courses[courseIndex].category,
        level: level || courses[courseIndex].level,
        duration: duration || courses[courseIndex].duration,
        instructor: instructor !== undefined ? instructor : courses[courseIndex].instructor,
        imageUrl: imageUrl !== undefined ? imageUrl : courses[courseIndex].imageUrl,
        isPublished: isPublished !== undefined ? isPublished : courses[courseIndex].isPublished,
        lessons: lessons ? lessons.map((lesson: Partial<Lesson>, index: number) => ({
          id: lesson.id || `lesson_${Date.now()}_${index}`,
          courseId: updateCourseId,
          title: lesson.title || '',
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          duration: lesson.duration || '',
          order: index + 1
        })) : courses[courseIndex].lessons
      }

      return NextResponse.json({
        success: true,
        message: 'Formation mise à jour',
        course: courses[courseIndex]
      })
    }

    // Admin: Valider ou rejeter une inscription
    if (action === 'validate-enrollment') {
      const { enrollmentId, status: newStatus } = body
      
      const enrollmentIndex = enrollments.findIndex(e => e.id === enrollmentId)
      if (enrollmentIndex === -1) {
        return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 })
      }

      enrollments[enrollmentIndex].status = newStatus

      // Si approuvé, incrémenter le compteur
      if (newStatus === 'APPROVED') {
        const courseIndex = courses.findIndex(c => c.id === enrollments[enrollmentIndex].courseId)
        if (courseIndex !== -1) {
          courses[courseIndex].enrolledCount += 1
        }
      }

      return NextResponse.json({
        success: true,
        message: newStatus === 'APPROVED' ? 'Inscription approuvée' : 'Inscription rejetée',
        enrollment: enrollments[enrollmentIndex]
      })
    }

    if (action === 'complete-lesson') {
      // Trouver l'inscription
      const enrollmentIndex = enrollments.findIndex(
        e => e.userId === userId && e.courseId === courseId
      )
      if (enrollmentIndex === -1) {
        return NextResponse.json(
          { error: 'Inscription non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier que l'inscription est approuvée
      if (enrollments[enrollmentIndex].status !== 'APPROVED' && enrollments[enrollmentIndex].status !== 'IN_PROGRESS') {
        return NextResponse.json(
          { error: 'Votre inscription n\'est pas encore validée' },
          { status: 403 }
        )
      }

      // Mettre le statut en cours si c'était approuvé
      if (enrollments[enrollmentIndex].status === 'APPROVED') {
        enrollments[enrollmentIndex].status = 'IN_PROGRESS'
      }

      // Marquer la leçon comme complétée
      if (!enrollments[enrollmentIndex].completedLessons.includes(lessonId)) {
        enrollments[enrollmentIndex].completedLessons.push(lessonId)
      }

      // Calculer la progression
      const course = courses.find(c => c.id === courseId)
      if (course) {
        const progress = Math.round(
          (enrollments[enrollmentIndex].completedLessons.length / course.lessons.length) * 100
        )
        enrollments[enrollmentIndex].progress = progress

        // Si cours terminé
        if (progress === 100 && !enrollments[enrollmentIndex].completedAt) {
          enrollments[enrollmentIndex].completedAt = new Date().toISOString()
          enrollments[enrollmentIndex].certificateId = `cert_${Date.now()}`
          enrollments[enrollmentIndex].status = 'COMPLETED'
        }
      }

      return NextResponse.json({
        message: 'Progression mise à jour',
        enrollment: enrollments[enrollmentIndex]
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

  } catch (error: unknown) {
    console.error('❌ Training POST proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'opération' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Mettre à jour un cours ou une inscription
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, enrollmentId, isPublished, status } = body

    // Essayer d'envoyer au backend
    try {
      const response = await fetch(`${API_BASE_URL}/training`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {
      console.log('Backend non disponible, traitement local')
    }

    // Mise à jour d'une inscription (validation admin)
    if (enrollmentId) {
      const enrollmentIndex = enrollments.findIndex(e => e.id === enrollmentId)
      if (enrollmentIndex === -1) {
        return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 })
      }

      if (status) {
        enrollments[enrollmentIndex].status = status
        
        // Si approuvé, incrémenter le compteur
        if (status === 'APPROVED') {
          const courseIndex = courses.findIndex(c => c.id === enrollments[enrollmentIndex].courseId)
          if (courseIndex !== -1) {
            courses[courseIndex].enrolledCount += 1
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: status === 'APPROVED' ? 'Inscription approuvée' : 'Inscription mise à jour',
        enrollment: enrollments[enrollmentIndex]
      })
    }

    // Mise à jour d'un cours
    if (courseId) {
      const courseIndex = courses.findIndex(c => c.id === courseId)
      if (courseIndex === -1) {
        return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
      }

      if (isPublished !== undefined) {
        courses[courseIndex].isPublished = isPublished
      }

      return NextResponse.json({
        success: true,
        message: isPublished ? 'Formation publiée' : 'Formation dépubliée',
        course: courses[courseIndex]
      })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  } catch (error: unknown) {
    console.error('❌ Training PUT proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Supprimer un cours
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    // Essayer d'envoyer au backend
    try {
      const response = await fetch(`${API_BASE_URL}/training`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {
      console.log('Backend non disponible, traitement local')
    }

    const courseIndex = courses.findIndex(c => c.id === courseId)
    if (courseIndex === -1) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    // Supprimer le cours
    courses.splice(courseIndex, 1)

    // Supprimer les inscriptions associées
    enrollments = enrollments.filter(e => e.courseId !== courseId)

    return NextResponse.json({
      success: true,
      message: 'Formation supprimée avec succès'
    })

  } catch (error: unknown) {
    console.error('❌ Training DELETE proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
