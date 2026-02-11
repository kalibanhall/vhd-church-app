/**
 * LibraryPage - Librairie
 * Catalogue de livres de la bibliothèque de l'église
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Library,
  Search,
  Filter,
  BookOpen,
  User,
  Star,
  Calendar,
  Clock,
  Tag,
  ChevronRight,
  X,
  Heart,
  Download,
  ShoppingCart,
  Grid,
  List,
  BookMarked,
  Check,
  Loader2,
  Church,
  HeartHandshake,
  Users,
  Sparkles,
  Baby,
  Globe,
  Target,
  BookCopy
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover?: string;
  category: string;
  language: string;
  pages: number;
  isbn?: string;
  publisher?: string;
  year?: number;
  rating: number;
  reviews: number;
  available: boolean;
  borrowable: boolean;
  purchasable: boolean;
  price?: number;
  digitalAvailable: boolean;
}

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [myBorrowings, setMyBorrowings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'bible', label: 'Bible & Études', icon: BookOpen },
    { id: 'theology', label: 'Théologie', icon: Church },
    { id: 'devotional', label: 'Dévotion', icon: HeartHandshake },
    { id: 'biography', label: 'Biographies', icon: User },
    { id: 'family', label: 'Famille', icon: Users },
    { id: 'youth', label: 'Jeunesse', icon: Sparkles },
    { id: 'children', label: 'Enfants', icon: Baby },
    { id: 'mission', label: 'Mission', icon: Globe },
    { id: 'leadership', label: 'Leadership', icon: Target },
    { id: 'other', label: 'Autres', icon: BookCopy },
  ];

  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'La Prière qui Déplace les Montagnes',
      author: 'Pasteur Olivier Lukau',
      description: 'Un guide pratique sur la puissance de la prière pour les chrétiens africains d\'aujourd\'hui.',
      category: 'devotional',
      language: 'Français',
      pages: 280,
      publisher: 'Éditions Kinshasa',
      year: 2022,
      rating: 4.8,
      reviews: 156,
      available: true,
      borrowable: true,
      purchasable: true,
      price: 25000,
      digitalAvailable: true,
    },
    {
      id: '2',
      title: 'L\'Histoire de l\'Église au Congo',
      author: 'Professeur Kabongo Mbaya',
      description: 'Une étude complète de l\'évangélisation et du développement de l\'Église en République Démocratique du Congo.',
      category: 'theology',
      language: 'Français',
      pages: 450,
      publisher: 'Éditions Universitaires Lubumbashi',
      year: 2019,
      rating: 4.9,
      reviews: 87,
      available: true,
      borrowable: true,
      purchasable: true,
      price: 45000,
      digitalAvailable: false,
    },
    {
      id: '3',
      title: 'La Foi Vivante - Commentaire sur Romains',
      author: 'Pasteur Mwamba Kalonda',
      description: 'Une explication approfondie de l\'Épître aux Romains dans le contexte africain.',
      category: 'bible',
      language: 'Français',
      pages: 320,
      year: 2021,
      rating: 4.5,
      reviews: 62,
      available: false,
      borrowable: true,
      purchasable: true,
      price: 18000,
      digitalAvailable: true,
    },
    {
      id: '4',
      title: 'Simon Kimbangu: Le Prophète du Congo',
      author: 'Dr. Muzong Kodi',
      description: 'La biographie complète du fondateur de l\'Église Kimbanguiste et son impact sur le christianisme africain.',
      category: 'biography',
      language: 'Français',
      pages: 380,
      year: 2015,
      rating: 4.7,
      reviews: 94,
      available: true,
      borrowable: true,
      purchasable: false,
      digitalAvailable: false,
    },
    {
      id: '5',
      title: 'Famille Chrétienne au Congo',
      author: 'Marie-Claire Kasongo',
      description: 'Élever ses enfants dans la foi au sein de la culture congolaise moderne.',
      category: 'family',
      language: 'Français',
      pages: 208,
      year: 2023,
      rating: 4.6,
      reviews: 78,
      available: true,
      borrowable: true,
      purchasable: true,
      price: 15000,
      digitalAvailable: true,
    },
    {
      id: '6',
      title: 'Histoires de la Bible pour Enfants Congolais',
      author: 'Sœur Béatrice Tshimanga',
      description: 'Les plus belles histoires de la Bible illustrées avec des images inspirées de l\'Afrique.',
      category: 'children',
      language: 'Français',
      pages: 144,
      year: 2024,
      rating: 4.9,
      reviews: 112,
      available: true,
      borrowable: true,
      purchasable: true,
      price: 20000,
      digitalAvailable: false,
    },
  ];

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/library-proxy?category=${selectedCategory}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || mockBooks);
      } else {
        setBooks(mockBooks);
      }
    } catch {
      setBooks(mockBooks);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/library-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ bookId, action: 'borrow' }),
      });
      setMyBorrowings([...myBorrowings, bookId]);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const filteredBooks = books.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory && b.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
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
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Librairie</h1>
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
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Library className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Librairie</h1>
        <p className="text-gray-600 mt-2">
          Parcourez notre collection de livres chrétiens
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-amber-600">{books.length}</p>
          <p className="text-sm text-gray-500">Livres</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{favorites.length}</p>
          <p className="text-sm text-gray-500">Favoris</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-green-600">{myBorrowings.length}</p>
          <p className="text-sm text-gray-500">Emprunts</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <a href="/library/borrowed" className="flex items-center gap-2 px-4 py-2 bg-[#fff3cc] text-[#cc9b00] rounded-xl whitespace-nowrap hover:bg-[#ffda66]">
          <BookMarked className="h-5 w-5" />
          Mes emprunts
        </a>
        <a href="/library/favorites" className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl whitespace-nowrap hover:bg-red-100">
          <Heart className="h-5 w-5" />
          Mes favoris
        </a>
        <a href="/library/new" className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl whitespace-nowrap hover:bg-green-100">
          <BookOpen className="h-5 w-5" />
          Nouveautés
        </a>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un livre ou un auteur..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-xl flex items-center gap-2 ${
            showFilters ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-5 w-5" />
        </button>
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
              ? 'bg-amber-600 text-white'
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
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Books Grid/List */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun livre trouvé</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
          {filteredBooks.map(book => (
            <div
              key={book.id}
              onClick={() => {
                setSelectedBook(book);
                setShowDetailModal(true);
              }}
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Cover */}
              <div className={`relative bg-gradient-to-br from-amber-100 to-amber-200 ${viewMode === 'list' ? 'w-24 h-36 flex-shrink-0' : 'aspect-[3/4]'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-amber-400" />
                </div>
                {!book.available && book.borrowable && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    Indisponible
                  </div>
                )}
                {book.digitalAvailable && (
                  <div className="absolute bottom-2 right-2 p-1.5 bg-[#ffc200] rounded-full">
                    <Download className="h-3 w-3 text-[#0a0a0a]" />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(book.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(book.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Info */}
              <div className={`p-3 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
                <p className="font-semibold text-gray-900 line-clamp-2">{book.title}</p>
                <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                <div className="flex items-center gap-1 mt-2">
                  {renderStars(book.rating)}
                  <span className="text-xs text-gray-400 ml-1">({book.reviews})</span>
                </div>
                {book.purchasable && book.price && (
                  <p className="text-sm font-semibold text-amber-600 mt-2">{book.price.toLocaleString()} FC</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-amber-400" />
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedBook.id)}
                className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md"
              >
                <Heart className={`h-5 w-5 ${favorites.includes(selectedBook.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full inline-flex items-center gap-1">
                  {(() => { const CatIcon = getCategoryInfo(selectedBook.category).icon; return <CatIcon className="h-3 w-3" />; })()} {getCategoryInfo(selectedBook.category).label}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedBook.title}</h2>
                <p className="text-gray-600">{selectedBook.author}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(selectedBook.rating)}
                </div>
                <span className="text-sm text-gray-500">{selectedBook.rating.toFixed(1)} ({selectedBook.reviews} avis)</span>
              </div>

              <p className="text-gray-600">{selectedBook.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <BookOpen className="h-4 w-4" />
                  <span>{selectedBook.pages} pages</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Tag className="h-4 w-4" />
                  <span>{selectedBook.language}</span>
                </div>
                {selectedBook.year && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedBook.year}</span>
                  </div>
                )}
                {selectedBook.publisher && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{selectedBook.publisher}</span>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                {selectedBook.available ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 font-medium">Disponible</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-orange-700 font-medium">En cours d'emprunt</span>
                  </>
                )}
              </div>

              {/* Price */}
              {selectedBook.purchasable && selectedBook.price && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="text-amber-800 font-medium">Prix d'achat</span>
                  <span className="text-2xl font-bold text-amber-600">{selectedBook.price.toLocaleString()} FC</span>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 space-y-2">
              {selectedBook.borrowable && (
                <button
                  onClick={() => handleBorrow(selectedBook.id)}
                  disabled={!selectedBook.available || myBorrowings.includes(selectedBook.id)}
                  className="w-full py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <BookMarked className="h-5 w-5" />
                  {myBorrowings.includes(selectedBook.id) ? 'Déjà emprunté' : 'Emprunter (14 jours)'}
                </button>
              )}
              <div className="flex gap-2">
                {selectedBook.purchasable && (
                  <button className="flex-1 py-3 border border-amber-600 text-amber-600 rounded-xl font-medium hover:bg-amber-50 flex items-center justify-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Acheter
                  </button>
                )}
                {selectedBook.digitalAvailable && (
                  <button className="flex-1 py-3 border border-[#ffc200] text-[#cc9b00] rounded-xl font-medium hover:bg-[#fff3cc] flex items-center justify-center gap-2">
                    <Download className="h-5 w-5" />
                    Télécharger
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
