/**
 * =============================================================================
 * PAGE NOTES - NOTES DE PRÉDICATION ET NOTES PERSONNELLES
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Page permettant aux membres de prendre des notes pendant les
 * prédications et de gérer leurs notes personnelles spirituelles.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  Calendar,
  Video,
  User,
  Tag,
  MoreVertical,
  Folder,
  Star,
  Clock,
  CheckCircle,
  Loader2,
  BookOpen,
  Mic
} from 'lucide-react'

// Types
interface Note {
  id: string
  title: string
  content: string
  type: 'sermon' | 'personal' | 'bible_study'
  sermonId?: string
  sermonTitle?: string
  preacher?: string
  date: string
  lastModified: string
  tags: string[]
  isFavorite: boolean
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

const NotesPage: React.FC = () => {
  // États
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'sermon' | 'personal' | 'bible_study'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  
  // États pour l'édition
  const [isEditing, setIsEditing] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editType, setEditType] = useState<'sermon' | 'personal' | 'bible_study'>('personal')
  const [editTags, setEditTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  // Charger les notes au montage
  useEffect(() => {
    loadNotes()
  }, [])

  // Filtrer les notes
  useEffect(() => {
    let filtered = notes

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType)
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query) ||
        n.tags.some(t => t.toLowerCase().includes(query)) ||
        n.preacher?.toLowerCase().includes(query)
      )
    }

    // Trier par date de modification (plus récent en premier)
    filtered = filtered.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )

    setFilteredNotes(filtered)
  }, [notes, selectedType, searchQuery])

  const loadNotes = () => {
    setIsLoading(true)
    
    // Charger depuis localStorage uniquement - pas de données de démo
    const savedNotes = localStorage.getItem('user_notes')
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch {
        // En cas d'erreur, commencer avec une liste vide
        setNotes([])
      }
    } else {
      // Pas de données de démonstration - commencer avec une liste vide
      setNotes([])
    }
    
    setIsLoading(false)
  }

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
    localStorage.setItem('user_notes', JSON.stringify(updatedNotes))
  }

  const createNewNote = () => {
    setCurrentNote(null)
    setEditTitle('')
    setEditContent('')
    setEditType('personal')
    setEditTags([])
    setIsEditing(true)
  }

  const editNote = (note: Note) => {
    setCurrentNote(note)
    setEditTitle(note.title)
    setEditContent(note.content)
    setEditType(note.type)
    setEditTags(note.tags)
    setIsEditing(true)
  }

  const saveNote = () => {
    if (!editTitle.trim()) {
      setMessage({ type: 'error', text: 'Le titre est requis' })
      return
    }

    const now = new Date().toISOString()
    
    if (currentNote) {
      // Mise à jour
      const updatedNotes = notes.map(n => 
        n.id === currentNote.id 
          ? { ...n, title: editTitle, content: editContent, type: editType, tags: editTags, lastModified: now }
          : n
      )
      saveNotes(updatedNotes)
      setMessage({ type: 'success', text: 'Note mise à jour' })
    } else {
      // Nouvelle note
      const newNote: Note = {
        id: `note_${Date.now()}`,
        title: editTitle,
        content: editContent,
        type: editType,
        date: now,
        lastModified: now,
        tags: editTags,
        isFavorite: false
      }
      saveNotes([newNote, ...notes])
      setMessage({ type: 'success', text: 'Note créée' })
    }

    setIsEditing(false)
    setCurrentNote(null)
  }

  const deleteNote = (noteId: string) => {
    if (confirm('Supprimer cette note ?')) {
      const updatedNotes = notes.filter(n => n.id !== noteId)
      saveNotes(updatedNotes)
      setMessage({ type: 'info', text: 'Note supprimée' })
    }
  }

  const toggleFavorite = (noteId: string) => {
    const updatedNotes = notes.map(n => 
      n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
    )
    saveNotes(updatedNotes)
  }

  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Aujourd\'hui'
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sermon': return <Mic className="h-4 w-4" />
      case 'bible_study': return <BookOpen className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sermon': return 'Prédication'
      case 'bible_study': return 'Étude biblique'
      default: return 'Personnel'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sermon': return 'bg-[#fff3cc] text-[#5c4d00]'
      case 'bible_study': return 'bg-amber-100 text-amber-700'
      default: return 'bg-[#fff3cc] text-[#cc9b00]'
    }
  }

  // Statistiques
  const stats = {
    total: notes.length,
    sermons: notes.filter(n => n.type === 'sermon').length,
    personal: notes.filter(n => n.type === 'personal').length,
    bibleStudy: notes.filter(n => n.type === 'bible_study').length,
    favorites: notes.filter(n => n.isFavorite).length
  }

  if (isLoading) {
    return <LoadingSpinner size="md" text="Chargement des notes..." />
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ffc200] to-[#cc9b00] rounded-2xl p-6 text-[#0a0a0a]">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Mes Notes</h1>
        <p className="text-[#3d3200]">
          Prenez des notes pendant les prédications et gardez une trace de vos réflexions spirituelles
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-[#fff3cc] text-[#cc9b00] border border-[#ffc200]'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-[#cc9b00]">{stats.sermons}</div>
          <div className="text-sm text-gray-500">Prédications</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-amber-600">{stats.bibleStudy}</div>
          <div className="text-sm text-gray-500">Études</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-[#cc9b00]">{stats.personal}</div>
          <div className="text-sm text-gray-500">Personnelles</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{stats.favorites}</div>
          <div className="text-sm text-gray-500">Favoris</div>
        </div>
      </div>

      {/* Modal d'édition */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {currentNote ? 'Modifier la note' : 'Nouvelle note'}
                </h2>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                  placeholder="Titre de la note..."
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-2">
                  {[
                    { value: 'sermon', label: 'Prédication', icon: Mic },
                    { value: 'bible_study', label: 'Étude biblique', icon: BookOpen },
                    { value: 'personal', label: 'Personnel', icon: FileText }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setEditType(value as 'sermon' | 'personal' | 'bible_study')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        editType === value 
                          ? 'bg-[#ffc200] text-[#0a0a0a] shadow-church' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent resize-none"
                  placeholder="Écrivez votre note ici..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-[#fff3cc] text-[#cc9b00] rounded-full text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                    placeholder="Ajouter un tag..."
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={saveNote}
                className="flex items-center gap-2 px-4 py-2 bg-[#ffc200] text-[#0a0a0a] rounded-lg hover:bg-[#cc9b00] shadow-church"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions et filtres */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'Toutes' },
            { value: 'sermon', label: 'Prédications' },
            { value: 'bible_study', label: 'Études' },
            { value: 'personal', label: 'Personnelles' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value as typeof selectedType)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedType === value
                  ? 'bg-[#ffc200] text-[#0a0a0a] shadow-church'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
            />
          </div>
          <button
            onClick={createNewNote}
            className="flex items-center gap-2 px-4 py-2 bg-[#ffc200] text-[#0a0a0a] rounded-lg hover:bg-[#cc9b00] shadow-church"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Nouvelle note</span>
          </button>
        </div>
      </div>

      {/* Liste des notes */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Aucune note trouvée' : 'Aucune note'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Essayez avec d\'autres termes de recherche' 
              : 'Créez votre première note pour commencer'}
          </p>
          {!searchQuery && (
            <button
              onClick={createNewNote}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffc200] text-[#0a0a0a] rounded-lg hover:bg-[#cc9b00] shadow-church"
            >
              <Plus className="h-4 w-4" />
              Créer une note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => editNote(note)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeColor(note.type)}`}>
                    {getTypeIcon(note.type)}
                    {getTypeLabel(note.type)}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }}
                    className={`p-1 rounded ${note.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                  >
                    <Star className="h-5 w-5" fill={note.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{note.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{note.content}</p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-400 text-xs">+{note.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(note.lastModified)}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
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
  )
}

export default NotesPage
