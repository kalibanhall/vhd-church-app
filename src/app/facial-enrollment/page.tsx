/**
 * =============================================================================
 * PAGE D'ENREGISTREMENT FACIAL PROFESSIONNEL
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Interface professionnelle pour l'enregistrement des visages
 * avec guide étape par étape et validation de qualité.
 * 
 * =============================================================================
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import FaceCaptureAdvanced from '@/components/FaceCaptureAdvanced'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  UserPlus, 
  CheckCircle2, 
  ArrowLeft,
  Users,
  Camera,
  Shield,
  Sparkles
} from 'lucide-react'

interface Member {
  id: string
  nom: string
  prenom: string
  photo_url?: string
  face_descriptor?: number[]
}

interface CaptureResult {
  descriptor: Float32Array
  imageData: string
  quality: number
}

export default function EnrollFacePageAdvanced() {
  // States
  const [step, setStep] = useState<'list' | 'capture' | 'processing' | 'success'>('list')
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEnrolled, setShowEnrolled] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()

  // Vérifier les permissions
  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (user.role !== 'ADMIN' && user.role !== 'PASTOR') {
      toast.error('Accès réservé aux administrateurs et pasteurs')
      router.push('/')
    }
  }, [user, router])

  // Charger les membres
  useEffect(() => {
    loadMembers()
  }, [])

  // Filtrer les membres
  useEffect(() => {
    let filtered = members
    
    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m => 
        m.nom.toLowerCase().includes(query) || 
        m.prenom.toLowerCase().includes(query)
      )
    }
    
    // Filtrer par statut d'enregistrement
    if (!showEnrolled) {
      filtered = filtered.filter(m => !m.face_descriptor)
    }
    
    setFilteredMembers(filtered)
  }, [members, searchQuery, showEnrolled])

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('membres')
        .select('id, nom, prenom, photo_url, face_descriptor')
        .order('nom')

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des membres')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member)
    setStep('capture')
  }

  const handleCapture = async (captures: CaptureResult[]) => {
    if (!selectedMember || captures.length === 0) return

    setStep('processing')
    setIsProcessing(true)

    try {
      const supabase = createClient()

      // Calculer le descripteur moyen (plus robuste)
      const avgDescriptor = new Float32Array(128)
      for (const capture of captures) {
        for (let i = 0; i < 128; i++) {
          avgDescriptor[i] += capture.descriptor[i] / captures.length
        }
      }

      // Utiliser la meilleure capture pour la photo
      const bestCapture = captures.reduce((best, current) => 
        current.quality > best.quality ? current : best
      )

      // Upload de la photo
      const fileName = `face_${selectedMember.id}_${Date.now()}.jpg`
      const base64Data = bestCapture.imageData.split(',')[1]
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob())

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        console.warn('Erreur upload photo:', uploadError)
        // Continuer même si l'upload échoue
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      // Mettre à jour le membre
      const { error: updateError } = await supabase
        .from('membres')
        .update({
          face_descriptor: Array.from(avgDescriptor),
          photo_url: publicUrl
        })
        .eq('id', selectedMember.id)

      if (updateError) throw updateError

      toast.success('Visage enregistré avec succès!')
      setStep('success')

      // Actualiser la liste
      await loadMembers()

      // Retour à la liste après 3 secondes
      setTimeout(() => {
        setStep('list')
        setSelectedMember(null)
      }, 3000)

    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'enregistrement: ' + (error.message || 'Erreur inconnue'))
      setStep('capture')
    } finally {
      setIsProcessing(false)
    }
  }

  const goBack = () => {
    setStep('list')
    setSelectedMember(null)
  }

  // Stats
  const enrolledCount = members.filter(m => m.face_descriptor).length
  const pendingCount = members.filter(m => !m.face_descriptor).length

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Chargement des membres..." />
  }

  // Étape: Liste des membres
  if (step === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Enregistrement Facial</h1>
                <p className="text-blue-100">Système de reconnaissance faciale avancé</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-200" />
                  <span className="text-blue-200 text-sm">Total</span>
                </div>
                <p className="text-3xl font-bold mt-1">{members.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-300" />
                  <span className="text-green-200 text-sm">Enregistrés</span>
                </div>
                <p className="text-3xl font-bold mt-1">{enrolledCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 col-span-2 md:col-span-1">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-yellow-300" />
                  <span className="text-yellow-200 text-sm">En attente</span>
                </div>
                <p className="text-3xl font-bold mt-1">{pendingCount}</p>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Toggle enregistrés */}
              <button
                onClick={() => setShowEnrolled(!showEnrolled)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  showEnrolled 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {showEnrolled ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Tous les membres</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Non enregistrés uniquement</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Liste des membres */}
          {filteredMembers.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'Aucun résultat' : 'Tous les membres sont enregistrés!'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? 'Essayez avec d\'autres termes de recherche'
                  : 'Activez "Tous les membres" pour voir la liste complète'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleMemberSelect(member)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      {member.photo_url ? (
                        <img 
                          src={member.photo_url}
                          alt={member.nom}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {member.prenom?.[0]}{member.nom?.[0]}
                        </div>
                      )}
                      {/* Badge de statut */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${
                        member.face_descriptor 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}>
                        {member.face_descriptor ? (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        ) : (
                          <UserPlus className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {member.prenom} {member.nom}
                      </h3>
                      <p className={`text-sm ${
                        member.face_descriptor 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {member.face_descriptor ? '✓ Visage enregistré' : '○ En attente'}
                      </p>
                    </div>
                    
                    {/* Action */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-full flex items-center justify-center transition-colors">
                        <Camera className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Étape: Capture du visage
  if (step === 'capture' && selectedMember) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">
                Enregistrement de {selectedMember.prenom} {selectedMember.nom}
              </h1>
              <p className="text-gray-400 text-sm">
                Positionnez le visage dans l&apos;ovale pour commencer
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 rounded-full">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Sécurisé</span>
            </div>
          </div>

          {/* Composant de capture */}
          <FaceCaptureAdvanced 
            mode="enrollment"
            onCapture={handleCapture}
            minCaptureCount={3}
            requiredQuality={0.7}
          />
        </div>
      </div>
    )
  }

  // Étape: Traitement
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
            <div className="relative w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Traitement en cours...</h2>
          <p className="text-gray-400">
            Enregistrement du descripteur facial et de la photo
          </p>
        </div>
      </div>
    )
  }

  // Étape: Succès
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Enregistrement réussi!</h2>
          <p className="text-gray-400 mb-6">
            {selectedMember?.prenom} {selectedMember?.nom} peut maintenant être identifié(e)
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={goBack}
              className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Continuer les enregistrements
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
