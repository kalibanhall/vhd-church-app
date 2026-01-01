/**
 * =============================================================================
 * API FORMATIONS - GESTION DES PARCOURS DE FORMATION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: API pour gérer les formations, cours et progression des membres.
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

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
}

// Données des formations
const courses: Course[] = [
  {
    id: 'course_1',
    title: 'Fondements de la Foi',
    description: 'Découvrez les bases essentielles de la foi chrétienne. Ce cours vous guidera à travers les doctrines fondamentales.',
    category: 'FOUNDATIONS',
    level: 'BEGINNER',
    duration: '4 semaines',
    instructor: 'Pasteur Jean-Marc',
    enrolledCount: 45,
    isPublished: true,
    createdAt: new Date().toISOString(),
    lessons: [
      { id: 'l1_1', courseId: 'course_1', title: 'Introduction à la foi chrétienne', content: 'Contenu de la leçon...', order: 1, duration: '30 min' },
      { id: 'l1_2', courseId: 'course_1', title: 'La Bible : Parole de Dieu', content: 'Contenu de la leçon...', order: 2, duration: '45 min' },
      { id: 'l1_3', courseId: 'course_1', title: 'Qui est Jésus-Christ ?', content: 'Contenu de la leçon...', order: 3, duration: '40 min' },
      { id: 'l1_4', courseId: 'course_1', title: 'Le Saint-Esprit', content: 'Contenu de la leçon...', order: 4, duration: '35 min' },
      { id: 'l1_5', courseId: 'course_1', title: 'La prière et la communion avec Dieu', content: 'Contenu de la leçon...', order: 5, duration: '40 min' }
    ]
  },
  {
    id: 'course_2',
    title: 'Préparation au Baptême',
    description: 'Cours obligatoire pour tous les candidats au baptême. Comprendre le sens et l\'engagement du baptême chrétien.',
    category: 'BAPTISM',
    level: 'BEGINNER',
    duration: '3 semaines',
    instructor: 'Diacre Paul',
    enrolledCount: 28,
    isPublished: true,
    createdAt: new Date().toISOString(),
    lessons: [
      { id: 'l2_1', courseId: 'course_2', title: 'Pourquoi se faire baptiser ?', content: 'Contenu de la leçon...', order: 1, duration: '30 min' },
      { id: 'l2_2', courseId: 'course_2', title: 'Le baptême dans la Bible', content: 'Contenu de la leçon...', order: 2, duration: '35 min' },
      { id: 'l2_3', courseId: 'course_2', title: 'Témoignage et engagement', content: 'Contenu de la leçon...', order: 3, duration: '25 min' },
      { id: 'l2_4', courseId: 'course_2', title: 'Préparation pratique', content: 'Contenu de la leçon...', order: 4, duration: '20 min' }
    ]
  },
  {
    id: 'course_3',
    title: 'École des Leaders',
    description: 'Formation avancée pour les futurs responsables de groupes de maison et départements.',
    category: 'LEADERSHIP',
    level: 'ADVANCED',
    duration: '8 semaines',
    instructor: 'Pasteur Principal',
    enrolledCount: 15,
    isPublished: true,
    createdAt: new Date().toISOString(),
    lessons: [
      { id: 'l3_1', courseId: 'course_3', title: 'Introduction au leadership chrétien', content: 'Contenu de la leçon...', order: 1, duration: '45 min' },
      { id: 'l3_2', courseId: 'course_3', title: 'Le leader serviteur', content: 'Contenu de la leçon...', order: 2, duration: '50 min' },
      { id: 'l3_3', courseId: 'course_3', title: 'Gestion d\'équipe', content: 'Contenu de la leçon...', order: 3, duration: '55 min' },
      { id: 'l3_4', courseId: 'course_3', title: 'Communication efficace', content: 'Contenu de la leçon...', order: 4, duration: '45 min' },
      { id: 'l3_5', courseId: 'course_3', title: 'Résolution de conflits', content: 'Contenu de la leçon...', order: 5, duration: '50 min' },
      { id: 'l3_6', courseId: 'course_3', title: 'Accompagnement pastoral', content: 'Contenu de la leçon...', order: 6, duration: '45 min' }
    ]
  },
  {
    id: 'course_4',
    title: 'Étude du Nouveau Testament',
    description: 'Parcourez les 27 livres du Nouveau Testament et découvrez leurs enseignements pour aujourd\'hui.',
    category: 'BIBLE_STUDY',
    level: 'INTERMEDIATE',
    duration: '12 semaines',
    instructor: 'Pasteur Jean-Marc',
    enrolledCount: 32,
    isPublished: true,
    createdAt: new Date().toISOString(),
    lessons: [
      { id: 'l4_1', courseId: 'course_4', title: 'Les Évangiles synoptiques', content: 'Contenu de la leçon...', order: 1, duration: '60 min' },
      { id: 'l4_2', courseId: 'course_4', title: 'L\'Évangile de Jean', content: 'Contenu de la leçon...', order: 2, duration: '55 min' },
      { id: 'l4_3', courseId: 'course_4', title: 'Les Actes des Apôtres', content: 'Contenu de la leçon...', order: 3, duration: '50 min' },
      { id: 'l4_4', courseId: 'course_4', title: 'Les épîtres de Paul', content: 'Contenu de la leçon...', order: 4, duration: '65 min' },
      { id: 'l4_5', courseId: 'course_4', title: 'Les épîtres générales', content: 'Contenu de la leçon...', order: 5, duration: '45 min' },
      { id: 'l4_6', courseId: 'course_4', title: 'L\'Apocalypse', content: 'Contenu de la leçon...', order: 6, duration: '55 min' }
    ]
  },
  {
    id: 'course_5',
    title: 'Vie de Couple Chrétien',
    description: 'Formation pour les couples mariés ou en préparation au mariage. Construire un foyer selon les principes bibliques.',
    category: 'MARRIAGE',
    level: 'INTERMEDIATE',
    duration: '6 semaines',
    instructor: 'Couple Pastoral',
    enrolledCount: 22,
    isPublished: true,
    createdAt: new Date().toISOString(),
    lessons: [
      { id: 'l5_1', courseId: 'course_5', title: 'Le plan de Dieu pour le mariage', content: 'Contenu de la leçon...', order: 1, duration: '40 min' },
      { id: 'l5_2', courseId: 'course_5', title: 'Communication dans le couple', content: 'Contenu de la leçon...', order: 2, duration: '45 min' },
      { id: 'l5_3', courseId: 'course_5', title: 'Gestion des finances familiales', content: 'Contenu de la leçon...', order: 3, duration: '50 min' },
      { id: 'l5_4', courseId: 'course_5', title: 'Élever des enfants dans la foi', content: 'Contenu de la leçon...', order: 4, duration: '45 min' }
    ]
  },
  {
    id: 'course_6',
    title: 'École du Dimanche - Moniteurs',
    description: 'Formation pour les enseignants de l\'école du dimanche. Méthodes pédagogiques adaptées aux enfants.',
    category: 'TEACHING',
    level: 'INTERMEDIATE',
    duration: '5 semaines',
    instructor: 'Responsable Enfance',
    enrolledCount: 18,
    isPublished: true,
    createdAt: new Date().toISOString(),
    lessons: [
      { id: 'l6_1', courseId: 'course_6', title: 'Comprendre le développement de l\'enfant', content: 'Contenu de la leçon...', order: 1, duration: '35 min' },
      { id: 'l6_2', courseId: 'course_6', title: 'Préparer une leçon engageante', content: 'Contenu de la leçon...', order: 2, duration: '40 min' },
      { id: 'l6_3', courseId: 'course_6', title: 'Activités et jeux bibliques', content: 'Contenu de la leçon...', order: 3, duration: '45 min' },
      { id: 'l6_4', courseId: 'course_6', title: 'Gestion de classe', content: 'Contenu de la leçon...', order: 4, duration: '30 min' }
    ]
  }
]

// Inscriptions (stockage en mémoire)
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

    if (type === 'courses') {
      const isAdmin = searchParams.get('admin') === 'true'
      let filteredCourses = isAdmin ? courses : courses.filter(c => c.isPublished)
      if (category) {
        filteredCourses = filteredCourses.filter(c => c.category === category)
      }
      return NextResponse.json({ 
        courses: filteredCourses,
        total: filteredCourses.length 
      })
    }

    if (type === 'enrollments') {
      // Admin: récupérer toutes les inscriptions
      return NextResponse.json({ 
        enrollments: enrollments,
        total: enrollments.length 
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
        total: userEnrollments.length 
      })
    }

    if (type === 'enrollment' && courseId && userId) {
      const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId)
      return NextResponse.json({ enrollment })
    }

    return NextResponse.json({ courses })

  } catch (error: any) {
    console.error('❌ Training GET proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST - S'inscrire à un cours ou marquer une leçon comme complétée
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { action, userId, userName, courseId, lessonId } = body

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

      // Créer l'inscription
      const newEnrollment: Enrollment = {
        id: `enroll_${Date.now()}`,
        userId,
        userName: userName || 'Utilisateur',
        courseId,
        courseName: course.title,
        progress: 0,
        completedLessons: [],
        startedAt: new Date().toISOString()
      }

      enrollments.push(newEnrollment)

      // Incrémenter le compteur d'inscrits
      const courseIndex = courses.findIndex(c => c.id === courseId)
      if (courseIndex !== -1) {
        courses[courseIndex].enrolledCount += 1
      }

      return NextResponse.json({
        message: 'Inscription réussie',
        enrollment: newEnrollment
      }, { status: 201 })
    }

    // Admin: Créer un nouveau cours
    if (action === 'create') {
      const { title, description, category, level, duration, instructor, imageUrl, isPublished, lessons } = body
      
      const newCourse: Course = {
        id: `course_${Date.now()}`,
        title,
        description,
        category: category || 'FOUNDATIONS',
        level: level || 'BEGINNER',
        duration: duration || '4 semaines',
        instructor: instructor || '',
        imageUrl: imageUrl || '',
        isPublished: isPublished || false,
        enrolledCount: 0,
        createdAt: new Date().toISOString(),
        lessons: (lessons || []).map((lesson: any, index: number) => ({
          id: `lesson_${Date.now()}_${index}`,
          courseId: `course_${Date.now()}`,
          title: lesson.title,
          content: lesson.content,
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
        lessons: lessons ? lessons.map((lesson: any, index: number) => ({
          id: lesson.id || `lesson_${Date.now()}_${index}`,
          courseId: updateCourseId,
          title: lesson.title,
          content: lesson.content,
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
        }
      }

      return NextResponse.json({
        message: 'Progression mise à jour',
        enrollment: enrollments[enrollmentIndex]
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('❌ Training POST proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'opération' },
      { status: 500 }
    )
  }
}
/**
 * PUT - Mettre à jour un cours (publier/dépublier)
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, isPublished } = body

    const courseIndex = courses.findIndex(c => c.id === courseId)
    if (courseIndex === -1) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    courses[courseIndex].isPublished = isPublished

    return NextResponse.json({
      success: true,
      message: isPublished ? 'Formation publiée' : 'Formation dépubliée',
      course: courses[courseIndex]
    })

  } catch (error: any) {
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

  } catch (error: any) {
    console.error('❌ Training DELETE proxy error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}