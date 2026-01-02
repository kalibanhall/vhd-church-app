'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit3, 
  Camera, 
  Calendar, 
  Activity, 
  Heart,
  Users,
  MessageCircle,
  X,
  Upload,
  Scan,
  CheckCircle2
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  memberNumber?: string;
  membershipDate?: string;
  role: string;
  profilePhoto?: string;
  face_descriptor?: number[];
}

interface Stats {
  donations: number;
  appointments: number;
  prayers: number;
  testimonies: number;
}

interface ActivityItem {
  type: string;
  description: string;
  date: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ donations: 0, appointments: 0, prayers: 0, testimonies: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // États pour l'édition
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
    fetchUserActivity();
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('🔑 Token récupéré:', token ? 'Présent' : 'Manquant');
      
      if (!token) {
        console.log('❌ Pas de token, redirection vers /auth');
        router.push('/auth');
        return;
      }

      console.log('📡 Appel API profil...');
      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data reçue:', data);
        
        if (data.success && data.profile) {
          setUser(data.profile);
          setEditData({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            phone: data.profile.phone || ''
          });
        }
      } else {
        console.log('❌ Erreur API profil:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.log('📋 Détails erreur:', errorData);
        router.push('/auth');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      console.log('📊 Récupération stats avec token:', token ? 'Présent' : 'Manquant');
      
      const response = await fetch('/api/profile/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Réponse stats:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stats reçues:', data);
        setStats(data.stats || { donations: 0, appointments: 0, prayers: 0, testimonies: 0 });
      } else {
        console.log('❌ Erreur stats:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.log('📋 Détails erreur stats:', errorData);
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement des statistiques:', error);
    }
  };

  const fetchUserActivity = async () => {
    try {
      const response = await fetch('/api/profile/activity', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActivity(data.activity || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && user) {
          setUser({ ...user, profilePhoto: data.filePath });
        }
      }
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setUser(data.profile);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const formatMemberNumber = (memberNumber: string) => {
    if (!memberNumber) return '000000';
    return memberNumber.padStart(6, '0');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation': return <Heart size={16} className="text-green-600" />;
      case 'appointment': return <Calendar size={16} className="text-blue-600" />;
      case 'prayer': return <span className="text-purple-600">🙏</span>;
      case 'testimony': return <MessageCircle size={16} className="text-yellow-600" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Impossible de charger le profil</p>
          <button 
            onClick={() => router.push('/auth')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header avec bouton retour */}
      <div className="mb-6">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Carte principale du profil */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Photo de profil */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {user?.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'S'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Badge de statut facial - vert si visage enregistré */}
              {user?.face_descriptor && (
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
                className="hidden"
              />
            </div>

            {/* Informations utilisateur */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
              </h2>
              <p className="text-lg text-gray-600 mb-2">{user?.email}</p>
              <p className="text-gray-500 mb-4">{user?.phone || 'Téléphone non renseigné'}</p>
              
              {/* Badge de membre */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                👑 Membre #{formatMemberNumber(user?.memberNumber || '')}
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                Membre depuis le {user?.membershipDate || 'N/A'}
              </div>
              
              {/* Boutons d'actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 size={16} className="mr-2" />
                  Modifier le profil
                </button>
                <button
                  onClick={() => router.push('/facial-profile')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  <Scan size={16} className="mr-2" />
                  Reconnaissance Faciale
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques en grille */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dons effectués</p>
                <p className="text-2xl font-bold text-gray-900">{stats.donations}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rendez-vous</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prières</p>
                <p className="text-2xl font-bold text-gray-900">{stats.prayers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">🙏</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Témoignages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.testimonies}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageCircle size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity size={20} className="mr-2 text-blue-600" />
            Activité récente
          </h3>
          
          {activity.length > 0 ? (
            <div className="space-y-4">
              {activity.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(item.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune activité récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition du profil */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le profil</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}