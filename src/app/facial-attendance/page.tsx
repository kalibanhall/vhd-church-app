/**
 * =============================================================================
 * PAGE DE POINTAGE PAR RECONNAISSANCE FACIALE
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Interface professionnelle de pointage automatique par
 * reconnaissance faciale avec statistiques en temps réel.
 * 
 * =============================================================================
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import FaceCaptureAdvanced from '@/components/FaceCaptureAdvanced'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle2, 
  XCircle,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  UserCheck,
  Scan,
  History,
  ChevronRight
} from 'lucide-react'

interface Member {
  id: string
  nom: string
  prenom: string
  photo_url?: string
  face_descriptor?: number[]
}

interface AttendanceRecord {
  id: string
  member: Member
  time: string
  matchScore: number
}

export default function FacialAttendancePage() {
  // States
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRecognized, setLastRecognized] = useState<AttendanceRecord | null>(null)
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
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

  // Charger les membres avec descripteur facial
  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('membres')
        .select('id, nom, prenom, photo_url, face_descriptor')
        .not('face_descriptor', 'is', null)

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des membres')
    } finally {
      setIsLoading(false)
    }
  }

  // Marquer la présence
  const markAttendance = async (memberId: string) => {
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      
      // Vérifier si déjà présent aujourd'hui
      const { data: existingAttendance } = await supabase
        .from('presences')
        .select('id')
        .eq('membre_id', memberId)
        .eq('date', today)
        .single()

      if (existingAttendance) {
        // Déjà marqué présent
        return { success: true, alreadyMarked: true }
      }

      // Insérer la présence
      const { error } = await supabase
        .from('presences')
        .insert({
          membre_id: memberId,
          date: today,
          present: true,
          heure_arrivee: new Date().toISOString()
        })

      if (error) throw error
      return { success: true, alreadyMarked: false }

    } catch (error: any) {
      console.error('Erreur présence:', error)
      return { success: false, error: error.message }
    }
  }

  // Callback de vérification
  const handleVerify = useCallback(async (descriptor: Float32Array, matchScore: number) => {
    if (isProcessing || members.length === 0) return
    
    setIsProcessing(true)

    try {
      // Trouver le membre correspondant
      let bestMatch: Member | null = null
      let bestDistance = Infinity

      for (const member of members) {
        if (!member.face_descriptor) continue

        const savedDescriptor = new Float32Array(member.face_descriptor)
        let distance = 0
        for (let i = 0; i < descriptor.length; i++) {
          distance += Math.pow(descriptor[i] - savedDescriptor[i], 2)
        }
        distance = Math.sqrt(distance)

        if (distance < bestDistance) {
          bestDistance = distance
          bestMatch = member
        }
      }

      // Si correspondance trouvée (distance < 0.5)
      if (bestMatch && bestDistance < 0.5) {
        const result = await markAttendance(bestMatch.id)
        
        const record: AttendanceRecord = {
          id: Date.now().toString(),
          member: bestMatch,
          time: new Date().toLocaleTimeString('fr-FR'),
          matchScore: Math.max(0, Math.min(100, (1 - bestDistance) * 100))
        }

        setLastRecognized(record)
        
        if (result.success && !result.alreadyMarked) {
          setTodayAttendance(prev => [record, ...prev])
          toast.success(`${bestMatch.prenom} ${bestMatch.nom} - Présence enregistrée!`)
        } else if (result.alreadyMarked) {
          toast(`${bestMatch.prenom} ${bestMatch.nom} déjà présent(e)`)
        }

        // Reset après 3 secondes
        setTimeout(() => {
          setLastRecognized(null)
        }, 3000)
      }

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [members, isProcessing])

  // Convertir descripteurs pour le composant
  const existingDescriptors = members
    .filter(m => m.face_descriptor)
    .map(m => new Float32Array(m.face_descriptor!))

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Chargement du système de pointage..." />
  }

  // Message si aucun membre enregistré
  if (members.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Aucun visage enregistré
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous devez d&apos;abord enregistrer les visages des membres avant de pouvoir utiliser le pointage automatique.
          </p>
          <button
            onClick={() => router.push('/facial-enrollment')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Enregistrer des visages
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne principale - Caméra */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Scan className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Pointage Facial</h1>
                  <p className="text-purple-100">
                    {members.length} membre{members.length > 1 ? 's' : ''} enregistré{members.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Zone de capture */}
            <FaceCaptureAdvanced 
              mode="verification"
              existingDescriptors={existingDescriptors}
              onVerify={handleVerify}
            />

            {/* Dernier reconnu */}
            {lastRecognized && (
              <div className="bg-green-500 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  {lastRecognized.member.photo_url ? (
                    <img 
                      src={lastRecognized.member.photo_url}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white">
                      {lastRecognized.member.prenom?.[0]}{lastRecognized.member.nom?.[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">
                      {lastRecognized.member.prenom} {lastRecognized.member.nom}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-green-100 flex items-center gap-1">
                        <CheckCircle2 className="h-5 w-5" />
                        Identifié à {lastRecognized.matchScore.toFixed(0)}%
                      </span>
                      <span className="text-green-100 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {lastRecognized.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale - Stats et historique */}
          <div className="space-y-6">
            {/* Stats du jour */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Aujourd&apos;hui</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm">Présents</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{todayAttendance.length}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Taux</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {members.length > 0 
                      ? Math.round((todayAttendance.length / members.length) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Historique des présences */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full mb-4"
              >
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Historique</h3>
                </div>
                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
              </button>

              {showHistory && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {todayAttendance.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Aucune présence enregistrée
                    </p>
                  ) : (
                    todayAttendance.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-3 bg-gray-700/50 rounded-xl p-3"
                      >
                        {record.member.photo_url ? (
                          <img 
                            src={record.member.photo_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {record.member.prenom?.[0]}{record.member.nom?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {record.member.prenom} {record.member.nom}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {record.time} • {record.matchScore.toFixed(0)}%
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="text-blue-300 font-semibold mb-3">Instructions</h4>
              <ul className="text-blue-200/80 text-sm space-y-2">
                <li>• Placez-vous face à la caméra</li>
                <li>• Attendez la détection automatique</li>
                <li>• La présence est enregistrée instantanément</li>
                <li>• Un seul pointage par jour par personne</li>
              </ul>
            </div>

            {/* Lien vers enregistrement */}
            <button
              onClick={() => router.push('/facial-enrollment')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              <Users className="h-5 w-5" />
              Enregistrer de nouveaux visages
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
