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
  Save,
  X,
  MapPin,
  Book,
  Clock,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { authenticatedFetch } from '../../lib/api'
import FaceCapture from '../FaceCapture'
import { toast } from 'react-hot-toast'

interface ProfileProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    profileImageUrl?: string
    membershipNumber?: string
    membershipDate?: string
    role: string
  }
}

export default function UserProfile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showFacialEnrollment, setShowFacialEnrollment] = useState(false)
  const [hasFaceData, setHasFaceData] = useState(false)
  const [editData, setEditData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    address: '',
    city: '',
    profession: '',
    birthDate: '',
    maritalStatus: '',
    bio: ''
  })
  
  const [profilePhoto, setProfilePhoto] = useState(user.profileImageUrl)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const response = await authenticatedFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        setIsEditing(false)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la sauvegarde du profil')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde du profil')
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB')
      return
    }

    setIsUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await authenticatedFetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setProfilePhoto(data.imageUrl)
        alert('Photo de profil mise à jour avec succès')
      } else {
        alert(data.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'upload de la photo')
    } finally {
      setIsUploadingPhoto(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return
    }

    try {
      const response = await authenticatedFetch('/api/profile/photo', {
        method: 'DELETE',
      })

      if (response.ok) {
        setProfilePhoto(undefined)
        alert('Photo de profil supprimée avec succès')
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleFaceDetected = async (descriptor: Float32Array, imageData: string) => {
    try {
      console.log('📸 Envoi du descripteur facial au serveur...', {
        descriptorLength: descriptor.length,
        userId: user.id
      })

      const token = localStorage.getItem('token')
      const response = await fetch('/api/facial-recognition-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          descriptor: Array.from(descriptor),
          photoUrl: imageData,
          qualityScore: 0.9,
          isPrimary: true
        })
      })

      const data = await response.json()
      console.log('📡 Réponse du serveur:', response.status, data)

      if (response.ok) {
        toast.success('✅ Visage enregistré avec succès!')
        setShowFacialEnrollment(false)
        setHasFaceData(true)
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement du visage')
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    }
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Modifier mon profil</h1>
                <p className="text-gray-600">Complétez vos informations personnelles</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Situation matrimoniale
                  </label>
                  <select
                    value={editData.maritalStatus}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="célibataire">Célibataire</option>
                    <option value="marié">Marié(e)</option>
                    <option value="divorcé">Divorcé(e)</option>
                    <option value="veuf">Veuf/Veuve</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Adresse et Informations
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse complète
                  </label>
                  <textarea
                    value={editData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    placeholder="Quartier, rue..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={editData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Douala, Yaoundé..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <input
                    type="text"
                    value={editData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    placeholder="Ex: Ingénieur, Enseignant..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biographie
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    placeholder="Parlez-nous de vous..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vue normale du profil (sans sidebar)
  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4 lg:p-8 overflow-y-auto max-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Card - Compact mobile */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="relative group">
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profil" 
                    className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-2 md:border-4 border-blue-200"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 md:border-4 border-blue-200">
                    <User className="w-8 h-8 md:w-12 md:h-12 text-white" />
                  </div>
                )}
                
                {/* Boutons photo - visibles au survol */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="p-1.5 md:p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="Changer la photo"
                    >
                      {isUploadingPhoto ? (
                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                    </button>
                    {profilePhoto && (
                      <button
                        onClick={handleRemovePhoto}
                        className="p-1.5 md:p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Supprimer la photo"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm md:text-base text-blue-600 font-medium capitalize">{user.role}</p>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-1 md:mt-2 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Boutons actions - Stack vertical sur mobile */}
            <div className="flex flex-row md:flex-col gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Modifier
              </button>
              
              {!showFacialEnrollment ? (
                <button
                  onClick={() => setShowFacialEnrollment(true)}
                  className={`flex items-center justify-center px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-lg transition-colors ${
                    hasFaceData 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  {hasFaceData ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      <span className="hidden md:inline">Visage enregistré</span>
                      <span className="md:hidden">Visage</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      <span className="hidden md:inline">Enregistrer</span>
                      <span className="md:hidden">Photo</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowFacialEnrollment(false)}
                  className="flex items-center justify-center px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section d'enregistrement facial - Compact mobile */}
        {showFacialEnrollment && (
          <div className="mb-4 md:mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-6">
              <div className="flex items-start mb-3 md:mb-4">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2 md:mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-blue-900 mb-1">
                    Enregistrement de votre visage
                  </h3>
                  <p className="text-xs md:text-sm text-blue-700">
                    Cette fonctionnalité vous permettra de pointer automatiquement aux événements 
                    grâce à la reconnaissance faciale.
                  </p>
                </div>
              </div>
              
              <FaceCapture 
                mode="capture"
                onFaceDetected={handleFaceDetected}
              />
            </div>
          </div>
        )}

        {/* Stats Cards - Responsive mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 text-center">
            <Heart className="w-5 h-5 md:w-8 md:h-8 text-green-500 mx-auto mb-2 md:mb-3" />
            <div className="text-lg md:text-2xl font-bold text-green-600">12</div>
            <div className="text-xs md:text-sm text-gray-600">Dons</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 text-center">
            <Calendar className="w-5 h-5 md:w-8 md:h-8 text-blue-500 mx-auto mb-2 md:mb-3" />
            <div className="text-lg md:text-2xl font-bold text-blue-600">3</div>
            <div className="text-xs md:text-sm text-gray-600">RDV</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 text-center">
            <MessageCircle className="w-5 h-5 md:w-8 md:h-8 text-purple-500 mx-auto mb-2 md:mb-3" />
            <div className="text-lg md:text-2xl font-bold text-purple-600">8</div>
            <div className="text-xs md:text-sm text-gray-600">Prières</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 text-center">
            <Book className="w-5 h-5 md:w-8 md:h-8 text-orange-500 mx-auto mb-2 md:mb-3" />
            <div className="text-lg md:text-2xl font-bold text-orange-600">5</div>
            <div className="text-xs md:text-sm text-gray-600">Témoignages</div>
          </div>
        </div>

        {/* Cartes Info - Responsive mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3 md:p-6">
            <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4 flex items-center">
              <User className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-blue-600" />
              Informations personnelles
            </h2>
            <div className="space-y-2 md:space-y-4">
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-500">Prénom</label>
                  <p className="text-sm md:text-base text-gray-900">{user.firstName}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-500">Nom</label>
                  <p className="text-sm md:text-base text-gray-900">{user.lastName}</p>
                </div>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm md:text-base text-gray-900 truncate">{user.email}</p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-500">Téléphone</label>
                <p className="text-sm md:text-base text-gray-900">{user.phone || 'Non renseigné'}</p>
              </div>
              {user.membershipNumber && (
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-500">Numéro de membre</label>
                  <p className="text-sm md:text-base text-gray-900">{user.membershipNumber}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 md:p-6">
            <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4 flex items-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-blue-600" />
              Activité récente
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start space-x-2 md:space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 md:mt-2"></div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900">Don effectué</p>
                  <p className="text-xs text-gray-500">Il y a 2 jours</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 md:space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 md:mt-2"></div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900">RDV confirmé</p>
                  <p className="text-xs text-gray-500">Il y a 3 jours</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 md:space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 md:mt-2"></div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900">Prière soumise</p>
                  <p className="text-xs text-gray-500">Il y a 1 semaine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Input hidden pour l'upload de photos */}
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