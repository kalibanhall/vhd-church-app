/**
 * MutualHelpPage - S'entraider
 * Page de réseau d'entraide entre membres de l'église
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  HeartHandshake,
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Check,
  X,
  Heart,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  Utensils,
  ShoppingCart,
  Wrench,
  Baby,
  ChevronRight,
  Send,
  Eye,
  Loader2
} from 'lucide-react';

interface HelpRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  category: string;
  title: string;
  description: string;
  type: 'offer' | 'need';
  location?: string;
  urgent: boolean;
  date: string;
  responses: number;
  status: 'open' | 'in_progress' | 'completed';
}

export default function MutualHelpPage() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'needs' | 'offers' | 'mine'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [newRequest, setNewRequest] = useState({
    type: 'need' as 'offer' | 'need',
    category: '',
    title: '',
    description: '',
    location: '',
    urgent: false,
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'housing', label: 'Logement', icon: Home },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'education', label: 'Éducation', icon: GraduationCap },
    { id: 'job', label: 'Emploi', icon: Briefcase },
    { id: 'food', label: 'Alimentation', icon: Utensils },
    { id: 'shopping', label: 'Courses', icon: ShoppingCart },
    { id: 'repair', label: 'Réparations', icon: Wrench },
    { id: 'childcare', label: 'Garde d\'enfants', icon: Baby },
    { id: 'other', label: 'Autre', icon: HeartHandshake },
  ];

  const mockRequests: HelpRequest[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Marie Kasongo',
      category: 'transport',
      title: 'Covoiturage pour rendez-vous médical',
      description: 'Je cherche quelqu\'un pour m\'accompagner à la clinique Ngaliema jeudi matin à 9h. Je n\'ai pas de voiture.',
      type: 'need',
      location: 'Kinshasa - Gombe',
      urgent: true,
      date: '2025-01-15',
      responses: 3,
      status: 'open',
    },
    {
      id: '2',
      userId: '2',
      userName: 'Jean-Pierre Mwamba',
      category: 'repair',
      title: 'Proposition de dépannage plomberie',
      description: 'Je suis plombier de métier et je peux vous dépanner gratuitement pour des petits travaux de plomberie.',
      type: 'offer',
      location: 'Kinshasa - Limete',
      urgent: false,
      date: '2025-01-14',
      responses: 8,
      status: 'open',
    },
    {
      id: '3',
      userId: '3',
      userName: 'Sophie Lukusa',
      category: 'childcare',
      title: 'Besoin d\'aide pour garder mes enfants samedi',
      description: 'J\'ai un imprévu et j\'aurais besoin de quelqu\'un pour garder mes 2 enfants (5 et 8 ans) samedi après-midi.',
      type: 'need',
      location: 'Lubumbashi - Commune Kenya',
      urgent: true,
      date: '2025-01-16',
      responses: 2,
      status: 'in_progress',
    },
    {
      id: '4',
      userId: '4',
      userName: 'Pasteur Pierre Kalonda',
      category: 'education',
      title: 'Cours particuliers de maths gratuits',
      description: 'Prof de maths à la retraite, je propose des cours gratuits pour les collégiens et lycéens de l\'église.',
      type: 'offer',
      location: 'Matadi / En ligne',
      urgent: false,
      date: '2025-01-10',
      responses: 12,
      status: 'open',
    },
    {
      id: '5',
      userId: '5',
      userName: 'Claire Mbombo',
      category: 'food',
      title: 'Partage de repas le dimanche',
      description: 'Je cuisine souvent en grande quantité. Si une famille a besoin, je peux partager mes repas du dimanche.',
      type: 'offer',
      location: 'Goma - Himbi',
      urgent: false,
      date: '2025-01-12',
      responses: 5,
      status: 'open',
    },
  ];

  useEffect(() => {
    fetchRequests();
  }, [activeTab, selectedCategory]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mutual-help-proxy?type=${activeTab}&category=${selectedCategory}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data.posts || mockRequests);
      } else {
        setRequests(mockRequests);
      }
    } catch {
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/mutual-help-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRequest),
      });
      setShowCreateModal(false);
      setNewRequest({ type: 'need', category: '', title: '', description: '', location: '', urgent: false });
      fetchRequests();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleRespond = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/mutual-help-proxy', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ requestId, action: 'respond' }),
      });
      setShowDetailModal(false);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory && r.category !== selectedCategory) return false;
    if (activeTab === 'needs' && r.type !== 'need') return false;
    if (activeTab === 'offers' && r.type !== 'offer') return false;
    return true;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">S'entraider</h1>
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
          <HeartHandshake className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">S'entraider</h1>
        <p className="text-gray-600 mt-2">
          Proposez votre aide ou demandez un coup de main à la communauté
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{requests.filter(r => r.type === 'offer').length}</p>
          <p className="text-sm text-gray-500">Offres d'aide</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{requests.filter(r => r.type === 'need').length}</p>
          <p className="text-sm text-gray-500">Demandes</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{requests.filter(r => r.status === 'completed').length}</p>
          <p className="text-sm text-gray-500">Résolues</p>
        </div>
      </div>

      {/* Search & Create */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Publier</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Tout' },
          { id: 'needs', label: 'Besoins' },
          { id: 'offers', label: 'Offres' },
          { id: 'mine', label: 'Mes annonces' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#ffc200] text-[#0a0a0a]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Toutes catégories
        </button>
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <HeartHandshake className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune annonce pour le moment</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00]"
            >
              Soyez le premier à publier
            </button>
          </div>
        ) : (
          filteredRequests.map(request => {
            const CategoryIcon = getCategoryInfo(request.category).icon;
            return (
              <div
                key={request.id}
                onClick={() => {
                  setSelectedRequest(request);
                  setShowDetailModal(true);
                }}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${request.type === 'offer' ? 'bg-[#fff3cc]' : 'bg-[#fff3cc]'}`}>
                    <CategoryIcon className={`h-6 w-6 ${request.type === 'offer' ? 'text-[#cc9b00]' : 'text-[#cc9b00]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            request.type === 'offer' 
                              ? 'bg-[#fff3cc] text-[#5c4d00]' 
                              : 'bg-[#fff3cc] text-[#cc9b00]'
                          }`}>
                            {request.type === 'offer' ? 'Offre' : 'Besoin'}
                          </span>
                          {request.urgent && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Urgent
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {getCategoryInfo(request.category).label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-1">{request.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{request.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {request.userName}
                      </span>
                      {request.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {request.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {request.responses} réponses
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Nouvelle annonce</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewRequest({ ...newRequest, type: 'need' })}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    newRequest.type === 'need'
                      ? 'border-[#ffc200] bg-[#fff3cc]'
                      : 'border-gray-200 hover:border-[#ffda66]'
                  }`}
                >
                  <Heart className="h-6 w-6 text-[#cc9b00] mx-auto mb-2" />
                  <p className="font-medium text-gray-900">J'ai besoin d'aide</p>
                </button>
                <button
                  onClick={() => setNewRequest({ ...newRequest, type: 'offer' })}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    newRequest.type === 'offer'
                      ? 'border-[#ffc200] bg-[#fff3cc]'
                      : 'border-gray-200 hover:border-[#ffda66]'
                  }`}
                >
                  <HeartHandshake className="h-6 w-6 text-[#cc9b00] mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Je propose mon aide</p>
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setNewRequest({ ...newRequest, category: cat.id })}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          newRequest.category === cat.id
                            ? 'border-gray-900 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                        <p className="text-xs text-gray-700">{cat.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Ex: Besoin d'aide pour déménager"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Décrivez votre besoin ou votre offre en détail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#ffc200]"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu (optionnel)</label>
                <input
                  type="text"
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                  placeholder="Ex: Gombe, Kinshasa"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
                />
              </div>

              {/* Urgent */}
              {newRequest.type === 'need' && (
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequest.urgent}
                    onChange={(e) => setNewRequest({ ...newRequest, urgent: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-red-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">C'est urgent</p>
                    <p className="text-sm text-gray-500">La demande sera mise en avant</p>
                  </div>
                </label>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateRequest}
                disabled={!newRequest.title || !newRequest.description || !newRequest.category}
                className="flex-1 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Publier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Détails de l'annonce</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedRequest.type === 'offer' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-[#fff3cc] text-[#cc9b00]'
                }`}>
                  {selectedRequest.type === 'offer' ? 'Offre d\'aide' : 'Demande d\'aide'}
                </span>
                {selectedRequest.urgent && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    Urgent
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  {getCategoryInfo(selectedRequest.category).label}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900">{selectedRequest.title}</h3>
              
              <p className="text-gray-600">{selectedRequest.description}</p>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedRequest.userName}</p>
                  <p className="text-sm text-gray-500">Publié le {new Date(selectedRequest.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {selectedRequest.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{selectedRequest.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="h-5 w-5" />
                <span>{selectedRequest.responses} personnes ont déjà répondu</span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => handleRespond(selectedRequest.id)}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                  selectedRequest.type === 'offer'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-[#ffc200] text-[#0a0a0a] hover:bg-[#cc9b00] shadow-church'
                }`}
              >
                <HeartHandshake className="h-5 w-5" />
                {selectedRequest.type === 'offer' ? 'Demander cette aide' : 'Proposer mon aide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
