/**
 * NewsFeedPage - Fil d'actualité
 * Affiche les dernières actualités et annonces de l'église
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Newspaper, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Calendar,
  Bell,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Send,
  ChevronDown,
  Clock,
  Eye,
  ThumbsUp,
  Users,
  Loader2
} from 'lucide-react';

interface NewsPost {
  id: string;
  type: 'announcement' | 'event' | 'testimony' | 'prayer' | 'media' | 'general';
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  media?: {
    type: 'image' | 'video' | 'gallery';
    urls: string[];
    thumbnail?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isSaved: boolean;
  isPinned: boolean;
  createdAt: string;
  eventDate?: string;
  tags?: string[];
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com';

export default function NewsFeedPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');

  const filters = [
    { id: 'all', label: 'Tout', icon: Newspaper },
    { id: 'announcement', label: 'Annonces', icon: Bell },
    { id: 'event', label: 'Événements', icon: Calendar },
    { id: 'testimony', label: 'Témoignages', icon: Heart },
    { id: 'media', label: 'Médias', icon: Video },
  ];

  const fetchPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/news-proxy?type=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || generateMockPosts());
      } else {
        setPosts(generateMockPosts());
      }
    } catch (error) {
      console.error('Erreur chargement fil d\'actualité:', error);
      setPosts(generateMockPosts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const generateMockPosts = (): NewsPost[] => [
    {
      id: '1',
      type: 'announcement',
      title: 'Culte spécial de louange ce dimanche',
      content: 'Rejoignez-nous ce dimanche pour un moment exceptionnel de louange et d\'adoration au Temple VHD de Kinshasa. Le pasteur Emmanuel Kasongo apportera un message spécial sur la puissance de la louange dans nos vies. N\'oubliez pas d\'inviter vos proches !',
      author: { id: '1', name: 'Pasteur Emmanuel Kasongo', role: 'Pasteur Principal', avatar: '' },
      likes: 256,
      comments: 48,
      shares: 67,
      views: 1245,
      isLiked: false,
      isSaved: false,
      isPinned: true,
      createdAt: new Date().toISOString(),
      tags: ['culte', 'louange', 'dimanche'],
    },
    {
      id: '2',
      type: 'event',
      title: 'Retraite spirituelle à Bukavu - Inscriptions ouvertes',
      content: 'La retraite annuelle de l\'église aura lieu du 15 au 17 février au bord du lac Kivu à Bukavu. C\'est un moment de ressourcement spirituel, de communion fraternelle et de rencontre avec Dieu. Places limitées !',
      author: { id: '2', name: 'Équipe Événements Goma', role: 'Coordination' },
      media: { type: 'image', urls: ['/images/retreat.jpg'] },
      likes: 189,
      comments: 52,
      shares: 38,
      views: 876,
      isLiked: true,
      isSaved: true,
      isPinned: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      eventDate: '2026-02-15',
      tags: ['retraite', 'spirituel', 'Bukavu'],
    },
    {
      id: '3',
      type: 'testimony',
      title: 'Témoignage de guérison miraculeuse',
      content: 'Gloire à Dieu ! Après 3 ans de maladie, notre sœur Marie Kasongo de Lubumbashi a été complètement guérie. Elle partage son témoignage de foi et de persévérance. Que toute la gloire revienne à notre Seigneur !',
      author: { id: '3', name: 'Marie Kasongo', role: 'Membre - Lubumbashi' },
      likes: 345,
      comments: 87,
      shares: 112,
      views: 1567,
      isLiked: false,
      isSaved: false,
      isPinned: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      tags: ['témoignage', 'guérison', 'miracle'],
    },
    {
      id: '4',
      type: 'media',
      title: 'Prédication du dimanche dernier disponible',
      content: 'La prédication "Marcher par la foi" du Pasteur Pierre Kalonda est maintenant disponible en ligne. Retrouvez ce message puissant sur notre plateforme.',
      author: { id: '1', name: 'Ministère Média Kinshasa', role: 'Communication' },
      media: { type: 'video', urls: ['/videos/sermon.mp4'], thumbnail: '/images/sermon-thumb.jpg' },
      likes: 198,
      comments: 56,
      shares: 78,
      views: 2567,
      isLiked: true,
      isSaved: false,
      isPinned: false,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      tags: ['prédication', 'foi', 'vidéo'],
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleLike = async (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/news-feed/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const handleSave = async (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isSaved: !post.isSaved };
      }
      return post;
    }));
  };

  const handleShare = async (post: NewsPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.content.substring(0, 100),
          url: `${window.location.origin}/news/${post.id}`,
        });
      } catch (error) {
        console.error('Erreur partage:', error);
      }
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: { name: 'Moi' },
      content: newComment,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    setComments({
      ...comments,
      [postId]: [...(comments[postId] || []), comment],
    });
    setNewComment('');

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: post.comments + 1 };
      }
      return post;
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return Bell;
      case 'event': return Calendar;
      case 'testimony': return Heart;
      case 'media': return Video;
      default: return Newspaper;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-600';
      case 'event': return 'bg-green-100 text-green-600';
      case 'testimony': return 'bg-purple-100 text-purple-600';
      case 'media': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredPosts = posts.filter(post => {
    if (filter !== 'all' && post.type !== filter) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(search) ||
        post.content.toLowerCase().includes(search) ||
        post.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Fil d'actualité</h1>
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
    <div className="max-w-3xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fil d'actualité</h1>
          <p className="text-gray-600">Restez connecté avec votre église</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher dans les actualités..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {filters.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {filteredPosts.map((post) => {
          const TypeIcon = getTypeIcon(post.type);
          return (
            <article
              key={post.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${
                post.isPinned ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Post Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{post.author.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {post.author.role && (
                          <span className="text-blue-600">{post.author.role}</span>
                        )}
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        Épinglé
                      </span>
                    )}
                    <span className={`p-1.5 rounded-full ${getTypeColor(post.type)}`}>
                      <TypeIcon className="h-4 w-4" />
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-700 leading-relaxed">{post.content}</p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Event Date */}
                {post.eventDate && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium">
                      {new Date(post.eventDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Media */}
              {post.media && (
                <div className="relative">
                  {post.media.type === 'image' && (
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {post.media.type === 'video' && (
                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                      <button className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <Video className="h-8 w-8 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {post.likes}
                  </span>
                  <span>{post.comments} commentaires</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views} vues
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-around">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    post.isLiked
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">J'aime</span>
                </button>
                <button
                  onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="hidden sm:inline">Commenter</span>
                </button>
                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Partager</span>
                </button>
                <button
                  onClick={() => handleSave(post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    post.isSaved
                      ? 'text-blue-500 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${post.isSaved ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">Sauvegarder</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments === post.id && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  {/* Comment Input */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      M
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Écrire un commentaire..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!newComment.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {(comments[post.id] || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold">
                          {comment.author.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white p-3 rounded-2xl">
                            <p className="font-semibold text-sm text-gray-900">{comment.author.name}</p>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-1 px-3 text-xs text-gray-500">
                            <button className="hover:text-blue-600">J'aime</button>
                            <button className="hover:text-blue-600">Répondre</button>
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!comments[post.id] || comments[post.id].length === 0) && (
                      <p className="text-center text-gray-500 text-sm py-4">
                        Aucun commentaire. Soyez le premier à commenter !
                      </p>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucune actualité trouvée</p>
        </div>
      )}
    </div>
  );
}
