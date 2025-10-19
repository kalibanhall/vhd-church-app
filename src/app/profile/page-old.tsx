'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Calendar, Users, MessageCircle, Camera, Edit3, Download, ArrowLeft } from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  profileImageUrl?: string
  role: string
  memberNumber?: string
  membershipDate?: string
}

interface Stats {
  totalDonations: number
  appointments: number
  prayers: number
  testimonies: number
}

interface Activity {
  id: string
  type: 'donation' | 'appointment' | 'prayer'
  title: string
  description: string
  date: string
  icon: any
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalDonations: 0,
    appointments: 0,
    prayers: 0,
    testimonies: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })

  useEffect(() => {
    fetchUserProfile()
    fetchUserStats()
    fetchRecentActivity()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth')
        return
      }

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.profile) {
          setUser(data.profile)
          setEditForm({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            phone: data.profile.phone || ''
          })
        } else {
          console.error('Données utilisateur manquantes:', data)
          router.push('/auth')
        }
      } else {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/profile/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/profile/activity', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsEditing(false)
        alert('Profil mis à jour avec succès!')
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const token = localStorage.getItem('authToken')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'profile')

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        
        // Mettre à jour l'URL de l'image de profil
        const updateResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profileImageUrl: data.url })
        })

        if (updateResponse.ok) {
          const updatedUser = await updateResponse.json()
          setUser(updatedUser.user)
          alert('Photo de profil mise à jour!')
        }
      } else {
        alert('Erreur lors du téléchargement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du téléchargement')
    }
  }

  const formatMemberNumber = (memberNumber: string) => {
    return memberNumber || `M-${new Date().getFullYear()}-${Math.random().toString().substring(2, 5)}`
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Chargement...</div>
    </div>
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Utilisateur non trouvé</div>
    </div>
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
              {/* Bouton caméra pour changer la photo */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Camera size={20} />
              </button>
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
              <p className="text-gray-500 mb-4">{user?.phone}</p>
              
              {/* Badge de membre */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                👑 Membre #{formatMemberNumber(user?.memberNumber || '')}
              </div>
              
              <div className="text-sm text-gray-500">
                Membre depuis le {user?.membershipDate || 'N/A'}
              </div>
              
              {/* Bouton éditer profil */}
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 size={16} className="mr-2" />
                Modifier le profil
              </button>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-80 bg-blue-600 text-white min-h-screen p-6">
          {/* Navigation */}
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>

          <nav className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <Heart className="w-5 h-5" />
              <span>Soutien à l'œuvre</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
              <Calendar className="w-5 h-5" />
              <span>Rendez-vous</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
              <Users className="w-5 h-5" />
              <span>Intentions de prière</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
              <MessageCircle className="w-5 h-5" />
              <span>Témoignages</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
              <Users className="w-5 h-5 text-yellow-300" />
              <span className="text-yellow-300">Mon profil</span>
            </div>
          </nav>

          {/* Section Administration */}
          {['ADMIN', 'OUVRIER', 'PASTEUR'].includes(user.role) && (
            <div className="mt-8 pt-6 border-t border-white/20">
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors cursor-pointer w-full text-left"
              >
                <div className="w-5 h-5 rounded bg-white/20" />
                <span>Administration</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header avec statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Stats Cards */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">${stats.totalDonations}</div>
                <div className="text-gray-600 text-sm">Total des dons</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.appointments}</div>
                <div className="text-gray-600 text-sm">Rendez-vous</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{stats.prayers}</div>
                <div className="text-gray-600 text-sm">Intentions prière</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{stats.testimonies}</div>
                <div className="text-gray-600 text-sm">Témoignages</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  {/* Member Badge */}
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 text-center">
                    <div className="bg-white/20 rounded-lg px-3 py-1 inline-block">
                      <span className="text-white font-semibold text-sm">Membre officiel</span>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 overflow-hidden relative">
                        {user.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'S'}
                            </span>
                          </div>
                        )}
                        
                        {/* Camera button */}
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(file)
                          }
                        }}
                        className="hidden"
                      />
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
                    </h2>
                    
                    <div className="text-gray-600 mb-4">
                      N° {formatMemberNumber(user?.memberNumber || '')}
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-6">
                      Valide jusqu'au 31/12/2025
                    </div>

                    {/* Edit Button */}
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Modifier le profil
                    </button>

                    {/* Download Card Button */}
                    <button className="flex items-center gap-2 mx-auto mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Télécharger la carte
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Activité récente</h3>
                  
                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.map((activity, index) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.type === 'donation' ? 'bg-green-100 text-green-600' :
                            activity.type === 'appointment' ? 'bg-blue-100 text-blue-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {activity.type === 'donation' && <Heart className="w-5 h-5" />}
                            {activity.type === 'appointment' && <Calendar className="w-5 h-5" />}
                            {activity.type === 'prayer' && <Users className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{activity.title}</div>
                            <div className="text-gray-600 text-sm">{activity.description}</div>
                          </div>
                          <div className="text-gray-500 text-sm">{activity.date}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucune activité récente</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Modifier le profil</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProfileUpdate}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}