/**
 * AudiobooksPage - Audiobooks
 * Collection de livres audio chrétiens
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Headphones,
  Search,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Star,
  Heart,
  Download,
  List,
  Grid,
  X,
  ChevronRight,
  Bookmark,
  Share2,
  User,
  Calendar,
  Loader2,
  BookOpen,
  HeartHandshake,
  BookCopy,
  Sparkles,
  BookMarked,
  Baby,
  Podcast
} from 'lucide-react';

interface Audiobook {
  id: string;
  title: string;
  author: string;
  narrator: string;
  description: string;
  cover?: string;
  category: string;
  duration: number; // minutes
  chapters: { id: string; title: string; duration: number }[];
  rating: number;
  reviews: number;
  releaseDate: string;
  language: string;
  isPremium: boolean;
  isNew: boolean;
}

export default function AudiobooksPage() {
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAudiobook, setSelectedAudiobook] = useState<Audiobook | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'bible', label: 'Bible Audio', icon: BookOpen },
    { id: 'devotional', label: 'Dévotion', icon: HeartHandshake },
    { id: 'teaching', label: 'Enseignements', icon: BookCopy },
    { id: 'testimony', label: 'Témoignages', icon: Sparkles },
    { id: 'fiction', label: 'Romans chrétiens', icon: BookMarked },
    { id: 'children', label: 'Enfants', icon: Baby },
    { id: 'podcast', label: 'Podcasts', icon: Podcast },
  ];

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const mockAudiobooks: Audiobook[] = [
    {
      id: '1',
      title: 'La Bible en 1 an - Nouveau Testament',
      author: 'Bible',
      narrator: 'Pasteur Jean-Pierre Kutino',
      description: 'Écoutez le Nouveau Testament lu en français avec une touche africaine. Parfait pour votre dévotion quotidienne.',
      category: 'bible',
      duration: 1180,
      chapters: [
        { id: '1-1', title: 'Matthieu 1-5', duration: 45 },
        { id: '1-2', title: 'Matthieu 6-10', duration: 42 },
        { id: '1-3', title: 'Matthieu 11-15', duration: 38 },
      ],
      rating: 4.9,
      reviews: 328,
      releaseDate: '2024-01-15',
      language: 'Français',
      isPremium: false,
      isNew: false,
    },
    {
      id: '2',
      title: 'Vivre par la Foi au Congo',
      author: 'Pasteur Olivier Lukau',
      narrator: 'Frère Patrick Mwamba',
      description: 'Comment vivre une vie de foi au quotidien dans le contexte congolais. Un enseignement pratique et puissant.',
      category: 'teaching',
      duration: 540,
      chapters: [
        { id: '2-1', title: 'Introduction', duration: 15 },
        { id: '2-2', title: 'Chapitre 1: La foi qui déplace les montagnes', duration: 28 },
        { id: '2-3', title: 'Chapitre 2: Confiance en Dieu', duration: 32 },
      ],
      rating: 4.8,
      reviews: 156,
      releaseDate: '2024-06-01',
      language: 'Français',
      isPremium: true,
      isNew: false,
    },
    {
      id: '3',
      title: 'De Kinshasa à la Croix - Mon témoignage',
      author: 'Frère Emmanuel Kasongo',
      narrator: 'Frère Emmanuel Kasongo',
      description: 'L\'histoire vraie d\'une transformation par la grâce de Dieu dans les rues de Kinshasa.',
      category: 'testimony',
      duration: 180,
      chapters: [
        { id: '3-1', title: 'L\'enfance à Matonge', duration: 25 },
        { id: '3-2', title: 'La descente aux enfers', duration: 35 },
        { id: '3-3', title: 'La rencontre avec Jésus', duration: 30 },
      ],
      rating: 4.7,
      reviews: 89,
      releaseDate: '2024-11-10',
      language: 'Français',
      isPremium: false,
      isNew: true,
    },
    {
      id: '4',
      title: 'Histoires de la Bible pour enfants',
      author: 'Sœur Béatrice Tshimanga',
      narrator: 'Maman Marie Lukusa',
      description: 'Les plus belles histoires de la Bible racontées pour les petits avec musique et effets sonores congolais.',
      category: 'children',
      duration: 120,
      chapters: [
        { id: '4-1', title: 'La création', duration: 8 },
        { id: '4-2', title: 'Noé et l\'arche', duration: 10 },
        { id: '4-3', title: 'David et Goliath', duration: 12 },
      ],
      rating: 4.9,
      reviews: 234,
      releaseDate: '2024-09-01',
      language: 'Français',
      isPremium: false,
      isNew: false,
    },
    {
      id: '5',
      title: 'Méditations du matin - 30 jours',
      author: 'Sœur Grace Mwenze',
      narrator: 'Sœur Grace Mwenze',
      description: '30 méditations matinales pour bien démarrer chaque journée avec Dieu depuis Lubumbashi.',
      category: 'devotional',
      duration: 300,
      chapters: Array.from({ length: 30 }, (_, i) => ({
        id: `5-${i + 1}`,
        title: `Jour ${i + 1}`,
        duration: 10,
      })),
      rating: 4.6,
      reviews: 112,
      releaseDate: '2025-01-01',
      language: 'Français',
      isPremium: true,
      isNew: true,
    },
  ];

  useEffect(() => {
    fetchAudiobooks();
  }, [selectedCategory]);

  const fetchAudiobooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/audiobooks-proxy?category=${selectedCategory}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAudiobooks(data.audiobooks || mockAudiobooks);
      } else {
        setAudiobooks(mockAudiobooks);
      }
    } catch {
      setAudiobooks(mockAudiobooks);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (audiobookId: string) => {
    setFavorites(prev =>
      prev.includes(audiobookId)
        ? prev.filter(id => id !== audiobookId)
        : [...prev, audiobookId]
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredAudiobooks = audiobooks.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.author.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory && a.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { id: categoryId, label: categoryId, emoji: '📚' };
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Audiobooks</h1>
          <p className="text-gray-600 mt-2">Chargement...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
          <Headphones className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Audiobooks</h1>
        <p className="text-gray-600 mt-2">
          Écoutez des livres chrétiens partout, à tout moment
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{audiobooks.length}</p>
          <p className="text-sm text-gray-500">Audiobooks</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{favorites.length}</p>
          <p className="text-sm text-gray-500">Favoris</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-green-600">
            {formatDuration(audiobooks.reduce((acc, a) => acc + a.duration, 0))}
          </p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un audiobook..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'bg-[#ffc200] text-[#0a0a0a]'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tout
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#ffc200] text-[#0a0a0a]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Audiobooks Grid/List */}
      {filteredAudiobooks.length === 0 ? (
        <div className="text-center py-12">
          <Headphones className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun audiobook trouvé</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
          {filteredAudiobooks.map(audiobook => (
            <div
              key={audiobook.id}
              onClick={() => {
                setSelectedAudiobook(audiobook);
                setShowPlayerModal(true);
                setCurrentChapter(0);
                setCurrentTime(0);
              }}
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Cover */}
              <div className={`relative bg-gradient-to-br from-[#fff3cc] to-[#ffda66] ${viewMode === 'list' ? 'w-24 h-32 flex-shrink-0' : 'aspect-square'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Headphones className="h-12 w-12 text-[#cc9b00]" />
                </div>
                {audiobook.isNew && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                    Nouveau
                  </div>
                )}
                {audiobook.isPremium && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                    Premium
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(audiobook.id);
                  }}
                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(audiobook.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(audiobook.duration)}
                </div>
              </div>

              {/* Info */}
              <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <p className="font-semibold text-gray-900 line-clamp-2">{audiobook.title}</p>
                <p className="text-sm text-gray-500 mt-1">{audiobook.author}</p>
                <p className="text-xs text-gray-400 mt-1">Lu par {audiobook.narrator}</p>
                <div className="flex items-center gap-1 mt-2">
                  {renderStars(audiobook.rating)}
                  <span className="text-xs text-gray-400 ml-1">({audiobook.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Modal */}
      {showPlayerModal && selectedAudiobook && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <button onClick={() => setShowPlayerModal(false)} className="p-2 text-white hover:bg-white/10 rounded-lg">
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 text-white hover:bg-white/10 rounded-lg">
                <Bookmark className="h-5 w-5" />
              </button>
              <button className="p-2 text-white hover:bg-white/10 rounded-lg">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            {/* Cover */}
            <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-[#ffc200] to-[#cc9b00] rounded-2xl flex items-center justify-center shadow-2xl mb-8">
              <Headphones className="h-20 w-20 text-[#0a0a0a]" />
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-white text-center">{selectedAudiobook.title}</h2>
            <p className="text-gray-400 mt-2">{selectedAudiobook.author}</p>
            <p className="text-gray-500 text-sm mt-1">Lu par {selectedAudiobook.narrator}</p>

            {/* Chapter */}
            <div className="mt-4 px-4 py-2 bg-white/10 rounded-full">
              <p className="text-white text-sm">
                {selectedAudiobook.chapters[currentChapter]?.title || 'Chapitre 1'}
              </p>
            </div>

            {/* Progress */}
            <div className="w-full max-w-md mt-8 px-4">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ffc200] rounded-full transition-all"
                  style={{ width: `${(currentTime / (selectedAudiobook.chapters[currentChapter]?.duration * 60 || 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime((selectedAudiobook.chapters[currentChapter]?.duration || 0) * 60)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-8">
              <button 
                onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                className="p-3 text-white hover:bg-white/10 rounded-full"
              >
                <SkipBack className="h-8 w-8" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-5 bg-[#ffc200] text-[#0a0a0a] rounded-full hover:bg-[#e6af00] transition-colors"
              >
                {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}
              </button>
              <button 
                onClick={() => setCurrentChapter(Math.min(selectedAudiobook.chapters.length - 1, currentChapter + 1))}
                className="p-3 text-white hover:bg-white/10 rounded-full"
              >
                <SkipForward className="h-8 w-8" />
              </button>
            </div>

            {/* Speed & Volume */}
            <div className="flex items-center gap-6 mt-6">
              {/* Speed */}
              <button
                onClick={() => {
                  const currentIndex = speeds.indexOf(playbackSpeed);
                  setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
                }}
                className="px-3 py-1 bg-white/10 text-white rounded-full text-sm"
              >
                {playbackSpeed}x
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="text-white">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 accent-[#ffc200]"
                />
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="p-4 bg-gray-900 max-h-48 overflow-y-auto">
            <h3 className="text-white font-semibold mb-3">Chapitres ({selectedAudiobook.chapters.length})</h3>
            <div className="space-y-2">
              {selectedAudiobook.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    setCurrentChapter(index);
                    setCurrentTime(0);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    currentChapter === index ? 'bg-[#ffc200]' : 'hover:bg-white/10'
                  }`}
                >
                  <span className="text-white text-sm">{chapter.title}</span>
                  <span className="text-gray-400 text-sm">{chapter.duration}min</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
