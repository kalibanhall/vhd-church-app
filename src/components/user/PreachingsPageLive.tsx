/**
 * Page Prédications avec Streaming Vidéo en Direct
 * Design uniforme professionnel avec thème purple/indigo
 * Supporte: Vidéos enregistrées, Audio, Streaming LIVE (WebRTC/HLS)
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Video, Play, Pause, Calendar, Clock, User, Eye, Download, Volume2, Search, Filter, 
  Radio, FileText, X, Maximize, Minimize, Loader2, ChevronRight, RefreshCw, BookOpen
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/auth-fetch';
import { safeFormatDate } from '@/lib/utils';

interface Sermon {
  id: string;
  title: string;
  description?: string;
  pastor_name?: string;
  sermon_date: string;
  duration?: number;
  media_type: 'VIDEO' | 'AUDIO' | 'LIVE' | 'TEXT';
  media_url?: string;
  thumbnail_url?: string;
  view_count?: number;
  is_published: boolean;
  bible_verses?: string;
  event?: {
    id: string;
    title: string;
    is_live: boolean;
    stream_url?: string;
  };
}

export default function PreachingsPageLive() {
  // États
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [playingSermon, setPlayingSermon] = useState<Sermon | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Référence pour le lecteur vidéo
  const videoRef = useRef<HTMLVideoElement>(null);

  // Charger les prédications
  useEffect(() => {
    fetchSermons();
  }, []);

  // Filtrer les prédications
  useEffect(() => {
    let filtered = sermons;

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(s => s.media_type === selectedType);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.pastor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSermons(filtered);
  }, [sermons, selectedType, searchTerm]);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch('/api/sermons-proxy');

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.sermons) {
        setSermons(data.sermons);
      } else {
        setSermons([]);
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement prédications:', err);
      setError(err.message);
      setSermons([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (sermon: Sermon) => {
    setPlayingSermon(sermon);
    setIsFullscreen(false);
  };

  const handleClose = () => {
    setPlayingSermon(null);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'AUDIO': return <Volume2 className="h-4 w-4" />;
      case 'LIVE': return <Radio className="h-4 w-4 animate-pulse text-red-500" />;
      case 'TEXT': return <FileText className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getMediaBadgeColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-[#fff3cc] text-[#cc9b00]';
      case 'AUDIO': return 'bg-[#fff3cc] text-[#cc9b00]';
      case 'LIVE': return 'bg-red-100 text-red-700';
      case 'TEXT': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Stats calculées
  const videoCount = filteredSermons.filter(s => s.media_type === 'VIDEO').length;
  const audioCount = filteredSermons.filter(s => s.media_type === 'AUDIO').length;
  const liveCount = filteredSermons.filter(s => s.media_type === 'LIVE').length;
  const totalViews = filteredSermons.reduce((acc, s) => acc + (s.view_count || 0), 0);

  // LOADING SKELETON - Pattern uniforme obligatoire
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Prédications</h1>
          <p className="text-gray-600 mt-2">Chargement des prédications...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-32 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fffefa] via-[#fff3cc] to-[#fffefa]">
        <div className="max-w-6xl mx-auto p-4 pb-24">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchSermons}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ffc200] to-[#cc9b00] text-[#0a0a0a] rounded-xl font-medium hover:from-[#e6af00] hover:to-[#cc9b00] transition-all shadow-lg"
            >
              <RefreshCw className="h-5 w-5" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DESIGN PRINCIPAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffefa] via-[#fff3cc] to-[#fffefa]">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-[#ffc200] via-[#e6af00] to-[#cc9b00] text-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Prédications</h1>
            <p className="text-[#3d3200] text-sm">Retrouvez tous les enseignements et prédications</p>
            <p className="text-[#5c4d00] text-xs mt-1">
              {sermons.length} prédication{sermons.length > 1 ? 's' : ''} disponible{sermons.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 pb-24 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-[#cc9b00]">{videoCount}</p>
            <p className="text-xs text-gray-600">Vidéos</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-[#cc9b00]">{audioCount}</p>
            <p className="text-xs text-gray-600">Audio</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-red-600">{liveCount}</p>
            <p className="text-xs text-gray-600">En direct</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-[#e6af00]">{totalViews}</p>
            <p className="text-xs text-gray-600">Vues</p>
          </div>
        </div>

        {/* Filters - Design uniforme */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une prédication, un pasteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedType === 'all'
                    ? 'bg-[#ffc200] text-[#0a0a0a] shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedType('LIVE')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedType === 'LIVE'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <Radio className="h-4 w-4" />
                En direct
              </button>
              <button
                onClick={() => setSelectedType('VIDEO')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedType === 'VIDEO'
                    ? 'bg-[#ffc200] text-[#0a0a0a] shadow-md'
                    : 'bg-[#fff3cc] text-[#cc9b00] hover:bg-[#ffda66]'
                }`}
              >
                <Video className="h-4 w-4" />
                Vidéos
              </button>
              <button
                onClick={() => setSelectedType('AUDIO')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedType === 'AUDIO'
                    ? 'bg-[#ffc200] text-[#0a0a0a] shadow-church'
                    : 'bg-[#fff3cc] text-[#cc9b00] hover:bg-[#ffda66]'
                }`}
              >
                <Volume2 className="h-4 w-4" />
                Audio
              </button>
              <button
                onClick={() => setSelectedType('TEXT')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedType === 'TEXT'
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                Texte
              </button>
            </div>
          </div>
        </div>

        {/* Prédications en LIVE (priorité) */}
        {filteredSermons.filter(s => s.media_type === 'LIVE' && s.event?.is_live).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="h-5 w-5 text-red-500 animate-pulse" />
              <h2 className="text-lg font-bold text-red-600">En Direct Maintenant</h2>
            </div>
            <div className="space-y-3">
              {filteredSermons
                .filter(s => s.media_type === 'LIVE' && s.event?.is_live)
                .map(sermon => (
                  <div
                    key={sermon.id}
                    onClick={() => handlePlay(sermon)}
                    className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg border-2 border-red-400 overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        {sermon.thumbnail_url ? (
                          <img 
                            src={sermon.thumbnail_url} 
                            alt={sermon.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Radio className="h-8 w-8 text-white animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-white text-red-600 rounded-full text-xs font-bold animate-pulse">
                            🔴 EN DIRECT
                          </span>
                        </div>
                        <h3 className="font-bold text-lg truncate">{sermon.title}</h3>
                        {sermon.pastor_name && (
                          <p className="text-red-100 text-sm flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {sermon.pastor_name}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                          <Play className="h-6 w-6 text-red-600 fill-current ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Liste des prédications - Cards uniformes */}
        {filteredSermons.filter(s => s.media_type !== 'LIVE' || !s.event?.is_live).length > 0 ? (
          <div className="space-y-3">
            {filteredSermons
              .filter(s => s.media_type !== 'LIVE' || !s.event?.is_live)
              .map(sermon => (
                <div 
                  key={sermon.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div 
                        className="relative w-28 h-20 rounded-xl bg-gradient-to-br from-[#ffc200] to-[#cc9b00] flex-shrink-0 overflow-hidden cursor-pointer group"
                        onClick={() => (sermon.media_url || sermon.event?.stream_url) && handlePlay(sermon)}
                      >
                        {sermon.thumbnail_url ? (
                          <img 
                            src={sermon.thumbnail_url} 
                            alt={sermon.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {sermon.media_type === 'AUDIO' ? (
                              <Volume2 className="h-8 w-8 text-white/70" />
                            ) : sermon.media_type === 'TEXT' ? (
                              <FileText className="h-8 w-8 text-white/70" />
                            ) : (
                              <Video className="h-8 w-8 text-white/70" />
                            )}
                          </div>
                        )}
                        
                        {/* Play overlay */}
                        {(sermon.media_url || sermon.event?.stream_url) && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                              <Play className="h-5 w-5 text-[#cc9b00] fill-current ml-0.5" />
                            </div>
                          </div>
                        )}

                        {/* Duration badge */}
                        {sermon.duration && (
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs">
                            {formatDuration(sermon.duration)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                            {sermon.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ${getMediaBadgeColor(sermon.media_type)}`}>
                            {getMediaIcon(sermon.media_type)}
                            {sermon.media_type}
                          </span>
                        </div>

                        {sermon.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                            {sermon.description}
                          </p>
                        )}

                        {/* Métadonnées */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {sermon.pastor_name && sermon.pastor_name.trim() !== '' && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-[#cc9b00]" />
                              <span>{sermon.pastor_name}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#e6af00]" />
                            <span>{safeFormatDate(sermon.sermon_date, 'Date non disponible')}</span>
                          </div>

                          {sermon.view_count !== undefined && sermon.view_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-[#cc9b00]" />
                              <span>{sermon.view_count} vue{sermon.view_count > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>

                        {/* Versets bibliques */}
                        {sermon.bible_verses && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-[#cc9b00]">
                            <BookOpen className="h-3 w-3" />
                            <span className="font-medium">{sermon.bible_verses}</span>
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      {(sermon.media_url || sermon.event?.stream_url) && (
                        <button
                          onClick={() => handlePlay(sermon)}
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#ffc200] to-[#cc9b00] flex items-center justify-center text-[#0a0a0a] hover:from-[#e6af00] hover:to-[#cc9b00] transition-all shadow-md hover:shadow-lg"
                        >
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune prédication trouvée</h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchTerm || selectedType !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les prédications seront bientôt disponibles'}
            </p>
            {(searchTerm || selectedType !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedType('all'); }}
                className="text-[#cc9b00] text-sm font-medium hover:text-[#e6af00]"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Modal lecteur média */}
      {playingSermon && (
        <MediaPlayer
          sermon={playingSermon}
          onClose={handleClose}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          videoRef={videoRef}
        />
      )}
    </div>
  );
}

// Composant lecteur média avec design amélioré
interface MediaPlayerProps {
  sermon: Sermon;
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

function MediaPlayer({ sermon, onClose, isFullscreen, onToggleFullscreen, videoRef }: MediaPlayerProps) {
  const mediaUrl = sermon.event?.stream_url || sermon.media_url;
  const isLive = sermon.media_type === 'LIVE' && sermon.event?.is_live;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full'}`}>
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#fff3cc] to-[#fffefa]">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-gray-900 truncate">{sermon.title}</h2>
            {isLive && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                <Radio className="h-3 w-3 animate-pulse" />
                EN DIRECT
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFullscreen}
              className="p-2 hover:bg-white rounded-xl transition-colors"
              title="Plein écran"
            >
              {isFullscreen ? <Minimize className="h-5 w-5 text-gray-600" /> : <Maximize className="h-5 w-5 text-gray-600" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-xl transition-colors"
              title="Fermer"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Lecteur */}
        <div className="bg-black">
          {sermon.media_type === 'VIDEO' || sermon.media_type === 'LIVE' ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              controls
              autoPlay
              className="w-full"
              style={{ maxHeight: isFullscreen ? '100vh' : '65vh' }}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          ) : sermon.media_type === 'AUDIO' ? (
            <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#cc9b00] to-[#e6af00]">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
                <Volume2 className="h-12 w-12 text-white" />
              </div>
              <audio
                src={mediaUrl}
                controls
                autoPlay
                className="w-full max-w-xl"
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          ) : (
            <div className="p-8 text-white bg-gradient-to-br from-gray-800 to-gray-900">
              <p className="text-center">Format non supporté</p>
            </div>
          )}
        </div>

        {/* Informations */}
        {!isFullscreen && (
          <div className="p-4 space-y-3 bg-gray-50">
            {sermon.description && (
              <p className="text-gray-700 text-sm">{sermon.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {sermon.pastor_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#cc9b00]" />
                  <span>{sermon.pastor_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#e6af00]" />
                <span>{safeFormatDate(sermon.sermon_date, 'Date non disponible')}</span>
              </div>
              {sermon.view_count !== undefined && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#cc9b00]" />
                  <span>{sermon.view_count} vues</span>
                </div>
              )}
            </div>

            {sermon.bible_verses && (
              <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#cc9b00]" />
                <p className="text-[#cc9b00] font-medium text-sm">
                  {sermon.bible_verses}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
