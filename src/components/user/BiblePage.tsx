/**
 * =============================================================================
 * PAGE BIBLE - LECTURE BIBLIQUE ET PLANS DE LECTURE
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Page permettant aux membres de lire la Bible, suivre des
 * plans de lecture et découvrir le verset du jour.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Search,
  Heart,
  Share2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Star,
  Bookmark,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
  List,
  Clock,
  Lightbulb
} from 'lucide-react'

// Types
interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
  reference: string
}

interface ReadingPlan {
  id: string
  name: string
  description: string
  duration: string
  totalDays: number
  currentDay: number
  readings: DailyReading[]
}

interface DailyReading {
  day: number
  reference: string
  completed: boolean
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

// Livres de la Bible
const bibleBooks = {
  oldTestament: [
    'Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome',
    'Josué', 'Juges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Rois', '2 Rois', '1 Chroniques', '2 Chroniques', 'Esdras',
    'Néhémie', 'Esther', 'Job', 'Psaumes', 'Proverbes',
    'Ecclésiaste', 'Cantique des Cantiques', 'Ésaïe', 'Jérémie', 'Lamentations',
    'Ézéchiel', 'Daniel', 'Osée', 'Joël', 'Amos',
    'Abdias', 'Jonas', 'Michée', 'Nahum', 'Habacuc',
    'Sophonie', 'Aggée', 'Zacharie', 'Malachie'
  ],
  newTestament: [
    'Matthieu', 'Marc', 'Luc', 'Jean', 'Actes',
    'Romains', '1 Corinthiens', '2 Corinthiens', 'Galates', 'Éphésiens',
    'Philippiens', 'Colossiens', '1 Thessaloniciens', '2 Thessaloniciens', '1 Timothée',
    '2 Timothée', 'Tite', 'Philémon', 'Hébreux', 'Jacques',
    '1 Pierre', '2 Pierre', '1 Jean', '2 Jean', '3 Jean',
    'Jude', 'Apocalypse'
  ]
}

// Versets inspirants pour le verset du jour
const inspirationalVerses: BibleVerse[] = [
  { book: 'Jérémie', chapter: 29, verse: 11, text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", reference: 'Jérémie 29:11' },
  { book: 'Psaumes', chapter: 23, verse: 1, text: "L'Éternel est mon berger : je ne manquerai de rien.", reference: 'Psaume 23:1' },
  { book: 'Philippiens', chapter: 4, verse: 13, text: "Je puis tout par celui qui me fortifie.", reference: 'Philippiens 4:13' },
  { book: 'Proverbes', chapter: 3, verse: 5, text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse.", reference: 'Proverbes 3:5' },
  { book: 'Romains', chapter: 8, verse: 28, text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.", reference: 'Romains 8:28' },
  { book: 'Ésaïe', chapter: 41, verse: 10, text: "Ne crains rien, car je suis avec toi ; Ne promène pas des regards inquiets, car je suis ton Dieu ; Je te fortifie, je viens à ton secours, Je te soutiens de ma droite triomphante.", reference: 'Ésaïe 41:10' },
  { book: 'Jean', chapter: 3, verse: 16, text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", reference: 'Jean 3:16' },
  { book: 'Matthieu', chapter: 11, verse: 28, text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", reference: 'Matthieu 11:28' },
  { book: 'Psaumes', chapter: 46, verse: 1, text: "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.", reference: 'Psaume 46:1' },
  { book: '2 Timothée', chapter: 1, verse: 7, text: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse.", reference: '2 Timothée 1:7' },
  { book: 'Josué', chapter: 1, verse: 9, text: "Ne t'ai-je pas donné cet ordre : Fortifie-toi et prends courage ? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.", reference: 'Josué 1:9' },
  { book: 'Psaumes', chapter: 119, verse: 105, text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.", reference: 'Psaume 119:105' },
]

// Plans de lecture
const readingPlans: ReadingPlan[] = [
  {
    id: 'plan_gospel_30',
    name: 'Les Évangiles en 30 jours',
    description: 'Parcourez les quatre Évangiles pour redécouvrir la vie de Jésus',
    duration: '30 jours',
    totalDays: 30,
    currentDay: 0,
    readings: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      reference: `Jour ${i + 1} - Lecture des Évangiles`,
      completed: false
    }))
  },
  {
    id: 'plan_psalms_31',
    name: 'Un Psaume par jour',
    description: 'Méditez sur un psaume chaque jour pendant un mois',
    duration: '31 jours',
    totalDays: 31,
    currentDay: 0,
    readings: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      reference: `Psaume ${i + 1}`,
      completed: false
    }))
  },
  {
    id: 'plan_proverbs_31',
    name: 'Sagesse des Proverbes',
    description: 'Un chapitre de Proverbes par jour pour grandir en sagesse',
    duration: '31 jours',
    totalDays: 31,
    currentDay: 0,
    readings: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      reference: `Proverbes ${i + 1}`,
      completed: false
    }))
  },
  {
    id: 'plan_nt_90',
    name: 'Nouveau Testament en 90 jours',
    description: 'Lisez tout le Nouveau Testament en trois mois',
    duration: '90 jours',
    totalDays: 90,
    currentDay: 0,
    readings: Array.from({ length: 90 }, (_, i) => ({
      day: i + 1,
      reference: `Jour ${i + 1} - Nouveau Testament`,
      completed: false
    }))
  }
]

const BiblePage: React.FC = () => {
  // États
  const [activeTab, setActiveTab] = useState<'verse' | 'read' | 'plans' | 'favorites'>('verse')
  const [verseOfDay, setVerseOfDay] = useState<BibleVerse | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState<Message | null>(null)
  const [favorites, setFavorites] = useState<BibleVerse[]>([])
  const [myPlans, setMyPlans] = useState<ReadingPlan[]>([])
  
  // Navigation Bible
  const [selectedTestament, setSelectedTestament] = useState<'old' | 'new'>('new')
  const [selectedBook, setSelectedBook] = useState<string>('Jean')
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [showBookSelector, setShowBookSelector] = useState(false)

  // Charger le verset du jour
  useEffect(() => {
    // Sélectionner un verset basé sur le jour de l'année
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const verseIndex = dayOfYear % inspirationalVerses.length
    setVerseOfDay(inspirationalVerses[verseIndex])

    // Charger les favoris depuis localStorage
    const savedFavorites = localStorage.getItem('bible_favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch {}
    }

    // Charger les plans
    const savedPlans = localStorage.getItem('bible_plans')
    if (savedPlans) {
      try {
        setMyPlans(JSON.parse(savedPlans))
      } catch {}
    }
  }, [])

  // Sauvegarder les favoris
  const saveFavorite = (verse: BibleVerse) => {
    const newFavorites = [...favorites, verse]
    setFavorites(newFavorites)
    localStorage.setItem('bible_favorites', JSON.stringify(newFavorites))
    setMessage({ type: 'success', text: 'Verset ajouté aux favoris' })
  }

  // Retirer des favoris
  const removeFavorite = (reference: string) => {
    const newFavorites = favorites.filter(v => v.reference !== reference)
    setFavorites(newFavorites)
    localStorage.setItem('bible_favorites', JSON.stringify(newFavorites))
    setMessage({ type: 'info', text: 'Verset retiré des favoris' })
  }

  // Copier le verset
  const copyVerse = (verse: BibleVerse) => {
    navigator.clipboard.writeText(`"${verse.text}" - ${verse.reference}`)
    setMessage({ type: 'success', text: 'Verset copié !' })
  }

  // Commencer un plan de lecture
  const startPlan = (planId: string) => {
    const plan = readingPlans.find(p => p.id === planId)
    if (plan && !myPlans.find(p => p.id === planId)) {
      const newPlan = { ...plan, currentDay: 1 }
      const newPlans = [...myPlans, newPlan]
      setMyPlans(newPlans)
      localStorage.setItem('bible_plans', JSON.stringify(newPlans))
      setMessage({ type: 'success', text: 'Plan de lecture commencé !' })
    }
  }

  // Marquer une lecture comme complétée
  const completeReading = (planId: string, day: number) => {
    const newPlans = myPlans.map(plan => {
      if (plan.id === planId) {
        const newReadings = plan.readings.map(r => 
          r.day === day ? { ...r, completed: true } : r
        )
        const completedCount = newReadings.filter(r => r.completed).length
        return { 
          ...plan, 
          readings: newReadings,
          currentDay: Math.max(plan.currentDay, day + 1)
        }
      }
      return plan
    })
    setMyPlans(newPlans)
    localStorage.setItem('bible_plans', JSON.stringify(newPlans))
    setMessage({ type: 'success', text: 'Lecture complétée !' })
  }

  // Obtenir le nombre de chapitres d'un livre (simplifié)
  const getChapterCount = (book: string): number => {
    const chapters: Record<string, number> = {
      'Genèse': 50, 'Exode': 40, 'Psaumes': 150, 'Proverbes': 31,
      'Matthieu': 28, 'Marc': 16, 'Luc': 24, 'Jean': 21, 'Actes': 28,
      'Romains': 16, 'Apocalypse': 22
    }
    return chapters[book] || 20
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-xl p-3">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">La Bible</h1>
              <p className="text-amber-100 text-sm">
                &laquo;Ta parole est une lampe à mes pieds&raquo;
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{favorites.length}</div>
              <div className="text-xs text-amber-100">Favoris</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{myPlans.length}</div>
              <div className="text-xs text-amber-100">Plans actifs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">66</div>
              <div className="text-xs text-amber-100">Livres</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 space-y-6">

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 shadow-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-[#fff3cc] text-[#cc9b00] border border-[#ffc200]'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto hover:bg-white/50 rounded-full p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('verse')}
            className={`flex-1 px-3 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-sm ${
              activeTab === 'verse'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Verset</span>
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 px-3 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-sm ${
              activeTab === 'read'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Lire</span>
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 px-3 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-sm ${
              activeTab === 'plans'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Plans</span>
            {myPlans.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'plans' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'
              }`}>
                {myPlans.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 px-3 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-sm ${
              activeTab === 'favorites'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Favoris</span>
            {favorites.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'favorites' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'
              }`}>
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenu */}
      {activeTab === 'verse' && verseOfDay && (
        <div className="space-y-6">
          {/* Verset du jour */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <div className="bg-amber-100 rounded-lg p-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-medium">Verset du jour</span>
              <span className="text-sm text-amber-500 ml-auto">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            <blockquote className="text-xl md:text-2xl text-gray-800 font-serif italic mb-4">
              &laquo;{verseOfDay.text}&raquo;
            </blockquote>

            <p className="text-amber-700 font-medium mb-6">{verseOfDay.reference}</p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => saveFavorite(verseOfDay)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-md"
              >
                <Star className="h-4 w-4" />
                Favoris
              </button>
              <button
                onClick={() => copyVerse(verseOfDay)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copier
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </button>
            </div>
          </div>

          {/* Autres versets inspirants */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Autres versets pour vous inspirer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inspirationalVerses.slice(0, 4).filter(v => v.reference !== verseOfDay.reference).map((verse, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-gray-700 italic mb-2 line-clamp-2">&laquo;{verse.text}&raquo;</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-600 font-medium">{verse.reference}</span>
                    <div className="flex gap-2">
                      <button onClick={() => saveFavorite(verse)} className="text-gray-400 hover:text-amber-500">
                        <Star className="h-4 w-4" />
                      </button>
                      <button onClick={() => copyVerse(verse)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'read' && (
        <div className="space-y-4">
          {/* Sélecteur de livre */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowBookSelector(!showBookSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium"
              >
                <BookOpen className="h-4 w-4" />
                {selectedBook} {selectedChapter}
                <ChevronRight className={`h-4 w-4 transform transition-transform ${showBookSelector ? 'rotate-90' : ''}`} />
              </button>

              {/* Navigation chapitres */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  disabled={selectedChapter <= 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-gray-600">Chapitre {selectedChapter}</span>
                <button
                  onClick={() => setSelectedChapter(Math.min(getChapterCount(selectedBook), selectedChapter + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sélecteur de livre expandable */}
            {showBookSelector && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setSelectedTestament('old')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      selectedTestament === 'old' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Ancien Testament
                  </button>
                  <button
                    onClick={() => setSelectedTestament('new')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      selectedTestament === 'new' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Nouveau Testament
                  </button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                  {(selectedTestament === 'old' ? bibleBooks.oldTestament : bibleBooks.newTestament).map(book => (
                    <button
                      key={book}
                      onClick={() => {
                        setSelectedBook(book)
                        setSelectedChapter(1)
                        setShowBookSelector(false)
                      }}
                      className={`px-3 py-2 text-sm rounded-lg text-left ${
                        selectedBook === book 
                          ? 'bg-amber-100 text-amber-700 font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {book}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contenu du chapitre (placeholder) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedBook} - Chapitre {selectedChapter}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-gray-500 italic">
                Le contenu biblique sera chargé depuis une API Bible externe.
              </p>
              <p className="mt-4">
                Pour l&apos;instant, vous pouvez naviguer entre les livres et chapitres.
                L&apos;intégration complète avec une API Bible (comme bible.api) permettra 
                d&apos;afficher le texte complet.
              </p>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" /> <strong>Astuce :</strong> Utilisez l&apos;onglet &quot;Plans de lecture&quot; pour suivre 
                  un programme de lecture structuré.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Mes plans en cours */}
          {myPlans.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Mes plans en cours</h3>
              <div className="space-y-4">
                {myPlans.map(plan => {
                  const completedDays = plan.readings.filter(r => r.completed).length
                  const progress = Math.round((completedDays / plan.totalDays) * 100)

                  return (
                    <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-500">{completedDays} / {plan.totalDays} jours</p>
                        </div>
                        <span className="text-amber-600 font-bold">{progress}%</span>
                      </div>

                      {/* Barre de progression */}
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Lecture du jour */}
                      {plan.currentDay <= plan.totalDays && (
                        <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                          <div>
                            <p className="text-sm text-amber-600 font-medium">Lecture du jour</p>
                            <p className="text-gray-900">{plan.readings[plan.currentDay - 1]?.reference}</p>
                          </div>
                          <button
                            onClick={() => completeReading(plan.id, plan.currentDay)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-amber-700 hover:to-orange-700 shadow-md transition-all"
                          >
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Terminé
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Plans disponibles */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Plans de lecture disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readingPlans.filter(p => !myPlans.find(mp => mp.id === p.id)).map(plan => (
                <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Clock className="h-3 w-3" />
                        {plan.duration}
                      </div>
                      <button
                        onClick={() => startPlan(plan.id)}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-amber-700 hover:to-orange-700 shadow-md transition-all"
                      >
                        Commencer ce plan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Star className="h-12 w-12 text-amber-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori</h3>
              <p className="text-gray-500">
                Ajoutez des versets à vos favoris pour les retrouver ici
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((verse, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <p className="text-gray-700 italic mb-3">&laquo;{verse.text}&raquo;</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 font-medium">{verse.reference}</span>
                    <div className="flex gap-2">
                      <button onClick={() => copyVerse(verse)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeFavorite(verse.reference)} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info bottom */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 text-center">
        <p className="text-amber-800 text-sm italic">
          &quot;Sonde-moi, ô Dieu, et connais mon cœur !&quot; - Psaume 139:23
        </p>
      </div>
      </div>
    </div>
  )
}

export default BiblePage
