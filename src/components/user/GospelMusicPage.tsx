/**
 * GospelMusicPage - Musique Gospel
 * Lecteur de musique gospel et louange
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Music,
  Search,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Plus,
  ListMusic,
  Shuffle,
  Repeat,
  X,
  Clock,
  Disc,
  User,
  ChevronRight,
  MoreVertical,
  Radio,
  TrendingUp,
  Mic2,
  Loader2,
  HandMetal,
  Music2,
  Church,
  Globe,
  Baby
} from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // seconds
  cover?: string;
  category: string;
  plays: number;
  isNew: boolean;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  songs: Song[];
  isOfficial: boolean;
}

export default function GospelMusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'playlists' | 'artists'>('discover');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Song[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'worship', label: 'Louange', icon: HandMetal },
    { id: 'praise', label: 'Adoration', icon: Heart },
    { id: 'gospel', label: 'Gospel', icon: Music },
    { id: 'choir', label: 'Chorale', icon: Mic2 },
    { id: 'contemporary', label: 'Contemporain', icon: Music2 },
    { id: 'traditional', label: 'Traditionnel', icon: Church },
    { id: 'african', label: 'Africain', icon: Globe },
    { id: 'kids', label: 'Enfants', icon: Baby },
  ];

  const mockSongs: Song[] = [
    { id: '1', title: 'Nzambe Monene', artist: 'Moïse Mbiye', album: 'Parfum de Célébration', duration: 390, category: 'worship', plays: 125420, isNew: false },
    { id: '2', title: 'Tango Naye', artist: 'Fiston Mbuyi', album: 'Identité', duration: 342, category: 'worship', plays: 98900, isNew: false },
    { id: '3', title: 'Emmanuel', artist: 'Dena Mwana', album: 'Elyon', duration: 420, category: 'african', plays: 145200, isNew: false },
    { id: '4', title: 'Bolingo ya Klisto', artist: 'Mike Kalambay', album: 'Kumama', duration: 318, category: 'praise', plays: 82100, isNew: false },
    { id: '5', title: 'Maloba', artist: 'Alain Moloto', album: 'Grâce Infinie', duration: 295, category: 'worship', plays: 71000, isNew: true },
    { id: '6', title: 'Souffle', artist: 'L\'Or Mbongo', album: 'Mon Héritage', duration: 385, category: 'praise', plays: 62300, isNew: false },
    { id: '7', title: 'Célébration', artist: 'Athoms Mbuma', album: 'Ma Raison de Vivre', duration: 510, category: 'praise', plays: 88700, isNew: false },
    { id: '8', title: 'Eternel Tu Règnes', artist: 'Rosny Kayiba', album: 'Adoration Live', duration: 352, category: 'worship', plays: 77200, isNew: false },
    { id: '9', title: 'Na Lobi Na Yo', artist: 'Sandra Mbuyi', album: 'Hosanna', duration: 268, category: 'contemporary', plays: 58900, isNew: true },
    { id: '10', title: 'Hymne de Louange', artist: 'Chorale MyChurchApp', album: 'Hymnes Congolais', duration: 245, category: 'traditional', plays: 28500, isNew: false },
    { id: '11', title: 'Mokonzi', artist: 'Gloire Kielema', album: 'Louange à Goma', duration: 390, category: 'african', plays: 65800, isNew: true },
    { id: '12', title: 'Yesu Alingi Bana', artist: 'Chorale Enfants Lubumbashi', album: 'Chants pour Enfants', duration: 145, category: 'kids', plays: 32400, isNew: false },
  ];

  const mockPlaylists: Playlist[] = [
    {
      id: '1',
      name: 'Louange du dimanche - Kinshasa',
      description: 'Les chants pour notre culte dominical à Kinshasa',
      songs: mockSongs.slice(0, 6),
      isOfficial: true,
    },
    {
      id: '2',
      name: 'Top Gospel Congolais',
      description: 'Les meilleurs artistes du Congo',
      songs: [...mockSongs].sort((a, b) => b.plays - a.plays).slice(0, 10),
      isOfficial: true,
    },
    {
      id: '3',
      name: 'Adoration Lingala',
      description: 'Chants d\'adoration en Lingala',
      songs: mockSongs.filter(s => s.category === 'praise' || s.category === 'worship').slice(0, 8),
      isOfficial: true,
    },
    {
      id: '4',
      name: 'Musique de Lubumbashi',
      description: 'Gospel du Katanga',
      songs: mockSongs.filter(s => s.category === 'african'),
      isOfficial: true,
    },
  ];

  useEffect(() => {
    fetchMusic();
  }, [selectedCategory]);

  const fetchMusic = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/music-proxy?category=${selectedCategory}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSongs(data.songs || mockSongs);
        setPlaylists(data.playlists || mockPlaylists);
      } else {
        setSongs(mockSongs);
        setPlaylists(mockPlaylists);
      }
    } catch {
      setSongs(mockSongs);
      setPlaylists(mockPlaylists);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (songId: string) => {
    setFavorites(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playSong = (song: Song, songList?: Song[]) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
    if (songList) {
      const index = songList.findIndex(s => s.id === song.id);
      setQueue([...songList.slice(index + 1), ...songList.slice(0, index)]);
    }
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setCurrentSong(nextSong);
      setQueue(prev => [...prev.slice(1), currentSong!].filter(Boolean));
      setCurrentTime(0);
    }
  };

  const playPrevious = () => {
    if (queue.length > 0) {
      const prevSong = queue[queue.length - 1];
      setCurrentSong(prevSong);
      setQueue(prev => [currentSong!, ...prev.slice(0, -1)].filter(Boolean));
      setCurrentTime(0);
    }
  };

  const filteredSongs = songs.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.artist.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory && s.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { id: categoryId, label: categoryId, icon: Music };
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Musique Gospel</h1>
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
    <div className={`max-w-6xl mx-auto p-4 ${currentSong ? 'pb-40' : 'pb-24'}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
          <Music className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Musique Gospel</h1>
        <p className="text-gray-600 mt-2">
          Louez le Seigneur en musique
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un titre, artiste..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'discover', label: 'Découvrir', icon: TrendingUp },
          { id: 'playlists', label: 'Playlists', icon: ListMusic },
          { id: 'artists', label: 'Artistes', icon: Mic2 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#cc9b00] border-[#ffc200]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <>
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

          {/* New Releases */}
          {!selectedCategory && filteredSongs.filter(s => s.isNew).length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🆕 Nouveautés</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {filteredSongs.filter(s => s.isNew).map(song => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, filteredSongs.filter(s => s.isNew))}
                    className="flex-shrink-0 w-40 cursor-pointer group"
                  >
                    <div className="relative w-40 h-40 bg-gradient-to-br from-[#fff3cc] to-[#ffda66] rounded-xl flex items-center justify-center mb-2">
                      <Music className="h-12 w-12 text-[#cc9b00]" />
                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-3 bg-white rounded-full">
                          <Play className="h-6 w-6 text-[#cc9b00] ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{song.title}</p>
                    <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Songs List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCategory ? getCategoryInfo(selectedCategory).label : 'Tous les titres'}
            </h2>
            <div className="space-y-2">
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group ${
                    currentSong?.id === song.id ? 'bg-[#fff3cc]' : ''
                  }`}
                  onClick={() => playSong(song, filteredSongs)}
                >
                  <span className="w-6 text-center text-gray-400 text-sm group-hover:hidden">
                    {index + 1}
                  </span>
                  <Play className="h-5 w-5 text-[#cc9b00] hidden group-hover:block" />
                  <div className="w-12 h-12 bg-gradient-to-br from-[#fff3cc] to-[#ffda66] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="h-6 w-6 text-[#cc9b00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${currentSong?.id === song.id ? 'text-[#cc9b00]' : 'text-gray-900'}`}>
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                  </div>
                  <span className="text-sm text-gray-400 hidden sm:block">{formatTime(song.duration)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Heart className={`h-5 w-5 ${favorites.includes(song.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Playlists Tab */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map(playlist => (
            <div
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="aspect-square bg-gradient-to-br from-[#fff3cc] to-[#ffda66] relative">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-2">
                  {playlist.songs.slice(0, 4).map((_, i) => (
                    <div key={i} className="bg-white/30 rounded flex items-center justify-center">
                      <Music className="h-6 w-6 text-[#0a0a0a]" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-4 bg-white rounded-full">
                    <Play className="h-8 w-8 text-[#cc9b00] ml-0.5" />
                  </div>
                </div>
                {playlist.isOfficial && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-[#ffc200] text-[#0a0a0a] text-xs font-medium rounded-full">
                    Officielle
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-900">{playlist.name}</p>
                <p className="text-sm text-gray-500 mt-1">{playlist.songs.length} titres</p>
              </div>
            </div>
          ))}
          {/* Create Playlist Button */}
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 cursor-pointer hover:border-[#ffc200] transition-colors">
            <Plus className="h-10 w-10 text-gray-400 mb-2" />
            <p className="font-medium text-gray-600">Créer une playlist</p>
          </div>
        </div>
      )}

      {/* Artists Tab */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...new Set(songs.map(s => s.artist))].map(artist => {
            const artistSongs = songs.filter(s => s.artist === artist);
            return (
              <div key={artist} className="text-center cursor-pointer group">
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-3 group-hover:shadow-lg transition-all">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900">{artist}</p>
                <p className="text-sm text-gray-500">{artistSongs.length} titres</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Now Playing Bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-[#ffc200] transition-all"
              style={{ width: `${(currentTime / currentSong.duration) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center gap-4 p-4">
            {/* Song Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 bg-gradient-to-br from-[#fff3cc] to-[#fff3cc] rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="h-6 w-6 text-[#e6af00]" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{currentSong.title}</p>
                <p className="text-sm text-gray-500 truncate">{currentSong.artist}</p>
              </div>
              <button
                onClick={() => toggleFavorite(currentSong.id)}
                className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
              >
                <Heart className={`h-5 w-5 ${favorites.includes(currentSong.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShuffle(!shuffle)}
                className={`p-2 hover:bg-gray-100 rounded-full hidden sm:block ${shuffle ? 'text-[#cc9b00]' : 'text-gray-400'}`}
              >
                <Shuffle className="h-5 w-5" />
              </button>
              <button onClick={playPrevious} className="p-2 hover:bg-gray-100 rounded-full">
                <SkipBack className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-[#ffc200] text-white rounded-full hover:bg-[#cc9b00]"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>
              <button onClick={playNext} className="p-2 hover:bg-gray-100 rounded-full">
                <SkipForward className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
                className={`p-2 hover:bg-gray-100 rounded-full hidden sm:block ${repeat !== 'off' ? 'text-[#cc9b00]' : 'text-gray-400'}`}
              >
                <Repeat className="h-5 w-5" />
                {repeat === 'one' && <span className="absolute text-xs">1</span>}
              </button>
            </div>

            {/* Volume & Queue */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-gray-100 rounded-full">
                {isMuted ? <VolumeX className="h-5 w-5 text-gray-400" /> : <Volume2 className="h-5 w-5 text-gray-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24 accent-[#ffc200]"
              />
              <button 
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 hover:bg-gray-100 rounded-full ${showQueue ? 'text-[#cc9b00]' : 'text-gray-400'}`}
              >
                <ListMusic className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Time */}
          <div className="px-4 pb-2 flex items-center justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentSong.duration)}</span>
          </div>
        </div>
      )}

      {/* Queue Sidebar */}
      {showQueue && (
        <div className="fixed right-0 top-0 bottom-24 w-80 bg-white border-l border-gray-200 shadow-xl z-30 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">File d'attente</h3>
            <button onClick={() => setShowQueue(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">En cours de lecture</p>
            {currentSong && (
              <div className="flex items-center gap-3 p-2 bg-[#fff3cc] rounded-lg mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#fff3cc] to-[#fff3cc] rounded flex items-center justify-center">
                  <Music className="h-5 w-5 text-[#e6af00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">{currentSong.title}</p>
                  <p className="text-xs text-gray-500 truncate">{currentSong.artist}</p>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-2">À suivre ({queue.length})</p>
            <div className="space-y-2">
              {queue.map((song, index) => (
                <div key={`${song.id}-${index}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span className="w-5 text-center text-gray-400 text-sm">{index + 1}</span>
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                    <Music className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{song.title}</p>
                    <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Playlist Detail Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-[#ffc200] to-[#cc9b00] flex items-center justify-center">
                <ListMusic className="h-20 w-20 text-white" />
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedPlaylist.name}</h2>
              <p className="text-gray-600 mt-1">{selectedPlaylist.description}</p>
              <p className="text-sm text-gray-500 mt-2">{selectedPlaylist.songs.length} titres</p>
              
              <button
                onClick={() => {
                  if (selectedPlaylist.songs.length > 0) {
                    playSong(selectedPlaylist.songs[0], selectedPlaylist.songs);
                  }
                }}
                className="w-full mt-4 py-3 bg-[#ffc200] text-white rounded-xl font-medium hover:bg-[#cc9b00] flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                Lecture
              </button>

              <div className="mt-6 space-y-2">
                {selectedPlaylist.songs.map((song, index) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, selectedPlaylist.songs)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="w-6 text-center text-gray-400 text-sm">{index + 1}</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#fff3cc] to-[#fff3cc] rounded flex items-center justify-center">
                      <Music className="h-5 w-5 text-[#e6af00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{song.title}</p>
                      <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                    </div>
                    <span className="text-sm text-gray-400">{formatTime(song.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



