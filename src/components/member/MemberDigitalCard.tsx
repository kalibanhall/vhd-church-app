/**
 * =============================================================================
 * CARTE NUMÉRIQUE DU MEMBRE - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Carte d'identité numérique du membre
 * - QR Code pour identification rapide
 * - Informations de profil
 * - Design moderne et personnalisable
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * =============================================================================
 */

'use client'

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from 'react'
import { 
  User, QrCode, Calendar, Phone, Mail, MapPin, 
  Download, Share2, Printer, Shield, CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface MemberCardData {
  id: string
  membershipNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  status: string
  membershipDate: string
  profileImageUrl?: string
  qrCodeData?: string
}

interface MemberDigitalCardProps {
  member?: MemberCardData
  showActions?: boolean
  compact?: boolean
  theme?: 'blue' | 'purple' | 'green' | 'gold'
}

export default function MemberDigitalCard({ 
  member: propMember, 
  showActions = true,
  compact = false,
  theme = 'blue'
}: MemberDigitalCardProps) {
  const { user } = useAuth()
  const [member, setMember] = useState<MemberCardData | null>(propMember || null)
  const [loading, setLoading] = useState(!propMember)
  const [qrCode, setQrCode] = useState<string>('')
  const cardRef = useRef<HTMLDivElement>(null)

  // Thèmes de couleur
  const themes = {
    blue: {
      gradient: 'from-[#ffc200] via-[#cc9b00] to-[#a67d00]',
      accent: 'bg-[#ffc200]',
      light: 'bg-[#fff3cc] text-[#3d3200]',
      border: 'border-[#ffc200]'
    },
    purple: {
      gradient: 'from-purple-600 via-purple-700 to-indigo-800',
      accent: 'bg-purple-500',
      light: 'bg-purple-100 text-purple-800',
      border: 'border-purple-500'
    },
    green: {
      gradient: 'from-emerald-600 via-emerald-700 to-teal-800',
      accent: 'bg-emerald-500',
      light: 'bg-emerald-100 text-emerald-800',
      border: 'border-emerald-500'
    },
    gold: {
      gradient: 'from-amber-500 via-orange-600 to-amber-800',
      accent: 'bg-amber-500',
      light: 'bg-amber-100 text-amber-800',
      border: 'border-amber-500'
    }
  }

  const currentTheme = themes[theme]

  useEffect(() => {
    if (!propMember && user) {
      loadMemberData()
    }
  }, [user, propMember])

  useEffect(() => {
    if (member) {
      // Données encodées dans le QR Code
      const qrData = JSON.stringify({
        type: 'MEMBER_CARD',
        id: member.id,
        number: member.membershipNumber,
        name: `${member.firstName} ${member.lastName}`,
        status: member.status,
        timestamp: Date.now()
      })

      // Générer le QR Code via API externe
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
      setQrCode(qrApiUrl)
    }
  }, [member])

  const loadMemberData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/member-card', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setMember(data.member)
      }
    } catch (error) {
      console.error('Erreur chargement carte membre:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = () => {
    if (!member) return
    
    // Données encodées dans le QR Code
    const qrData = JSON.stringify({
      type: 'MEMBER_CARD',
      id: member.id,
      number: member.membershipNumber,
      name: `${member.firstName} ${member.lastName}`,
      status: member.status,
      timestamp: Date.now()
    })

    // Générer le QR Code via API externe (ou utiliser une lib)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
    setQrCode(qrApiUrl)
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    
    try {
      // Utiliser html2canvas si disponible
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: undefined
      } as Parameters<typeof html2canvas>[1])
      
      const link = document.createElement('a')
      link.download = `carte_membre_${member?.membershipNumber || 'membre'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      alert('Téléchargement non disponible. Veuillez faire une capture d\'écran.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (!member) return
    
    const shareData = {
      title: 'Ma carte de membre',
      text: `Carte de membre ${member.firstName} ${member.lastName} - ${member.membershipNumber}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Lien copié dans le presse-papier')
      }
    } catch (error) {
      console.error('Erreur partage:', error)
    }
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'PASTOR': 'Pasteur',
      'OUVRIER': 'Ouvrier',
      'FIDELE': 'Fidèle',
      'VISITEUR': 'Visiteur'
    }
    return roles[role] || role
  }

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
          <CheckCircle className="h-3 w-3" />
          Actif
        </span>
      )
    }
    return (
      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-[#cc9b00]" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="text-center p-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Carte membre non disponible</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-r ${currentTheme.gradient} rounded-xl p-4 text-white shadow-lg`}>
        <div className="flex items-center gap-4">
          {member.profileImageUrl ? (
            <img 
              src={member.profileImageUrl} 
              alt={member.firstName}
              className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-bold">{member.firstName} {member.lastName}</div>
            <div className="text-xs opacity-80">{member.membershipNumber}</div>
          </div>
          {getStatusBadge(member.status)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Carte principale */}
      <div 
        ref={cardRef}
        className={`bg-gradient-to-br ${currentTheme.gradient} rounded-2xl overflow-hidden shadow-2xl print:shadow-none`}
        style={{ aspectRatio: '1.6/1', maxWidth: '450px' }}
      >
        {/* En-tête avec logo */}
        <div className="p-4 pb-2 flex justify-between items-start">
          <div>
            <div className="text-white/90 text-xs font-medium tracking-wider uppercase">
              Carte de Membre
            </div>
            <div className="text-white font-bold text-lg mt-1">
              🏛️ MyChurchApp
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(member.status)}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4 pb-4 flex gap-4">
          {/* Photo et QR */}
          <div className="flex flex-col items-center gap-2">
            {member.profileImageUrl ? (
              <img 
                src={member.profileImageUrl} 
                alt={member.firstName}
                className="w-20 h-20 rounded-xl border-2 border-white/30 object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center border-2 border-white/30">
                <User className="h-10 w-10 text-white" />
              </div>
            )}
            {qrCode && (
              <div className="bg-white p-1 rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="flex-1 text-white">
            <div className="text-2xl font-bold leading-tight">
              {member.firstName}
            </div>
            <div className="text-xl font-semibold text-white/90">
              {member.lastName}
            </div>
            
            <div className={`inline-block px-2 py-0.5 ${currentTheme.light} text-xs font-medium rounded mt-2`}>
              {getRoleLabel(member.role)}
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="h-3 w-3" />
                <span className="font-mono">{member.membershipNumber}</span>
              </div>
              {member.membershipDate && (
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="h-3 w-3" />
                  <span>Depuis {new Date(member.membershipDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bande inférieure */}
        <div className="bg-black/20 px-4 py-2 flex justify-between items-center">
          <div className="text-white/60 text-xs">
            Valide jusqu&apos;à révocation
          </div>
          <div className="flex items-center gap-1 text-white/60 text-xs">
            <QrCode className="h-3 w-3" />
            Scannez pour vérifier
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 flex-wrap print:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>
      )}

      {/* Informations supplémentaires */}
      <Card className="p-4 print:hidden">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-[#cc9b00]" />
          Informations de contact
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// Export des composants utilitaires
export { MemberDigitalCard }


