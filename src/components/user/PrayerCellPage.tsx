/**
 * PrayerCellPage - Cellules de prière
 * Gestion des groupes et cellules de prière
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Heart, 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  ChevronRight,
  UserPlus,
  MessageCircle,
  Star,
  Check,
  X,
  Video,
  Wifi
} from 'lucide-react';

interface PrayerCell {
  id: string;
  name: string;
  description: string;
  leader: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    avatar?: string;
  };
  coLeaders?: Array<{ id: string; name: string }>;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: 'leader' | 'co-leader' | 'member';
    joinedAt: string;
  }>;
  schedule: {
    day: string;
    time: string;
    frequency: 'weekly' | 'bi-weekly' | 'monthly';
  };
  location: {
    type: 'physical' | 'online' | 'hybrid';
    address?: string;
    onlineLink?: string;
  };
  category: string;
  targetGroup?: string;
  maxMembers?: number;
  isOpen: boolean;
  prayerFocus?: string[];
  testimoniesCount: number;
  prayersAnswered: number;
  createdAt: string;
}

interface PrayerMeeting {
  id: string;
  cellId: string;
  cellName: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  isOnline: boolean;
  attendees: number;
  topics: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com';

export default function PrayerCellPage() {
  const [cells, setCells] = useState<PrayerCell[]>([]);
  const [myCell, setMyCell] = useState<PrayerCell | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<PrayerMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-cell' | 'explore' | 'meetings'>('my-cell');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<PrayerCell | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch cells
      const cellsResponse = await fetch('/api/prayer-cells-proxy', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (cellsResponse.ok) {
        const data = await cellsResponse.json();
        setCells(data.cells || []);
        setMyCell(data.myCell || null);
      } else {
        console.warn('[PrayerCells] Backend indisponible');
        setCells([]);
        setMyCell(null);
      }
      
      // Fetch meetings
      const meetingsResponse = await fetch('/api/prayer-cells-proxy?type=meetings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (meetingsResponse.ok) {
        const data = await meetingsResponse.json();
        setUpcomingMeetings(data.meetings || []);
      } else {
        setUpcomingMeetings([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setCells([]);
      setMyCell(null);
      setUpcomingMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoinCell = async (cellId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/prayer-cells/${cellId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowJoinModal(false);
      setSelectedCell(null);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'online': return Wifi;
      case 'hybrid': return Video;
      default: return MapPin;
    }
  };

  const filteredCells = cells.filter(cell => {
    if (filter !== 'all' && cell.category.toLowerCase() !== filter) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        cell.name.toLowerCase().includes(search) ||
        cell.description.toLowerCase().includes(search) ||
        cell.leader.name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ffc200] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#cc9b00]" />
            Cellules de prière
          </h1>
          <p className="text-gray-600">Priez ensemble, grandissez ensemble</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'my-cell', label: 'Ma cellule', icon: Heart },
          { id: 'explore', label: 'Explorer', icon: Search },
          { id: 'meetings', label: 'Réunions', icon: Calendar },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#ffc200] text-[#cc9b00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* My Cell Tab */}
      {activeTab === 'my-cell' && (
        <div>
          {myCell ? (
            <div className="space-y-6">
              {/* Cell Card */}
              <div className="bg-gradient-to-br from-[#ffc200] to-[#cc9b00] rounded-2xl p-6 text-[#0a0a0a]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{myCell.name}</h2>
                    <p className="text-[#3d3200] text-sm">{myCell.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {myCell.category}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/10 rounded-xl">
                    <p className="text-2xl font-bold">{myCell.members.length}</p>
                    <p className="text-xs text-[#3d3200]">Membres</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-xl">
                    <p className="text-2xl font-bold">{myCell.testimoniesCount}</p>
                    <p className="text-xs text-[#3d3200]">Témoignages</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-xl">
                    <p className="text-2xl font-bold">{myCell.prayersAnswered}</p>
                    <p className="text-xs text-[#3d3200]">Prières exaucées</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {myCell.schedule.day} {myCell.schedule.time}
                  </div>
                  <div className="flex items-center gap-2">
                    {myCell.location.type === 'online' ? <Wifi className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    {myCell.location.type === 'online' ? 'En ligne' : myCell.location.address}
                  </div>
                </div>
              </div>

              {/* Leader */}
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">Responsable</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#fff3cc] flex items-center justify-center text-[#cc9b00] font-semibold">
                      {myCell.leader.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{myCell.leader.name}</p>
                      <p className="text-sm text-gray-500">Responsable de cellule</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {myCell.leader.phone && (
                      <a href={`tel:${myCell.leader.phone}`} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <Phone className="h-4 w-4 text-gray-600" />
                      </a>
                    )}
                    {myCell.leader.email && (
                      <a href={`mailto:${myCell.leader.email}`} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Membres ({myCell.members.length}{myCell.maxMembers ? `/${myCell.maxMembers}` : ''})
                </h3>
                <div className="space-y-2">
                  {myCell.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">
                            {member.role === 'leader' ? 'Responsable' : 
                             member.role === 'co-leader' ? 'Co-responsable' : 'Membre'}
                          </p>
                        </div>
                      </div>
                      {member.role && member.role !== 'member' && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prayer Focus */}
              {myCell.prayerFocus && myCell.prayerFocus.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                  <h3 className="font-semibold text-gray-900 mb-3">Axes de prière</h3>
                  <div className="flex flex-wrap gap-2">
                    {myCell.prayerFocus.map((focus, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#fff3cc] text-[#cc9b00] rounded-full text-sm">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#e6af00]">
                  <MessageCircle className="h-5 w-5" />
                  Discussion
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                  <Heart className="h-5 w-5" />
                  Demande de prière
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vous n'êtes pas encore dans une cellule
              </h3>
              <p className="text-gray-600 mb-4">
                Rejoignez une cellule de prière pour grandir spirituellement
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-6 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#e6af00]"
              >
                Explorer les cellules
              </button>
            </div>
          )}
        </div>
      )}

      {/* Explore Tab */}
      {activeTab === 'explore' && (
        <div>
          {/* Search & Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une cellule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
            >
              <option value="all">Toutes</option>
              <option value="intercession">Intercession</option>
              <option value="jeunesse">Jeunesse</option>
              <option value="hommes">Hommes</option>
              <option value="femmes">Femmes</option>
            </select>
          </div>

          {/* Cells Grid */}
          <div className="grid gap-4">
            {filteredCells.map(cell => {
              const LocationIcon = getLocationIcon(cell.location.type);
              return (
                <div
                  key={cell.id}
                  className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedCell(cell);
                    setShowJoinModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cell.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{cell.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cell.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {cell.isOpen ? 'Ouvert' : 'Complet'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {cell.members.length}{cell.maxMembers ? `/${cell.maxMembers}` : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {cell.schedule.day} {cell.schedule.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <LocationIcon className="h-4 w-4" />
                      {cell.location.type === 'online' ? 'En ligne' : 
                       cell.location.type === 'hybrid' ? 'Hybride' : 'Présentiel'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#fff3cc] flex items-center justify-center text-[#cc9b00] text-sm font-medium">
                        {cell.leader.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-600">{cell.leader.name}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCells.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune cellule trouvée</p>
            </div>
          )}
        </div>
      )}

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Prochaines réunions</h3>
          
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map(meeting => (
              <div key={meeting.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{meeting.cellName}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(meeting.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })} à {meeting.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    meeting.status === 'upcoming' ? 'bg-[#fff3cc] text-[#cc9b00]' :
                    meeting.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {meeting.status === 'upcoming' ? 'À venir' :
                     meeting.status === 'ongoing' ? 'En cours' : 'Terminé'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {meeting.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {meeting.attendees} participants
                  </div>
                  <div className="flex items-center gap-1">
                    {meeting.isOnline ? <Wifi className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    {meeting.location}
                  </div>
                </div>

                {meeting.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {meeting.topics.map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune réunion prévue</p>
            </div>
          )}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && selectedCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rejoindre la cellule</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setSelectedCell(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-[#cc9b00]" />
                </div>
                <h3 className="font-bold text-gray-900">{selectedCell.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{selectedCell.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Horaire</p>
                    <p className="text-sm text-gray-600">
                      {selectedCell.schedule.day} à {selectedCell.schedule.time} ({
                        selectedCell.schedule.frequency === 'weekly' ? 'Chaque semaine' :
                        selectedCell.schedule.frequency === 'bi-weekly' ? 'Toutes les 2 semaines' :
                        'Mensuel'
                      })
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Lieu</p>
                    <p className="text-sm text-gray-600">
                      {selectedCell.location.type === 'online' ? 'En ligne uniquement' :
                       selectedCell.location.type === 'hybrid' ? `${selectedCell.location.address} / En ligne` :
                       selectedCell.location.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Membres</p>
                    <p className="text-sm text-gray-600">
                      {selectedCell.members.length} membres actuels
                      {selectedCell.maxMembers && ` (max ${selectedCell.maxMembers})`}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCell.isOpen ? (
                <button
                  onClick={() => handleJoinCell(selectedCell.id)}
                  className="w-full py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#e6af00]"
                >
                  <UserPlus className="h-5 w-5 inline mr-2" />
                  Rejoindre cette cellule
                </button>
              ) : (
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-red-700">Cette cellule est actuellement complète</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
