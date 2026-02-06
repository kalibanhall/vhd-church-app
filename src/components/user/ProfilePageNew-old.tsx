'use client'

import { useState, useRef } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Heart, 
  Calendar, 
  MessageCircle, 
  Edit3,
  Camera,
  Save,
  X,
  MapPin,
  Home,
  Briefcase,
  Users,
  Book,
  Clock,
  Baby
} from 'lucide-react'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface ProfileProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    profilePhoto?: string
    membershipNumber?: string
    membershipDate?: string
    role: string
    stats?: {
      totalDonations: number
      appointments: number
      prayerIntentions: number
      testimonies: number
    }
    recentActivity?: Array<{
      id: string
      type: 'donation' | 'appointment' | 'prayer' | 'testimony'
      title: string
      description: string
      date: string
    }>
  }
}

export default function ProfilePage({ user }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || ''
  })
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Données par défaut pour la démo
  const stats = user.stats || {
    totalDonations: 150,
    appointments: 2,
    prayerIntentions: 1,
    testimonies: 2
  }

  const recentActivity = user.recentActivity || [
    {
      id: '1',
      type: 'donation',
      title: 'Don effectué',
      description: 'Il y a 2 jours • $50',
      date: '2 jours'
    },
    {
      id: '2',
      type: 'appointment',
      title: 'Rendez-vous confirmé',
      description: 'Il y a 3 jours • Pasteur Paul',
      date: '3 jours'
    },
    {
      id: '3',
      type: 'prayer',
      title: 'Intention de prière soumise',
      description: 'Il y a 1 semaine',
      date: '1 semaine'
    }
  ]

  const menuItems = [
    { id: 'donations', label: 'Soutien à l\'œuvre', icon: Heart },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'prayers', label: 'Intentions de prière', icon: MessageCircle },
    { id: 'testimonies', label: 'Témoignages', icon: Users },
    { id: 'profile', label: 'Mon profil', icon: User, active: true },
    { id: 'admin', label: 'Administration', icon: Settings }
  ]

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('profilePhoto', file)
        
        const token = localStorage.getItem('token')
        const response = await fetch('/api/profile/photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          body: formData
        })

        const result = await response.json()
        
        if (result.success) {
          setProfilePhoto(result.url)
          alert('Photo de profil mise à jour avec succès!')
        } else {
          alert('Erreur: ' + result.error)
        }
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error)
        alert('Erreur lors de l\'upload de la photo')
      }
    }
  }

  const handleCameraCapture = () => {
    // Ouvrir l'appareil photo (nécessiterait une implémentation plus avancée)
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'camera')
      fileInputRef.current.click()
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await authenticatedFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(editData)
      })

      const result = await response.json()
      
      if (result.success) {
        // Mettre à jour les données locales
        setShowEditModal(false)
        alert('Profil mis à jour avec succès!')
        // Ici vous pourriez recharger les données du profil
        window.location.reload()
      } else {
        alert('Erreur: ' + result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du profil')
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'appointment':
        return <div className="w-2 h-2 bg-[#ffc200] rounded-full"></div>
      case 'prayer':
        return <div className="w-2 h-2 bg-[#fff3cc]0 rounded-full"></div>
      case 'testimony':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-[#ffc200] text-white flex flex-col">
        <div className="p-6">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    item.id === 'profile' || item.active
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-[#fff3cc] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Statistiques */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <Heart className="w-8 h-8 text-[#cc9b00] mx-auto mb-3" />
                  <div className="text-2xl font-bold text-[#cc9b00]">${stats.totalDonations}</div>
                  <div className="text-sm text-gray-500">Total des dons</div>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <Calendar className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-600">{stats.appointments}</div>
                  <div className="text-sm text-gray-500">Rendez-vous</div>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <MessageCircle className="w-8 h-8 text-[#cc9b00] mx-auto mb-3" />
                  <div className="text-2xl font-bold text-[#cc9b00]">{stats.prayerIntentions}</div>
                  <div className="text-sm text-gray-500">Intentions prière</div>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <Users className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-orange-600">{stats.testimonies}</div>
                  <div className="text-sm text-gray-500">Témoignages</div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Activité récente</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {activity.type === 'donation' && <Check className="w-4 h-4 text-green-500" />}
                          {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-[#cc9b00]" />}
                          {activity.type === 'prayer' && <MessageCircle className="w-4 h-4 text-[#cc9b00]" />}
                          <span className="font-medium">{activity.title}</span>
                        </div>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carte de membre */}
            <div className="space-y-6">
              <div className="bg-[#ffc200] rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium">
                  Membre officiel
                </div>

                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt="Photo de profil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-white" />
                      )}
                    </div>
                    
                    {/* Boutons photo */}
                    <div className="absolute -bottom-2 -right-2 flex space-x-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 bg-white text-[#cc9b00] rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                        title="Téléverser une photo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCameraCapture}
                        className="w-8 h-8 bg-white text-[#cc9b00] rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                        title="Prendre une photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm opacity-80">N° {user.membershipNumber || 'M-2020-001'}</p>
                  <p className="text-xs opacity-70">Valide jusqu'au 31/12/2025</p>
                </div>

                <button className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 py-3 px-4 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Télécharger la carte</span>
                </button>

                {/* Watermark */}
                <div className="absolute bottom-4 right-4 text-xs opacity-50">
                  Made in Bolt
                </div>
              </div>

              {/* Bouton modifier profil */}
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full bg-white border-2 border-[#e6af00] hover:border-[#cc9b00] text-[#cc9b00] py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modifier le profil</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification du profil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Modifier le profil</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-[#ffc200] hover:bg-[#cc9b00] text-white py-3 px-4 rounded-lg transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input hidden pour le téléversement de photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
    </div>
  )
}