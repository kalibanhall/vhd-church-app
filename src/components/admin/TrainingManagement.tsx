/**
 * =============================================================================
 * ADMIN - GESTION DES FORMATIONS
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Interface admin pour créer, modifier et gérer les formations
 * et parcours de formation de l'église.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner, { InlineLoader } from '@/components/ui/LoadingSpinner'
import {
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Users,
  BookOpen,
  X,
  Save,
  Search,
  Eye,
  CheckCircle,
  Clock,
  Loader2,
  Award,
  Video,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers
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
  isPublished: boolean
  createdAt: string
}

interface Enrollment {
  id: string
  userId: string
  userName: string
  userEmail: string
  courseId: string
  courseName: string
  progress: number
  completedLessons: string[]
  startedAt: string
  completedAt?: string
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'ABANDONED'
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

// Catégories de formation
const categories = [
  { value: 'FOUNDATIONS', label: 'Fondements de la foi' },
  { value: 'BAPTISM', label: 'Préparation au baptême' },
  { value: 'LEADERSHIP', label: 'Leadership' },
  { value: 'BIBLE_STUDY', label: 'Étude biblique' },
  { value: 'MARRIAGE', label: 'Vie de couple' },
  { value: 'TEACHING', label: 'Enseignement' },
  { value: 'EVANGELISM', label: 'Évangélisation' },
  { value: 'WORSHIP', label: 'Louange & Adoration' }
]

// Niveaux
const levels = [
  { value: 'BEGINNER', label: 'Débutant', color: 'bg-green-100 text-green-700' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'ADVANCED', label: 'Avancé', color: 'bg-red-100 text-red-700' }
]

const TrainingManagement: React.FC = () => {
  // États
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [activeTab, setActiveTab] = useState<'courses' | 'enrollments'>('courses')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showLessonsModal, setShowLessonsModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FOUNDATIONS',
    level: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    duration: '',
    instructor: '',
    imageUrl: '',
    isPublished: false
  })

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: ''
  })
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null)
  const [courseLessons, setCourseLessons] = useState<Omit<Lesson, 'id' | 'courseId'>[]>([])

  // Statistiques
  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.isPublished).length,
    totalEnrollments: enrollments.length,
    pendingEnrollments: enrollments.filter(e => e.status === 'PENDING').length,
    completedEnrollments: enrollments.filter(e => e.status === 'COMPLETED').length
  }

  // Charger les données
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        authenticatedFetch('/api/training-proxy?type=courses&admin=true'),
        authenticatedFetch('/api/training-proxy?type=enrollments')
      ])

      if (coursesRes.ok) {
        const data = await coursesRes.json()
        setCourses(data.courses || [])
      }

      if (enrollmentsRes.ok) {
        const data = await enrollmentsRes.json()
        setEnrollments(data.enrollments || [])
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' })
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les cours
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !filterCategory || course.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Ouvrir modal création
  const openCreateModal = () => {
    setSelectedCourse(null)
    setFormData({
      title: '',
      description: '',
      category: 'FOUNDATIONS',
      level: 'BEGINNER',
      duration: '',
      instructor: '',
      imageUrl: '',
      isPublished: false
    })
    setCourseLessons([])
    setShowModal(true)
  }

  // Ouvrir modal édition
  const openEditModal = (course: Course) => {
    setSelectedCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      instructor: course.instructor || '',
      imageUrl: course.imageUrl || '',
      isPublished: course.isPublished
    })
    setCourseLessons(course.lessons.map(l => ({
      title: l.title,
      content: l.content,
      videoUrl: l.videoUrl || '',
      duration: l.duration || '',
      order: l.order
    })))
    setShowModal(true)
  }

  // Gérer les leçons
  const addLesson = () => {
    if (!lessonForm.title || !lessonForm.content) {
      setMessage({ type: 'error', text: 'Le titre et le contenu sont requis' })
      return
    }
    
    if (editingLessonIndex !== null) {
      // Modifier une leçon existante
      const updated = [...courseLessons]
      updated[editingLessonIndex] = {
        ...lessonForm,
        order: editingLessonIndex + 1
      }
      setCourseLessons(updated)
      setEditingLessonIndex(null)
    } else {
      // Ajouter une nouvelle leçon
      setCourseLessons([...courseLessons, {
        ...lessonForm,
        order: courseLessons.length + 1
      }])
    }
    
    setLessonForm({ title: '', content: '', videoUrl: '', duration: '' })
  }

  const editLesson = (index: number) => {
    const lesson = courseLessons[index]
    setLessonForm({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || ''
    })
    setEditingLessonIndex(index)
  }

  const removeLesson = (index: number) => {
    setCourseLessons(courseLessons.filter((_, i) => i !== index))
  }

  const moveLessonUp = (index: number) => {
    if (index === 0) return
    const updated = [...courseLessons]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    // Recalculer les ordres
    updated.forEach((l, i) => l.order = i + 1)
    setCourseLessons(updated)
  }

  const moveLessonDown = (index: number) => {
    if (index === courseLessons.length - 1) return
    const updated = [...courseLessons]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    // Recalculer les ordres
    updated.forEach((l, i) => l.order = i + 1)
    setCourseLessons(updated)
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        action: selectedCourse ? 'update' : 'create',
        courseId: selectedCourse?.id,
        ...formData,
        lessons: courseLessons
      }

      const response = await authenticatedFetch('/api/training-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: selectedCourse ? '✅ Formation modifiée avec succès' : '✅ Formation créée avec succès'
        })
        setShowModal(false)
        loadData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer un cours
  const handleDelete = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return

    try {
      const response = await authenticatedFetch('/api/training-proxy', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Formation supprimée' })
        loadData()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
  }

  // Publier/Dépublier
  const togglePublish = async (course: Course) => {
    try {
      const response = await authenticatedFetch('/api/training-proxy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          isPublished: !course.isPublished
        })
      })

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: course.isPublished ? '📤 Formation dépubliée' : '✅ Formation publiée' 
        })
        loadData()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    }
  }

  // Valider ou rejeter une inscription
  const handleEnrollmentAction = async (enrollmentId: string, action: 'approve' | 'reject') => {
    try {
      const response = await authenticatedFetch('/api/training-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate-enrollment',
          enrollmentId,
          decision: action
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: action === 'approve' 
            ? '✅ Inscription approuvée avec succès' 
            : '❌ Inscription refusée'
        })
        loadData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la validation' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
  }

  // Badge de niveau
  const LevelBadge = ({ level }: { level: string }) => {
    const config = levels.find(l => l.value === level) || levels[0]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return <LoadingSpinner size="md" text="Chargement des formations..." />
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Formations</h1>
          <p className="text-gray-500">Créez et gérez les parcours de formation pour vos membres</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#ffc200] text-white rounded-lg hover:bg-[#cc9b00] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Formation
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : message.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-[#fffefa] text-[#3d3200] border border-[#e6af00]'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-[#fff3cc] p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-[#cc9b00]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              <p className="text-xs text-gray-500">Formations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedCourses}</p>
              <p className="text-xs text-gray-500">Publiées</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
              <p className="text-xs text-gray-500">Inscriptions</p>
            </div>
          </div>
        </div>

        {/* Pending enrollments with notification badge */}
        <div className={`rounded-xl p-4 shadow-sm border ${stats.pendingEnrollments > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.pendingEnrollments > 0 ? 'bg-amber-200' : 'bg-amber-100'}`}>
              <Clock className={`h-5 w-5 ${stats.pendingEnrollments > 0 ? 'text-amber-700' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats.pendingEnrollments > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{stats.pendingEnrollments}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedEnrollments}</p>
              <p className="text-xs text-gray-500">Terminées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'courses'
                ? 'border-[#ffc200] text-[#cc9b00]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap className="inline h-4 w-4 mr-2" />
            Formations ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'enrollments'
                ? 'border-[#ffc200] text-[#cc9b00]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="inline h-4 w-4 mr-2" />
            Inscriptions ({enrollments.length})
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Liste des formations */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune formation trouvée</p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-[#cc9b00] hover:text-[#5c4d00] font-medium"
              >
                Créer une première formation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="h-32 bg-gradient-to-r from-[#ffc200] to-[#cc9b00] relative">
                    {course.imageUrl && (
                      <div className="w-full h-full" style={{ backgroundImage: `url(${course.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.isPublished 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {course.isPublished ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
                      <LevelBadge level={course.level} />
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.lessons?.length || 0} leçons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrolledCount || 0} inscrits
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openEditModal(course)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-[#cc9b00] hover:bg-[#fffefa] rounded-lg"
                      >
                        <Edit3 className="h-4 w-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => togglePublish(course)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg ${
                          course.isPublished 
                            ? 'text-amber-600 hover:bg-amber-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <Eye className="h-4 w-4" />
                        {course.isPublished ? 'Dépublier' : 'Publier'}
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'enrollments' && (
        <div className="space-y-4">
          {/* Inscriptions en attente */}
          {stats.pendingEnrollments > 0 && (
            <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 overflow-hidden">
              <div className="p-4 bg-amber-100 border-b border-amber-200">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Inscriptions en attente de validation ({stats.pendingEnrollments})
                </h3>
              </div>
              <div className="divide-y divide-amber-100">
                {enrollments.filter(e => e.status === 'PENDING').map(enrollment => (
                  <div key={enrollment.id} className="p-4 hover:bg-amber-50/50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-200 p-2 rounded-full">
                          <Users className="h-5 w-5 text-amber-700" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.userName}</p>
                          <p className="text-sm text-gray-600">{enrollment.userEmail}</p>
                          <p className="text-sm text-amber-700 font-medium">{enrollment.courseName}</p>
                          <p className="text-xs text-gray-500">
                            Demandé le {new Date(enrollment.startedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEnrollmentAction(enrollment.id, 'approve')}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleEnrollmentAction(enrollment.id, 'reject')}
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <X className="h-4 w-4" />
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toutes les inscriptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">Toutes les inscriptions</h3>
            </div>
            {enrollments.filter(e => e.status !== 'PENDING').length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune inscription validée pour le moment</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {enrollments.filter(e => e.status !== 'PENDING').map(enrollment => (
                  <div key={enrollment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          enrollment.status === 'COMPLETED' ? 'bg-green-100' :
                          enrollment.status === 'REJECTED' ? 'bg-red-100' :
                          enrollment.status === 'ABANDONED' ? 'bg-gray-100' :
                          'bg-purple-100'
                        }`}>
                          <Users className={`h-5 w-5 ${
                            enrollment.status === 'COMPLETED' ? 'text-green-600' :
                            enrollment.status === 'REJECTED' ? 'text-red-600' :
                            enrollment.status === 'ABANDONED' ? 'text-gray-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.userName}</p>
                          <p className="text-sm text-gray-500">{enrollment.courseName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {enrollment.status === 'APPROVED' || enrollment.status === 'IN_PROGRESS' || enrollment.status === 'COMPLETED' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#ffc200] h-2 rounded-full" 
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{enrollment.progress}%</span>
                          </div>
                        ) : null}
                        <p className={`text-xs mt-1 font-medium ${
                          enrollment.status === 'COMPLETED' ? 'text-green-600' :
                          enrollment.status === 'REJECTED' ? 'text-red-600' :
                          enrollment.status === 'ABANDONED' ? 'text-gray-600' :
                          enrollment.status === 'APPROVED' ? 'text-[#cc9b00]' :
                          'text-purple-600'
                        }`}>
                          {enrollment.status === 'COMPLETED' ? '✅ Terminé' : 
                           enrollment.status === 'REJECTED' ? '❌ Refusé' :
                           enrollment.status === 'ABANDONED' ? '🚫 Abandonné' :
                           enrollment.status === 'APPROVED' ? '✓ Approuvé' :
                           '📚 En cours'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#ffc200] to-[#cc9b00] p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedCourse ? 'Modifier la formation' : 'Nouvelle formation'}
                  </h2>
                  <p className="text-white/80">Remplissez les informations ci-dessous</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la formation *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  >
                    {levels.map(lvl => (
                      <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée estimée
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ex: 4 semaines"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formateur
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Nom du formateur"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l&apos;image de couverture
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="rounded border-gray-300 text-[#cc9b00] focus:ring-[#ffc200]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Publier immédiatement
                    </span>
                  </label>
                </div>
              </div>

              {/* Section Leçons */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Leçons ({courseLessons.length})
                </h3>
                
                {/* Liste des leçons */}
                {courseLessons.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {courseLessons.map((lesson, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 bg-[#fff3cc] text-[#5c4d00] rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{lesson.title}</p>
                          {lesson.videoUrl && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Video className="h-3 w-3" /> Vidéo incluse
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveLessonUp(index)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLessonDown(index)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            disabled={index === courseLessons.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => editLesson(index)}
                            className="p-1 text-[#cc9b00] hover:text-[#5c4d00]"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLesson(index)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire d'ajout de leçon */}
                <div className="bg-[#fffefa] p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-[#3d3200]">
                    {editingLessonIndex !== null ? 'Modifier la leçon' : 'Ajouter une leçon'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="Titre de la leçon"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      placeholder="Durée (ex: 15 min)"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder="Contenu de la leçon..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                  />
                  
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    placeholder="URL de la vidéo (optionnel)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  
                  <button
                    type="button"
                    onClick={addLesson}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ffc200] text-white rounded-lg hover:bg-[#cc9b00] text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    {editingLessonIndex !== null ? 'Mettre à jour' : 'Ajouter la leçon'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-[#ffc200] text-white rounded-lg hover:bg-[#cc9b00] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {selectedCourse ? 'Enregistrer les modifications' : 'Créer la formation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingManagement

