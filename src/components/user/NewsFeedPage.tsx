/**
 * NewsFeedPage - Fil d'actualite
 * Affiche les dernieres actualites et annonces de l'eglise
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
    { id: 'event', label: 'Evenements', icon: Calendar },
    { id: 'testimony', label: 'Temoignages', icon: Heart },
    { id: 'media', label: 'Medias', icon: Video },
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
        setPosts(data.posts || []);
      } else {
        console.warn('[NewsFeed] Backend indisponible, status:', response.status);
        setPosts([]);
      }
    } catch (error) {
      console.error('[NewsFeed] Erreur chargement fil d\'actualite:', error);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
      console.error('[NewsFeed] Erreur like:', error);
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
        console.error('[NewsFeed] Erreur partage:', error);
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
      case 'announcement': return 'bg-[#fff3cc] text-[#cc9b00]';
      case 'event': return 'bg-[#fff3cc] text-[#cc9b00]';
      case 'testimony': return 'bg-[#fff3cc] text-[#cc9b00]';
      case 'media': return 'bg-orange-100 text-orange-600';
      default: return 'bg-[#fff3cc] text-[#666]';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'A l\'instant';
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
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Fil d'actualite</h1>
          <p className="text-[#666] mt-2">Chargement...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-church animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#fff3cc] rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[#fff3cc] rounded w-3/4" />
                  <div className="h-4 bg-[#fff3cc] rounded w-1/2" />
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
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Fil d'actualite</h1>
          <p className="text-[#666]">Restez connecte avec votre eglise</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-[#fff3cc] text-[#cc9b00] rounded-full hover:bg-[#ffda66] transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#999]" />
        <input
          type="text"
          placeholder="Rechercher dans les actualites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
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
                  ? 'bg-[#ffc200] text-white'
                  : 'bg-[#fff3cc] text-[#666] hover:bg-[#ffda66]'
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
              className={`bg-white rounded-2xl shadow-church border border-[rgba(201,201,201,0.3)] overflow-hidden ${
                post.isPinned ? 'ring-2 ring-[#ffc200]' : ''
              }`}
            >
              {/* Post Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffc200] via-[#ffda66] to-[#fff3cc] flex items-center justify-center text-white font-semibold">
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0a0a0a]">{post.author.name}</p>
                      <div className="flex items-center gap-2 text-sm text-[#999]">
                        {post.author.role && (
                          <span className="text-[#cc9b00]">{post.author.role}</span>
                        )}
                        <span>-</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="px-2 py-1 bg-[#fff3cc] text-[#cc9b00] text-xs rounded-full">
                        Epingle
                      </span>
                    )}
                    <span className={`p-1.5 rounded-full ${getTypeColor(post.type)}`}>
                      <TypeIcon className="h-4 w-4" />
                    </span>
                    <button className="p-2 hover:bg-[#fff3cc] rounded-full">
                      <MoreHorizontal className="h-5 w-5 text-[#999]" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <h2 className="text-lg font-semibold text-[#0a0a0a] mb-2">{post.title}</h2>
                <p className="text-[#666] leading-relaxed">{post.content}</p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#fff3cc] text-[#666] text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Event Date */}
                {post.eventDate && (
                  <div className="mt-3 p-3 bg-[#fff3cc] rounded-xl flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#cc9b00]" />
                    <span className="text-[#cc9b00] font-medium">
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
                    <div className="aspect-video bg-[#fff3cc] flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-[#999]" />
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
              <div className="px-4 py-2 border-t border-[rgba(201,201,201,0.3)] flex items-center justify-between text-sm text-[#999]">
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
              <div className="px-4 py-3 border-t border-[rgba(201,201,201,0.3)] flex items-center justify-around">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    post.isLiked
                      ? 'text-red-500 bg-red-50'
                      : 'text-[#666] hover:bg-[#fff3cc]'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">J'aime</span>
                </button>
                <button
                  onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#666] hover:bg-[#fff3cc] transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="hidden sm:inline">Commenter</span>
                </button>
                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#666] hover:bg-[#fff3cc] transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Partager</span>
                </button>
                <button
                  onClick={() => handleSave(post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    post.isSaved
                      ? 'text-[#cc9b00] bg-[#fff3cc]'
                      : 'text-[#666] hover:bg-[#fff3cc]'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${post.isSaved ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">Sauvegarder</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments === post.id && (
                <div className="px-4 py-3 border-t border-[rgba(201,201,201,0.3)] bg-[#fffefa]">
                  {/* Comment Input */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#ffc200] flex items-center justify-center text-white text-sm font-semibold">
                      M
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ecrire un commentaire..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        className="flex-1 px-4 py-2 border border-[rgba(201,201,201,0.3)] rounded-full focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!newComment.trim()}
                        className="p-2 bg-[#ffc200] text-white rounded-full hover:bg-[#cc9b00] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {(comments[post.id] || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#fff3cc] flex items-center justify-center text-[#666] text-sm font-semibold">
                          {comment.author.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white p-3 rounded-2xl">
                            <p className="font-semibold text-sm text-[#0a0a0a]">{comment.author.name}</p>
                            <p className="text-[#666] text-sm">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-1 px-3 text-xs text-[#999]">
                            <button className="hover:text-[#cc9b00]">J'aime</button>
                            <button className="hover:text-[#cc9b00]">Repondre</button>
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!comments[post.id] || comments[post.id].length === 0) && (
                      <p className="text-center text-[#999] text-sm py-4">
                        Aucun commentaire. Soyez le premier a commenter !
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
          <Newspaper className="h-16 w-16 mx-auto text-[#999] mb-4" />
          <p className="text-[#999]">Aucune actualite trouvee</p>
        </div>
      )}
    </div>
  );
}
