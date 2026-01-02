/**
 * =============================================================================
 * PAGE FORMATIONS - PARCOURS DE FORMATION ET COURS EN LIGNE
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Page permettant aux membres d'accéder aux formations,
 * suivre leur progression et obtenir des certificats.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import {
  GraduationCap,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Users,
  Award,
  ChevronRight,
  X,
  Loader2,
  Filter,
  Trophy,
  Target,
  BarChart,
  Lock,
  Unlock
} from 'lucide-react'

// Types
interface Lesson {
  id: string
  courseId: string
  title: string
  content: string
  videoUrl?: string
  order: number
  duration?: string
}

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
  enrolledCount: number
}

interface Enrollment {
  id: string
  userId: string
  courseId: string
  courseName: string
  progress: number
  completedLessons: string[]
  startedAt: string
  completedAt?: string
  certificateId?: string
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

// Labels des catégories
const categoryLabels: Record<string, string> = {
  'FOUNDATIONS': 'Fondements',
  'BAPTISM': 'Baptême',
  'LEADERSHIP': 'Leadership',
  'BIBLE_STUDY': 'Étude biblique',
  'MARRIAGE': 'Vie de couple',
  'TEACHING': 'Enseignement'
}

// Couleurs des niveaux
const levelColors: Record<string, { bg: string, text: string }> = {
  'BEGINNER': { bg: 'bg-green-100', text: 'text-green-700' },
  'INTERMEDIATE': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'ADVANCED': { bg: 'bg-red-100', text: 'text-red-700' }
}

const levelLabels: Record<string, string> = {
  'BEGINNER': 'Débutant',
  'INTERMEDIATE': 'Intermédiaire',
  'ADVANCED': 'Avancé'
}

const TrainingPage: React.FC = () => {
  // États
  const [courses, setCourses] = useState<Course[]>([])
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-courses'>('catalog')
  const [filterCategory, setFilterCategory] = useState<string>('')
  
  // Modal et cours sélectionné
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [completingLesson, setCompletingLesson] = useState(false)

  // Récupérer l'utilisateur
  const getUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch {
          return null
        }
      }
    }
    return null
  }

  const user = getUserFromStorage()

  // Charger les données
  useEffect(() => {
    fetchCourses()
    if (user?.id) {
      fetchMyEnrollments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const fetchCourses = async () => {
    try {
      const response = await authenticatedFetch('/api/training-proxy?type=courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Erreur chargement cours:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyEnrollments = async () => {
    if (!user?.id) return
    try {
      const response = await authenticatedFetch(`/api/training-proxy?type=my-enrollments&userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setMyEnrollments(data.enrollments || [])
      }
    } catch (error) {
      console.error('Erreur chargement inscriptions:', error)
    }
  }

  // Vérifier si inscrit à un cours
  const getEnrollment = (courseId: string) => {
    return myEnrollments.find(e => e.courseId === courseId)
  }

  // S'inscrire à un cours
  const handleEnroll = async (courseId: string) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Vous devez être connecté' })
      return
    }

    setEnrolling(true)
    try {
      const response = await authenticatedFetch('/api/training-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enroll',
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          courseId
        })
      })

      const data = await response.json()
      if (response.ok) {
        // Message adapté pour la validation admin
        setMessage({ type: 'success', text: '📩 Demande d\'inscription envoyée ! Elle sera validée par un administrateur.' })
        fetchMyEnrollments()
        fetchCourses()
        setShowCourseModal(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'inscription' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setEnrolling(false)
    }
  }

  // Marquer une leçon comme complétée
  const handleCompleteLesson = async (courseId: string, lessonId: string) => {
    if (!user) return

    setCompletingLesson(true)
    try {
      const response = await authenticatedFetch('/api/training-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-lesson',
          userId: user.id,
          courseId,
          lessonId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMyEnrollments(prev => 
          prev.map(e => e.courseId === courseId ? data.enrollment : e)
        )
        
        if (data.enrollment.progress === 100) {
          setMessage({ type: 'success', text: '🏆 Félicitations ! Vous avez terminé ce cours !' })
        } else {
          setMessage({ type: 'success', text: '✅ Leçon complétée !' })
        }
        setShowLessonModal(false)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setCompletingLesson(false)
    }
  }

  // Filtrer les cours
  const filteredCourses = filterCategory 
    ? courses.filter(c => c.category === filterCategory)
    : courses

  // Statistiques personnelles
  const stats = {
    enrolled: myEnrollments.length,
    completed: myEnrollments.filter(e => e.completedAt).length,
    inProgress: myEnrollments.filter(e => !e.completedAt && e.progress > 0).length,
    totalProgress: myEnrollments.length > 0 
      ? Math.round(myEnrollments.reduce((sum, e) => sum + e.progress, 0) / myEnrollments.length)
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">🎓 Formations</h1>
        <p className="text-emerald-100">
          Développez votre foi et vos compétences avec nos parcours de formation
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats personnelles */}
      {myEnrollments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.enrolled}</p>
                <p className="text-xs text-gray-500">Cours inscrits</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-xs text-gray-500">En cours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-gray-500">Terminés</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BarChart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProgress}%</p>
                <p className="text-xs text-gray-500">Progression</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'catalog'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <GraduationCap className="h-4 w-4 inline mr-2" />
          Catalogue des formations
        </button>
        <button
          onClick={() => setActiveTab('my-courses')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'my-courses'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Mes formations
          {myEnrollments.length > 0 && (
            <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
              {myEnrollments.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenu */}
      {activeTab === 'catalog' ? (
        <div className="space-y-4">
          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterCategory === '' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {Object.entries(categoryLabels).map(([cat, label]) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterCategory === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grille des cours */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(course => {
              const enrollment = getEnrollment(course.id)
              const levelStyle = levelColors[course.level]

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedCourse(course)
                    setShowCourseModal(true)
                  }}
                >
                  {/* Badge progression si inscrit */}
                  {enrollment && (
                    <div className="bg-emerald-500 text-white px-4 py-1 text-sm">
                      Progression : {enrollment.progress}%
                    </div>
                  )}

                  <div className="p-4">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${levelStyle.bg} ${levelStyle.text}`}>
                        {levelLabels[course.level]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {categoryLabels[course.category]}
                      </span>
                    </div>

                    {/* Titre et description */}
                    <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>

                    {/* Infos */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.lessons.length} leçons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrolledCount} inscrits
                      </span>
                    </div>

                    {/* Bouton */}
                    <div className="mt-4">
                      {enrollment ? (
                        <button className="w-full py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium flex items-center justify-center gap-2">
                          <Play className="h-4 w-4" />
                          Continuer
                        </button>
                      ) : (
                        <button className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                          S&apos;inscrire
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Mes formations */
        <div className="space-y-4">
          {myEnrollments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation</h3>
              <p className="text-gray-500 mb-4">Vous n&apos;êtes inscrit à aucune formation</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Découvrir les formations →
              </button>
            </div>
          ) : (
            myEnrollments.map(enrollment => {
              const course = courses.find(c => c.id === enrollment.courseId)
              if (!course) return null

              return (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${enrollment.completedAt ? 'bg-green-100' : 'bg-emerald-100'}`}>
                      {enrollment.completedAt ? (
                        <Trophy className="h-6 w-6 text-green-600" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-emerald-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500">
                            {enrollment.completedLessons.length} / {course.lessons.length} leçons complétées
                          </p>
                        </div>
                        {enrollment.completedAt && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Terminé
                          </span>
                        )}
                      </div>

                      {/* Barre de progression */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progression</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              enrollment.progress === 100 ? 'bg-green-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Bouton continuer */}
                      <button
                        onClick={() => {
                          setSelectedCourse(course)
                          setShowCourseModal(true)
                        }}
                        className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                      >
                        {enrollment.completedAt ? 'Revoir le cours' : 'Continuer'}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Modal détail cours */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded">
                      {levelLabels[selectedCourse.level]}
                    </span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded">
                      {categoryLabels[selectedCourse.category]}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{selectedCourse.title}</h2>
                  {selectedCourse.instructor && (
                    <p className="text-emerald-100 text-sm mt-1">Par {selectedCourse.instructor}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="text-white/80 hover:text-white p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <p className="text-gray-600">{selectedCourse.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedCourse.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {selectedCourse.lessons.length} leçons
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedCourse.enrolledCount} inscrits
                  </span>
                </div>
              </div>

              {/* Liste des leçons */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Programme du cours</h3>
                <div className="space-y-2">
                  {selectedCourse.lessons.map((lesson, index) => {
                    const enrollment = getEnrollment(selectedCourse.id)
                    const isCompleted = enrollment?.completedLessons.includes(lesson.id)
                    const isLocked = !enrollment && index > 0

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isCompleted 
                            ? 'bg-green-50 border-green-200' 
                            : isLocked 
                              ? 'bg-gray-50 border-gray-200 opacity-60'
                              : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isLocked && enrollment) {
                            setSelectedLesson(lesson)
                            setShowLessonModal(true)
                          }
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-100' : isLocked ? 'bg-gray-200' : 'bg-emerald-100'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : isLocked ? (
                            <Lock className="h-4 w-4 text-gray-400" />
                          ) : (
                            <span className="text-sm font-medium text-emerald-600">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                            {lesson.title}
                          </p>
                          {lesson.duration && (
                            <p className="text-xs text-gray-500">{lesson.duration}</p>
                          )}
                        </div>
                        {enrollment && !isLocked && (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100">
                {getEnrollment(selectedCourse.id) ? (
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-2">✅ Vous êtes inscrit à ce cours</p>
                    <p className="text-sm text-gray-500">
                      Cliquez sur une leçon pour commencer ou continuer votre apprentissage
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(selectedCourse.id)}
                    disabled={enrolling}
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {enrolling ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <GraduationCap className="h-5 w-5" />
                        S&apos;inscrire gratuitement
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal leçon */}
      {showLessonModal && selectedLesson && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-emerald-600 mb-1">{selectedCourse.title}</p>
                  <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
                </div>
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Contenu de la leçon */}
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-gray-600">
                  {selectedLesson.content || 'Contenu de la leçon en cours de préparation...'}
                </p>
                
                {/* Placeholder pour vidéo */}
                {selectedLesson.videoUrl && (
                  <div className="bg-gray-100 rounded-lg p-8 text-center my-4">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Vidéo de la leçon</p>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                {!getEnrollment(selectedCourse.id)?.completedLessons.includes(selectedLesson.id) && (
                  <button
                    onClick={() => handleCompleteLesson(selectedCourse.id, selectedLesson.id)}
                    disabled={completingLesson}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {completingLesson ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Marquer comme terminé
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingPage
