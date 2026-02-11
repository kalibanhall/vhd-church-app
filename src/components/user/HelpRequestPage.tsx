/**
 * =============================================================================
 * PAGE BESOIN D'AIDE - DEMANDES D'ASSISTANCE
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Page permettant aux membres de soumettre des demandes d'aide
 * (matérielle, spirituelle, counseling) et de voir le suivi de leurs demandes.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  MessageSquare,
  X,
  Send,
  Loader2,
  Shield,
  Heart,
  Home,
  Users,
  Briefcase,
  HeartHandshake,
  Eye,
  EyeOff
} from 'lucide-react'

// Interface pour les paramètres
interface AppSettings {
  emergency_phone: string
  emergency_email: string
  contact_phone: string
  contact_email: string
}

// Types
interface HelpRequest {
  id: string
  userId: string
  type: 'material' | 'spiritual' | 'counseling' | 'prayer' | 'financial' | 'other'
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  isAnonymous: boolean
  contactPreference: 'phone' | 'email' | 'in_person'
  phone?: string
  email?: string
  createdAt: string
  updatedAt: string
  response?: string
  assignedTo?: string
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

const helpTypes = [
  { value: 'material', label: 'Aide matérielle', icon: Home, color: 'bg-amber-100 text-amber-700', description: 'Nourriture, vêtements, logement...' },
  { value: 'financial', label: 'Aide financière', icon: Briefcase, color: 'bg-green-100 text-green-700', description: 'Difficultés financières temporaires' },
  { value: 'spiritual', label: 'Soutien spirituel', icon: Heart, color: 'bg-[#fff3cc] text-[#5c4d00]', description: 'Accompagnement dans la foi' },
  { value: 'counseling', label: 'Counseling', icon: Users, color: 'bg-[#fff3cc] text-[#cc9b00]', description: 'Conseil familial, personnel' },
  { value: 'prayer', label: 'Prière spéciale', icon: Heart, color: 'bg-[#fff3cc] text-[#5c4d00]', description: 'Demande de prière urgente' },
  { value: 'other', label: 'Autre', icon: HeartHandshake, color: 'bg-gray-100 text-gray-700', description: 'Autre type d\'aide' }
]

const HelpRequestPage: React.FC = () => {
  // États
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null)
  
  // État pour les paramètres de contact
  const [appSettings, setAppSettings] = useState<AppSettings>({
    emergency_phone: '+243 83 23 13 105',
    emergency_email: 'contact@mychurchapp.com',
    contact_phone: '+243 83 23 13 105',
    contact_email: 'contact@mychurchapp.com'
  })
  
  // États du formulaire
  const [formType, setFormType] = useState<HelpRequest['type']>('spiritual')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formUrgency, setFormUrgency] = useState<HelpRequest['urgency']>('medium')
  const [formIsAnonymous, setFormIsAnonymous] = useState(false)
  const [formContactPref, setFormContactPref] = useState<HelpRequest['contactPreference']>('phone')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Charger les demandes et les paramètres
  useEffect(() => {
    loadRequests()
    loadSettings()
  }, [])

  // Charger les paramètres de contact depuis l'API
  const loadSettings = async () => {
    try {
      const response = await authenticatedFetch('/api/settings-proxy?category=contact')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          const settingsMap: Record<string, string> = {}
          data.settings.forEach((s: { key: string, value: string }) => {
            settingsMap[s.key] = s.value
          })
          setAppSettings(prev => ({
            ...prev,
            emergency_phone: settingsMap['emergency_phone'] || prev.emergency_phone,
            emergency_email: settingsMap['emergency_email'] || prev.emergency_email,
            contact_phone: settingsMap['contact_phone'] || prev.contact_phone,
            contact_email: settingsMap['contact_email'] || prev.contact_email
          }))
        }
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    }
  }

  const loadRequests = async () => {
    setIsLoading(true)
    
    // D'abord essayer de charger depuis l'API
    try {
      const userId = localStorage.getItem('userId') || ''
      if (userId) {
        const response = await authenticatedFetch(`/api/help-requests-proxy?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.requests && data.requests.length > 0) {
            setRequests(data.requests)
            setIsLoading(false)
            return
          }
        }
      }
    } catch (error) {
      console.error('Erreur API help requests:', error)
    }
    
    // Fallback: Charger depuis localStorage
    const saved = localStorage.getItem('help_requests')
    if (saved) {
      try {
        const allRequests = JSON.parse(saved)
        // Filtrer les demandes de l'utilisateur courant
        const userId = localStorage.getItem('userId') || ''
        if (userId) {
          setRequests(allRequests.filter((r: HelpRequest) => r.userId === userId))
        } else {
          setRequests([])
        }
      } catch {
        setRequests([])
      }
    } else {
      // Pas de données de démonstration - liste vide
      setRequests([])
    }
    
    setIsLoading(false)
  }

  const saveAllRequests = (allRequests: HelpRequest[]) => {
    localStorage.setItem('help_requests', JSON.stringify(allRequests))
  }

  const submitRequest = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' })
      return
    }

    setIsSubmitting(true)

    try {
      const userId = localStorage.getItem('userId') || ''
      const now = new Date().toISOString()

      const newRequest: HelpRequest = {
        id: `help_${Date.now()}`,
        userId,
        type: formType,
        title: formTitle,
        description: formDescription,
        urgency: formUrgency,
        status: 'pending',
        isAnonymous: formIsAnonymous,
        contactPreference: formContactPref,
        phone: formPhone || undefined,
        email: formEmail || undefined,
        createdAt: now,
        updatedAt: now
      }

      // Charger toutes les demandes et ajouter la nouvelle
      const allSaved = localStorage.getItem('help_requests')
      const allRequests = allSaved ? JSON.parse(allSaved) : []
      allRequests.push(newRequest)
      saveAllRequests(allRequests)

      // Mettre à jour l'état local
      setRequests([...requests, newRequest])
      
      // Réinitialiser le formulaire
      setFormTitle('')
      setFormDescription('')
      setFormType('spiritual')
      setFormUrgency('medium')
      setFormIsAnonymous(false)
      setFormContactPref('phone')
      setFormPhone('')
      setFormEmail('')
      setShowNewForm(false)
      
      setMessage({ type: 'success', text: 'Votre demande a été envoyée. Nous vous contacterons bientôt.' })
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de la demande' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelRequest = (requestId: string) => {
    if (!confirm('Annuler cette demande ?')) return

    const allSaved = localStorage.getItem('help_requests')
    if (allSaved) {
      const allRequests = JSON.parse(allSaved).map((r: HelpRequest) => 
        r.id === requestId ? { ...r, status: 'cancelled', updatedAt: new Date().toISOString() } : r
      )
      saveAllRequests(allRequests)
      setRequests(requests.map(r => 
        r.id === requestId ? { ...r, status: 'cancelled' } : r
      ))
      setMessage({ type: 'info', text: 'Demande annulée' })
    }
  }

  const getStatusBadge = (status: HelpRequest['status']) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="h-3 w-3" />En attente</span>
      case 'in_progress':
        return <span className="flex items-center gap-1 px-2 py-1 bg-[#fff3cc] text-[#cc9b00] rounded-full text-xs"><AlertCircle className="h-3 w-3" />En cours</span>
      case 'completed':
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="h-3 w-3" />Traitée</span>
      case 'cancelled':
        return <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs"><X className="h-3 w-3" />Annulée</span>
      default:
        return null
    }
  }

  const getUrgencyBadge = (urgency: HelpRequest['urgency']) => {
    switch (urgency) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Urgent</span>
      case 'medium':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Modéré</span>
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Normal</span>
      default:
        return null
    }
  }

  const getTypeInfo = (type: string) => {
    return helpTypes.find(t => t.value === type) || helpTypes[5]
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  // Statistiques
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  }

  if (isLoading) {
    return <LoadingSpinner size="md" text="Chargement des demandes d'aide..." />
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ffc200] to-[#cc9b00] rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Besoin d&apos;aide</h1>
        <p className="text-[#fff3cc]">
          L&apos;église est là pour vous accompagner. N&apos;hésitez pas à nous faire part de vos besoins.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-[#fff3cc] text-[#cc9b00] border border-[#ffc200]'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Confidentialité */}
      <div className="bg-[#fff3cc] border border-[#e6af00] rounded-xl p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-[#cc9b00] mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-[#3d3200]">Vos demandes sont confidentielles</p>
          <p className="text-sm text-[#cc9b00]">
            Seuls les responsables autorisés ont accès à vos demandes. Vous pouvez aussi choisir l&apos;option anonyme.
          </p>
        </div>
      </div>

      {/* Bouton nouvelle demande */}
      {!showNewForm && (
        <button
          onClick={() => setShowNewForm(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#ffc200] text-white rounded-xl hover:bg-[#cc9b00] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouvelle demande d&apos;aide
        </button>
      )}

      {/* Formulaire nouvelle demande */}
      {showNewForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Nouvelle demande</h2>
            <button onClick={() => setShowNewForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Type d'aide */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Type d&apos;aide nécessaire</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {helpTypes.map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      onClick={() => setFormType(type.value as HelpRequest['type'])}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formType === type.value 
                          ? 'border-[#ffc200] bg-[#fff3cc]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`inline-flex p-2 rounded-lg ${type.color} mb-2`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de votre demande <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                placeholder="Ex: Besoin de prière pour ma santé"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description détaillée <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent resize-none"
                placeholder="Décrivez votre situation et comment l'église peut vous aider..."
              />
            </div>

            {/* Urgence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d&apos;urgence</label>
              <div className="flex gap-3">
                {[
                  { value: 'low', label: 'Normal', color: 'bg-green-100 text-green-700 border-green-300' },
                  { value: 'medium', label: 'Modéré', color: 'bg-orange-100 text-orange-700 border-orange-300' },
                  { value: 'high', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFormUrgency(opt.value as HelpRequest['urgency'])}
                    className={`px-4 py-2 rounded-lg border-2 font-medium ${
                      formUrgency === opt.value ? opt.color : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymat */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <button
                onClick={() => setFormIsAnonymous(!formIsAnonymous)}
                className={`p-2 rounded-lg ${formIsAnonymous ? 'bg-[#ffc200] text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                {formIsAnonymous ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <div>
                <p className="font-medium text-gray-900">
                  {formIsAnonymous ? 'Demande anonyme' : 'Demande nominative'}
                </p>
                <p className="text-sm text-gray-500">
                  {formIsAnonymous 
                    ? 'Votre identité ne sera pas révélée' 
                    : 'Les responsables verront votre nom'}
                </p>
              </div>
            </div>

            {/* Contact */}
            {!formIsAnonymous && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment vous contacter ?</label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {[
                      { value: 'phone', label: 'Téléphone', icon: Phone },
                      { value: 'email', label: 'Email', icon: Mail },
                      { value: 'in_person', label: 'En personne', icon: User }
                    ].map(opt => {
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setFormContactPref(opt.value as HelpRequest['contactPreference'])}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                            formContactPref === opt.value 
                              ? 'border-[#ffc200] bg-[#fff3cc] text-[#5c4d00]' 
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  {formContactPref === 'phone' && (
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                      placeholder="Votre numéro de téléphone"
                    />
                  )}

                  {formContactPref === 'email' && (
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
                      placeholder="Votre adresse email"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={submitRequest}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-[#ffc200] text-white rounded-lg hover:bg-[#cc9b00] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {requests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">En attente</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-2xl font-bold text-[#cc9b00]">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">En cours</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Traitées</div>
          </div>
        </div>
      )}

      {/* Liste des demandes */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Mes demandes</h3>
        
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
            <p className="text-gray-500">
              Vous n&apos;avez pas encore fait de demande d&apos;aide
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => {
              const typeInfo = getTypeInfo(request.type)
              const TypeIcon = typeInfo.icon
              
              return (
                <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-500">{typeInfo.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getUrgencyBadge(request.urgency)}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>

                  {request.response && (
                    <div className="bg-[#fff3cc] border border-[#ffc200] rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-[#0a0a0a] mb-1">Réponse de l&apos;église :</p>
                      <p className="text-sm text-[#cc9b00]">{request.response}</p>
                      {request.assignedTo && (
                        <p className="text-xs text-[#cc9b00] mt-2 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Assigné à : {request.assignedTo}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(request.createdAt)}
                    </span>
                    
                    {request.status === 'pending' && (
                      <button
                        onClick={() => cancelRequest(request.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Contact d'urgence */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          En cas d&apos;urgence
        </h4>
        <p className="text-sm text-red-700 mb-3">
          Si vous avez une urgence immédiate, contactez directement le secrétariat de l&apos;église :
        </p>
        <div className="flex flex-wrap gap-4">
          <a href={`tel:${appSettings.emergency_phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-red-700 hover:underline">
            <Phone className="h-4 w-4" />
            {appSettings.emergency_phone}
          </a>
          <a href={`mailto:${appSettings.emergency_email}`} className="flex items-center gap-2 text-red-700 hover:underline">
            <Mail className="h-4 w-4" />
            {appSettings.emergency_email}
          </a>
        </div>
      </div>
    </div>
  )
}

export default HelpRequestPage