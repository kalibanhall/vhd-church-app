/**
 * SongbookPage - Recueil de chants
 * Recueil de cantiques et chants de louange avec paroles
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen,
  Search,
  Music,
  Play,
  Heart,
  Share2,
  Printer,
  ChevronRight,
  X,
  Copy,
  Check,
  Filter,
  ArrowUp,
  Star,
  Clock,
  List,
  Grid,
  Type,
  Minus,
  Plus,
  Bookmark,
  BookMarked,
  Loader2,
  HandMetal,
  TreePine,
  Cross,
  Wine,
  Droplets,
  Church,
  Bird,
  Baby,
  Scroll,
  Keyboard,
  Timer
} from 'lucide-react';

interface Song {
  id: string;
  number: number;
  title: string;
  author?: string;
  composer?: string;
  category: string;
  verses: { number: number; text: string; isChorus?: boolean }[];
  key?: string;
  tempo?: string;
  tags: string[];
  isFavorite: boolean;
  lastViewed?: string;
}

export default function SongbookPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongModal, setShowSongModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'number' | 'title' | 'recent'>('number');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'worship', label: 'Louange', icon: HandMetal },
    { id: 'praise', label: 'Adoration', icon: Heart },
    { id: 'christmas', label: 'Noël', icon: TreePine },
    { id: 'easter', label: 'Pâques', icon: Cross },
    { id: 'communion', label: 'Sainte-Cène', icon: Wine },
    { id: 'baptism', label: 'Baptême', icon: Droplets },
    { id: 'wedding', label: 'Mariage', icon: Church },
    { id: 'funeral', label: 'Funérailles', icon: Bird },
    { id: 'children', label: 'Enfants', icon: Baby },
    { id: 'traditional', label: 'Traditionnels', icon: Scroll },
  ];

  const mockSongs: Song[] = [
    {
      id: '1',
      number: 1,
      title: 'À Toi la gloire',
      author: 'Edmond Budry',
      composer: 'G.F. Handel',
      category: 'easter',
      verses: [
        { number: 1, text: 'À toi la gloire, Ô Ressuscité!\nÀ toi la victoire pour l\'éternité!\nBrillant de lumière, l\'ange est descendu,\nIl roule la pierre du tombeau vaincu.' },
        { number: 0, text: 'À toi la gloire, Ô Ressuscité!\nÀ toi la victoire pour l\'éternité!', isChorus: true },
        { number: 2, text: 'Vois-le paraître: c\'est lui, c\'est Jésus,\nTon Sauveur, ton Maître! Oh! ne doute plus!\nSois dans l\'allégresse, peuple du Seigneur,\nEt redis sans cesse que Christ est vainqueur.' },
        { number: 3, text: 'Craindrais-je encore? Il vit à jamais,\nCelui que j\'adore, le Prince de paix!\nIl est ma victoire, mon puissant soutien,\nMa vie et ma gloire: non, je ne crains rien.' },
      ],
      key: 'Sol majeur',
      tempo: 'Modéré',
      tags: ['résurrection', 'victoire', 'pâques'],
      isFavorite: true,
    },
    {
      id: '2',
      number: 23,
      title: 'Quel ami fidèle et tendre',
      author: 'Joseph M. Scriven',
      composer: 'Charles C. Converse',
      category: 'traditional',
      verses: [
        { number: 1, text: 'Quel ami fidèle et tendre nous avons en Jésus-Christ,\nToujours prêt à nous entendre, à répondre à notre cri!\nIl connaît nos défaillances, nos chutes de chaque jour,\nSévère en ses exigences, il est riche en son amour.' },
        { number: 2, text: 'Quel ami fidèle et tendre nous avons en Jésus-Christ,\nToujours prêt à nous comprendre quand nous sommes en souci!\nDisons-lui toutes nos craintes, ouvrons-lui tout notre cœur,\nBientôt ses paroles saintes nous rendront le vrai bonheur.' },
        { number: 3, text: 'Quel ami fidèle et tendre nous avons en Jésus-Christ,\nToujours prêt à nous défendre quand nous presse l\'ennemi!\nIl nous suit dans la mêlée, nous entoure de ses bras,\nEt c\'est lui qui tient l\'épée qui combat pour les soldats.' },
      ],
      key: 'Fa majeur',
      tempo: 'Lent',
      tags: ['amitié', 'prière', 'confiance'],
      isFavorite: false,
    },
    {
      id: '3',
      number: 45,
      title: 'Douce nuit, sainte nuit',
      author: 'Joseph Mohr',
      composer: 'Franz Xaver Gruber',
      category: 'christmas',
      verses: [
        { number: 1, text: 'Douce nuit, sainte nuit!\nDans les cieux l\'astre luit.\nLe mystère annoncé s\'accomplit.\nCet enfant sur la paille endormi,\nC\'est l\'amour infini! C\'est l\'amour infini!' },
        { number: 2, text: 'Saint enfant, doux agneau!\nQu\'il est grand! Qu\'il est beau!\nEntendez résonner dans les airs\nDes bergers les chansons les plus chères.\nGloire à Dieu! Paix à tous! Gloire à Dieu! Paix à tous!' },
        { number: 3, text: 'C\'est vers nous qu\'il accourt\nEn un don sans retour.\nDès la crèche au Calvaire ses pas\nS\'acheminent vers notre trépas.\nJésus-Christ nous sauvant! Jésus-Christ nous sauvant!' },
      ],
      key: 'Si bémol majeur',
      tempo: 'Lent',
      tags: ['noël', 'nativité', 'paix'],
      isFavorite: true,
    },
    {
      id: '4',
      number: 100,
      title: 'Que ma bouche chante ta louange',
      author: 'Inconnu',
      category: 'worship',
      verses: [
        { number: 1, text: 'Que ma bouche chante ta louange,\nSeigneur mon Dieu, tu es infiniment grand!\nQue ma bouche chante ta louange,\nQue mon cœur célèbre ta grandeur!' },
        { number: 0, text: 'Alléluia! Alléluia! Alléluia!\nAlléluia! Alléluia!', isChorus: true },
        { number: 2, text: 'Tu es digne de recevoir la gloire,\nL\'honneur et la puissance,\nCar tu as créé toutes choses,\nEt par ta volonté elles existent!' },
      ],
      key: 'Ré majeur',
      tempo: 'Modéré',
      tags: ['louange', 'adoration', 'gloire'],
      isFavorite: false,
    },
    {
      id: '5',
      number: 156,
      title: 'Jésus revient',
      author: 'Inconnu',
      category: 'praise',
      verses: [
        { number: 1, text: 'Jésus revient, Jésus revient,\nBientôt il va revenir!\nNul ne connaît le jour ni l\'heure,\nMais il revient bientôt!' },
        { number: 0, text: 'Maranatha! Maranatha!\nOui, reviens Seigneur Jésus!\nMaranatha! Maranatha!\nViens, nous t\'attendons!', isChorus: true },
        { number: 2, text: 'Les signes sont là qui annoncent\nSon glorieux retour!\nPréparons nos cœurs, soyons prêts,\nCar il revient bientôt!' },
      ],
      key: 'Mi majeur',
      tempo: 'Joyeux',
      tags: ['retour', 'espérance', 'attente'],
      isFavorite: false,
    },
    {
      id: '6',
      number: 200,
      title: 'Jésus est au milieu de nous',
      author: 'Inconnu',
      category: 'worship',
      verses: [
        { number: 1, text: 'Jésus est au milieu de nous,\nAssemblés en son nom.\nJésus est au milieu de nous,\nPour prier le Père.' },
        { number: 2, text: 'Il est là présent parmi nous,\nPar son Esprit Saint.\nIl est là présent parmi nous,\nPour nous bénir.' },
      ],
      key: 'Do majeur',
      tempo: 'Calme',
      tags: ['présence', 'assemblée', 'prière'],
      isFavorite: true,
    },
    {
      id: '7',
      number: 250,
      title: 'Nzambe Monene',
      author: 'Moïse Mbiye',
      category: 'worship',
      verses: [
        { number: 1, text: 'Nzambe Monene, Nzambe ya nguya\nOzali Yawe, ozali Yawe\nOzali Nzambe oyo asalaka makambo ya kokamwa\nMoto moko te azali lokola yo!' },
        { number: 0, text: 'Nzambe Monene! Nzambe ya nguya!\nMoto moko te azali lokola yo!\nNzambe Monene! Nzambe ya nguya!', isChorus: true },
        { number: 2, text: 'Na nkombo na yo Yesu Klisto\nMabele esili kogumba na mboka\nMaladi esili koleka\nBanganga nyonso basili kokweya!' },
      ],
      key: 'Ré majeur',
      tempo: 'Modéré',
      tags: ['louange', 'lingala', 'adoration'],
      isFavorite: true,
    },
    {
      id: '8',
      number: 275,
      title: 'Yesu Azali Awa',
      author: 'Chorale MyChurchApp',
      category: 'worship',
      verses: [
        { number: 1, text: 'Yesu azali awa, Yesu azali awa\nNa kati na biso, Yesu azali awa\nWa na lopango na biso\nYesu azali awa!' },
        { number: 0, text: 'Yesu! Yesu! Yesu azali awa!\nMokeli mobimba azali awa!', isChorus: true },
        { number: 2, text: 'Tobondeli Ye, tobondeli Ye\nNa motema mobimba, tobondeli Ye\nApesi biso nguya\nPona koloba nkombo na Ye!' },
      ],
      key: 'Sol majeur',
      tempo: 'Joyeux',
      tags: ['louange', 'lingala', 'présence'],
      isFavorite: false,
    },
    {
      id: '9',
      number: 300,
      title: 'Bolingo ya Nzambe',
      author: 'Mike Kalambay',
      category: 'praise',
      verses: [
        { number: 1, text: 'Bolingo ya Nzambe ezali monene\nEleki makambo nyonso\nBolingo oyo epesaki Yesu\nPona kobikisa biso!' },
        { number: 0, text: 'Natosi bolingo na Yo!\nNatosi bolingo na Yo Tata!\nBolingo oyo elongoli masumu\nBolingo oyo epesi biso bomoi!', isChorus: true },
        { number: 2, text: 'Na esengo natomboli maboko\nNapesi Ye gloire\nNzambe abikisa biso!\nAlleluia! Amen!' },
      ],
      key: 'La majeur',
      tempo: 'Lent',
      tags: ['adoration', 'lingala', 'amour'],
      isFavorite: true,
    },
    {
      id: '10',
      number: 325,
      title: 'Tala Ngai Nazali',
      author: 'Dena Mwana',
      category: 'praise',
      verses: [
        { number: 1, text: 'Tala ngai nazali awa\nOyo alingaka yo\nNa motema mobimba\nNapesi yo lokumu!' },
        { number: 0, text: 'Yesu! Yesu! Yesu!\nNkombo oyo eleki nkombo nyonso!\nYesu! Yesu! Yesu!\nMokonzi ya bakonzi!', isChorus: true },
        { number: 2, text: 'Na nguya na yo Nzambe\nTobikisami na masumu\nTosangani awa lelo\nPona kosambela Yo!' },
      ],
      key: 'Mi majeur',
      tempo: 'Modéré',
      tags: ['adoration', 'lingala', 'louange'],
      isFavorite: false,
    },
  ];

  useEffect(() => {
    fetchSongs();
    const storedFavorites = localStorage.getItem('songbook_favorites');
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    const storedRecent = localStorage.getItem('songbook_recent');
    if (storedRecent) setRecentlyViewed(JSON.parse(storedRecent));
  }, []);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/songbook-proxy', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSongs(data.hymns || mockSongs);
      } else {
        setSongs(mockSongs);
      }
    } catch {
      setSongs(mockSongs);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (songId: string) => {
    const newFavorites = favorites.includes(songId)
      ? favorites.filter(id => id !== songId)
      : [...favorites, songId];
    setFavorites(newFavorites);
    localStorage.setItem('songbook_favorites', JSON.stringify(newFavorites));
  };

  const openSong = (song: Song) => {
    setSelectedSong(song);
    setShowSongModal(true);
    const newRecent = [song.id, ...recentlyViewed.filter(id => id !== song.id)].slice(0, 10);
    setRecentlyViewed(newRecent);
    localStorage.setItem('songbook_recent', JSON.stringify(newRecent));
  };

  const copyLyrics = () => {
    if (!selectedSong) return;
    const text = selectedSong.verses.map(v => 
      `${v.isChorus ? 'Refrain:\n' : v.number > 0 ? `${v.number}.\n` : ''}${v.text}`
    ).join('\n\n');
    navigator.clipboard.writeText(`${selectedSong.title}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSongs = songs.filter(s => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchNumber = s.number.toString() === search;
      const matchTitle = s.title.toLowerCase().includes(searchLower);
      const matchAuthor = s.author?.toLowerCase().includes(searchLower);
      const matchTags = s.tags.some(t => t.toLowerCase().includes(searchLower));
      const matchLyrics = s.verses.some(v => v.text.toLowerCase().includes(searchLower));
      if (!matchNumber && !matchTitle && !matchAuthor && !matchTags && !matchLyrics) return false;
    }
    if (selectedCategory && s.category !== selectedCategory) return false;
    return true;
  });

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    if (sortBy === 'number') return a.number - b.number;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'recent') {
      const aIndex = recentlyViewed.indexOf(a.id);
      const bIndex = recentlyViewed.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }
    return 0;
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
          <h1 className="text-2xl font-bold text-gray-900">Recueil de chants</h1>
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
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Recueil de chants</h1>
        <p className="text-gray-600 mt-2">
          Cantiques et chants de louange
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{songs.length}</p>
          <p className="text-sm text-gray-500">Chants</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-red-600">{favorites.length}</p>
          <p className="text-sm text-gray-500">Favoris</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{categories.length}</p>
          <p className="text-sm text-gray-500">Catégories</p>
        </div>
      </div>

      {/* Quick Access */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Favoris</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {songs.filter(s => favorites.includes(s.id)).slice(0, 5).map(song => (
              <button
                key={song.id}
                onClick={() => openSong(song)}
                className="flex items-center gap-2 px-3 py-2 bg-[#fff3cc] text-[#cc9b00] rounded-lg whitespace-nowrap hover:bg-[#ffda66]"
              >
                <span className="font-medium">#{song.number}</span>
                <span className="text-sm truncate max-w-[120px]">{song.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, titre, paroles..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            <Grid className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Trier par:</span>
        {[
          { id: 'number', label: 'Numéro' },
          { id: 'title', label: 'Titre' },
          { id: 'recent', label: 'Récents' },
        ].map(option => (
          <button
            key={option.id}
            onClick={() => setSortBy(option.id as typeof sortBy)}
            className={`px-3 py-1 rounded-full text-sm ${
              sortBy === option.id
                ? 'bg-[#ffc200] text-[#0a0a0a]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
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

      {/* Songs */}
      {sortedSongs.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun chant trouvé</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {sortedSongs.map(song => (
            <div
              key={song.id}
              onClick={() => openSong(song)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-[#fff3cc] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-[#cc9b00]">{song.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{song.title}</h3>
                <p className="text-sm text-gray-500 truncate">
                  {song.author && `${song.author} • `}
                  {getCategoryInfo(song.category).label}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(song.id);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Heart className={`h-5 w-5 ${favorites.includes(song.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sortedSongs.map(song => (
            <div
              key={song.id}
              onClick={() => openSong(song)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-[#fff3cc] to-[#fff3cc] flex items-center justify-center relative">
                <span className="text-4xl font-bold text-[#e6af00]">{song.number}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(song.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 truncate">{song.title}</h3>
                <p className="text-sm text-gray-500 truncate">{song.author || 'Auteur inconnu'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Song Modal */}
      {showSongModal && selectedSong && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fff3cc] rounded-lg flex items-center justify-center">
                  <span className="font-bold text-[#cc9b00]">{selectedSong.number}</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{selectedSong.title}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedSong.author && `${selectedSong.author}`}
                    {selectedSong.composer && ` • Musique: ${selectedSong.composer}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSongModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(selectedSong.id)}
                className={`p-2 rounded-lg ${favorites.includes(selectedSong.id) ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <Heart className={`h-5 w-5 ${favorites.includes(selectedSong.id) ? 'fill-current' : ''}`} />
              </button>
              <button onClick={copyLyrics} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <Printer className="h-5 w-5" />
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-1.5 hover:bg-white rounded">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm text-gray-600">{fontSize}px</span>
                <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-1.5 hover:bg-white rounded">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lyrics */}
            <div className="flex-1 overflow-y-auto p-6" style={{ fontSize: `${fontSize}px` }}>
              <div className="space-y-6">
                {selectedSong.verses.map((verse, index) => (
                  <div key={index} className={verse.isChorus ? 'pl-4 border-l-4 border-[#e6af00] italic' : ''}>
                    {verse.isChorus ? (
                      <p className="text-[#cc9b00] font-semibold mb-2">Refrain :</p>
                    ) : verse.number > 0 ? (
                      <p className="text-gray-400 font-semibold mb-2">{verse.number}.</p>
                    ) : null}
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">{verse.text}</p>
                  </div>
                ))}
              </div>

              {/* Song Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedSong.key && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm inline-flex items-center gap-1">
                      <Keyboard className="h-3.5 w-3.5" /> {selectedSong.key}
                    </span>
                  )}
                  {selectedSong.tempo && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm inline-flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" /> {selectedSong.tempo}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-[#fff3cc] text-[#cc9b00] rounded-full text-sm inline-flex items-center gap-1">
                    {(() => { const CatIcon = getCategoryInfo(selectedSong.category).icon; return <CatIcon className="h-3.5 w-3.5" />; })()} {getCategoryInfo(selectedSong.category).label}
                  </span>
                </div>
                {selectedSong.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedSong.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

