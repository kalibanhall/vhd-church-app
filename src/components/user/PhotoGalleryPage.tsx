/**
 * PhotoGalleryPage - Photothèque
 * Galerie photos des événements et moments de l'église
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Camera,
  Search,
  Filter,
  Grid,
  LayoutGrid,
  X,
  Heart,
  MessageCircle,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  Tag,
  Image as ImageIcon,
  Plus,
  Upload,
  FolderOpen,
  Clock,
  Loader2,
  Church,
  PartyPopper,
  Droplets,
  Sparkles,
  Baby,
  Globe,
  Users
} from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  albumId: string;
  uploadedBy: string;
  uploadedAt: string;
  likes: number;
  comments: number;
  tags: string[];
}

interface Album {
  id: string;
  title: string;
  description?: string;
  coverPhoto?: string;
  date: string;
  location?: string;
  photoCount: number;
  category: string;
}

export default function PhotoGalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeView, setActiveView] = useState<'albums' | 'photos'>('albums');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewSize, setViewSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'worship', label: 'Cultes', icon: Church },
    { id: 'events', label: 'Événements', icon: PartyPopper },
    { id: 'baptism', label: 'Baptêmes', icon: Droplets },
    { id: 'wedding', label: 'Mariages', icon: Heart },
    { id: 'youth', label: 'Jeunesse', icon: Sparkles },
    { id: 'children', label: 'Enfants', icon: Baby },
    { id: 'mission', label: 'Missions', icon: Globe },
    { id: 'community', label: 'Vie d\'\u00e9glise', icon: Users },
  ];

  const mockAlbums: Album[] = [
    {
      id: '1',
      title: 'Culte de Noël 2024 - Kinshasa',
      description: 'Célébration de la nativité avec toute l\'église de Kinshasa',
      date: '2024-12-25',
      location: 'Temple MyChurchApp Gombe',
      photoCount: 45,
      category: 'worship',
    },
    {
      id: '2',
      title: 'Baptêmes - Janvier 2025',
      description: '18 nouveaux baptisés rejoignent notre famille à Lubumbashi',
      date: '2025-01-12',
      location: 'Rivière Lubumbashi',
      photoCount: 52,
      category: 'baptism',
    },
    {
      id: '3',
      title: 'Camp jeunes - Bukavu 2024',
      description: 'Une semaine inoubliable de communion au bord du lac Kivu',
      date: '2024-07-15',
      location: 'Bukavu - Lac Kivu',
      photoCount: 186,
      category: 'youth',
    },
    {
      id: '4',
      title: 'Mariage Emmanuel & Grace',
      description: 'Une belle cérémonie pleine d\'amour à Goma',
      date: '2024-09-21',
      location: 'Temple MyChurchApp Goma',
      photoCount: 112,
      category: 'wedding',
    },
    {
      id: '5',
      title: 'Fête des enfants 2024',
      description: 'Spectacle et goûter pour les plus petits à Matadi',
      date: '2024-06-01',
      location: 'Salle MyChurchApp Matadi',
      photoCount: 78,
      category: 'children',
    },
    {
      id: '6',
      title: 'Mission humanitaire Kasai',
      description: 'Notre équipe sur le terrain dans le Kasai',
      date: '2024-08-10',
      location: 'Kananga, Kasai',
      photoCount: 94,
      category: 'mission',
    },
  ];

  const photographerNames = ['Frère Patrick Mwamba', 'Sœur Grace Mwenze', 'Frère Emmanuel Kasongo', 'Sœur Béatrice Tshimanga', 'Frère David Kalonda'];
  const mockPhotos: Photo[] = Array.from({ length: 20 }, (_, i) => ({
    id: `photo-${i + 1}`,
    url: `/placeholder-photo-${i + 1}.jpg`,
    title: `Photo ${i + 1}`,
    albumId: mockAlbums[i % mockAlbums.length].id,
    uploadedBy: photographerNames[i % photographerNames.length],
    uploadedAt: '2025-01-15',
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 10),
    tags: ['église', 'communauté', 'Congo'],
  }));

  useEffect(() => {
    fetchAlbums();
  }, [selectedCategory]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gallery-proxy?category=${selectedCategory}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAlbums(data.albums || mockAlbums);
      } else {
        setAlbums(mockAlbums);
      }
    } catch {
      setAlbums(mockAlbums);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbumPhotos = async (albumId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gallery-proxy?type=photos&albumId=${albumId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || mockPhotos.filter(p => p.albumId === albumId));
      } else {
        setPhotos(mockPhotos.filter(p => p.albumId === albumId));
      }
    } catch {
      setPhotos(mockPhotos.filter(p => p.albumId === albumId));
    }
  };

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setActiveView('photos');
    fetchAlbumPhotos(album.id);
  };

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowLightbox(true);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = photos.length - 1;
    if (newIndex >= photos.length) newIndex = 0;
    setSelectedPhoto(photos[newIndex]);
  };

  const toggleFavorite = (photoId: string) => {
    setFavorites(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const filteredAlbums = albums.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && a.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { id: categoryId, label: categoryId, icon: Camera };
  };

  const getGridCols = () => {
    switch (viewSize) {
      case 'small': return 'grid-cols-4 md:grid-cols-6';
      case 'large': return 'grid-cols-2 md:grid-cols-3';
      default: return 'grid-cols-3 md:grid-cols-4';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Photothèque</h1>
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
          <Camera className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Photothèque</h1>
        <p className="text-gray-600 mt-2">
          Revivez les moments forts de notre communauté
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{albums.length}</p>
          <p className="text-sm text-gray-500">Albums</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">
            {albums.reduce((acc, a) => acc + a.photoCount, 0)}
          </p>
          <p className="text-sm text-gray-500">Photos</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-red-600">{favorites.length}</p>
          <p className="text-sm text-gray-500">Favoris</p>
        </div>
      </div>

      {/* Back button when viewing album */}
      {activeView === 'photos' && selectedAlbum && (
        <button
          onClick={() => {
            setActiveView('albums');
            setSelectedAlbum(null);
            setPhotos([]);
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour aux albums
        </button>
      )}

      {/* Album Header */}
      {activeView === 'photos' && selectedAlbum && (
        <div className="bg-gradient-to-r from-cyan-500 to-[#ffc200] rounded-xl p-6 text-white mb-6">
          <h2 className="text-2xl font-bold">{selectedAlbum.title}</h2>
          {selectedAlbum.description && (
            <p className="mt-2 opacity-90">{selectedAlbum.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm opacity-80">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(selectedAlbum.date).toLocaleDateString('fr-FR')}
            </span>
            {selectedAlbum.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {selectedAlbum.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              {selectedAlbum.photoCount} photos
            </span>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      {activeView === 'albums' && (
        <>
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un album..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-[#ffc200] text-white'
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
                    ? 'bg-[#ffc200] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* View Size Toggle for Photos */}
      {activeView === 'photos' && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-sm text-gray-500">Taille:</span>
          {[
            { id: 'small', icon: Grid },
            { id: 'medium', icon: LayoutGrid },
            { id: 'large', icon: FolderOpen },
          ].map(size => {
            const Icon = size.icon;
            return (
              <button
                key={size.id}
                onClick={() => setViewSize(size.id as typeof viewSize)}
                className={`p-2 rounded-lg ${
                  viewSize === size.id ? 'bg-[#fff3cc] text-[#cc9b00]' : 'hover:bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Albums Grid */}
      {activeView === 'albums' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredAlbums.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun album trouvé</p>
            </div>
          ) : (
            filteredAlbums.map(album => (
              <div
                key={album.id}
                onClick={() => openAlbum(album)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-cyan-100 to-[#fff3cc] relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-[#e6af00]" />
                  </div>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-white rounded-full font-medium text-gray-900">
                      Voir l'album
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                    {album.photoCount} photos
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 text-xs font-medium rounded-full">
                    <span className="inline-flex items-center gap-1">{(() => { const CatIcon = getCategoryInfo(album.category).icon; return <CatIcon className="h-3 w-3" />; })()} {getCategoryInfo(album.category).label}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 truncate">{album.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(album.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Photos Grid */}
      {activeView === 'photos' && (
        <div className={`grid ${getGridCols()} gap-2`}>
          {photos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune photo dans cet album</p>
            </div>
          ) : (
            photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => openLightbox(photo)}
                className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden relative cursor-pointer group"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(photo.id);
                    }}
                    className="p-2 bg-white rounded-full"
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(photo.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>
                {favorites.includes(photo.id) && (
                  <div className="absolute top-1 right-1">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && selectedPhoto && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleFavorite(selectedPhoto.id)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <Heart className={`h-6 w-6 ${favorites.includes(selectedPhoto.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full">
                <Share2 className="h-6 w-6" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full">
                <Download className="h-6 w-6" />
              </button>
            </div>
            <button onClick={() => setShowLightbox(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <div className="w-full h-full max-w-4xl max-h-[70vh] bg-gray-900 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-20 w-20 text-gray-600" />
            </div>

            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>

          {/* Info */}
          <div className="p-4 text-white">
            {selectedPhoto.title && (
              <h3 className="font-semibold text-lg">{selectedPhoto.title}</h3>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {selectedPhoto.uploadedBy}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(selectedPhoto.uploadedAt).toLocaleDateString('fr-FR')}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {selectedPhoto.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {selectedPhoto.comments}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className={`w-16 h-16 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden ${
                    selectedPhoto.id === photo.id ? 'ring-2 ring-cyan-500' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
