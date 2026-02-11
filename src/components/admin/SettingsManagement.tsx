/**
 * =============================================================================
 * ADMIN - RÉGLAGES DE L'APPLICATION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Interface admin pour gérer les paramètres de l'application
 * (contacts, réseaux sociaux, horaires, etc.)
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner, { InlineLoader } from '@/components/ui/LoadingSpinner'
import {
  Settings,
  Save,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Building,
  X
} from 'lucide-react'

// Types
interface AppSetting {
  id: string
  key: string
  value: string
  category: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

// Catégories de paramètres
const settingCategories = [
  { id: 'contact', label: 'Informations de contact', icon: Phone },
  { id: 'social', label: 'Réseaux sociaux', icon: Globe },
  { id: 'hours', label: 'Horaires', icon: Clock },
  { id: 'general', label: 'Général', icon: Building }
]

// Configuration des champs par catégorie
const settingFields: Record<string, { key: string, label: string, type: string, placeholder: string, icon: React.ElementType }[]> = {
  contact: [
    { key: 'contact_email', label: 'Email de contact', type: 'email', placeholder: 'contact@mychurchapp.com', icon: Mail },
    { key: 'contact_phone', label: 'Téléphone principal', type: 'tel', placeholder: '+243 83 23 13 105', icon: Phone },
    { key: 'emergency_email', label: 'Email urgences', type: 'email', placeholder: 'urgence@mychurchapp.com', icon: Mail },
    { key: 'emergency_phone', label: 'Téléphone urgences', type: 'tel', placeholder: '+243 83 23 13 105', icon: Phone },
    { key: 'secretariat_phone', label: 'Téléphone secrétariat', type: 'tel', placeholder: '+243 83 23 13 105', icon: Phone },
    { key: 'church_address', label: 'Adresse de l\'église', type: 'text', placeholder: 'Adresse complète', icon: MapPin },
    { key: 'church_city', label: 'Ville', type: 'text', placeholder: 'Kinshasa', icon: MapPin },
    { key: 'church_country', label: 'Pays', type: 'text', placeholder: 'RDC', icon: MapPin }
  ],
  social: [
    { key: 'social_facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...', icon: Facebook },
    { key: 'social_instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...', icon: Instagram },
    { key: 'social_youtube', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/...', icon: Youtube },
    { key: 'social_twitter', label: 'Twitter/X', type: 'url', placeholder: 'https://twitter.com/...', icon: Globe },
    { key: 'social_whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '+243 83 23 13 105', icon: MessageCircle }
  ],
  hours: [
    { key: 'service_hours_sunday', label: 'Culte du dimanche', type: 'text', placeholder: '09h00 - 12h00', icon: Clock },
    { key: 'service_hours_wednesday', label: 'Réunion du mercredi', type: 'text', placeholder: '18h00 - 20h00', icon: Clock },
    { key: 'office_hours', label: 'Horaires du secrétariat', type: 'text', placeholder: 'Lun-Ven: 08h00 - 17h00', icon: Clock }
  ],
  general: [
    { key: 'church_name', label: 'Nom de l\'\u00e9glise', type: 'text', placeholder: 'MyChurchApp', icon: Building },
    { key: 'app_version', label: 'Version de l\'application', type: 'text', placeholder: '1.0.0', icon: Settings }
  ]
}

const SettingsManagement: React.FC = () => {
  // États
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [activeCategory, setActiveCategory] = useState('contact')
  const [hasChanges, setHasChanges] = useState(false)

  // Charger les paramètres
  useEffect(() => {
    loadSettings()
  }, [])

  // Détecter les changements
  useEffect(() => {
    const changed = Object.keys(settings).some(key => settings[key] !== originalSettings[key])
    setHasChanges(changed)
  }, [settings, originalSettings])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/settings-proxy?admin=true')
      if (response.ok) {
        const data = await response.json()
        const settingsMap: Record<string, string> = {}
        
        if (data.settings) {
          data.settings.forEach((setting: AppSetting) => {
            settingsMap[setting.key] = setting.value
          })
        }
        
        setSettings(settingsMap)
        setOriginalSettings(settingsMap)
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Préparer les paramètres modifiés
      const modifiedSettings = Object.keys(settings)
        .filter(key => settings[key] !== originalSettings[key])
        .map(key => ({ key, value: settings[key] }))

      if (modifiedSettings.length === 0) {
        setMessage({ type: 'info', text: 'Aucune modification à sauvegarder' })
        setSaving(false)
        return
      }

      const response = await authenticatedFetch('/api/settings-proxy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: modifiedSettings })
      })

      if (response.ok) {
        setOriginalSettings({ ...settings })
        setMessage({ type: 'success', text: '✅ Paramètres sauvegardés avec succès' })
        setHasChanges(false)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Annuler toutes les modifications ?')) {
      setSettings({ ...originalSettings })
      setMessage({ type: 'info', text: 'Modifications annulées' })
    }
  }

  if (loading) {
    return <LoadingSpinner size="md" text="Chargement des réglages..." />
  }

  const currentFields = settingFields[activeCategory] || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-bold">Réglages de l&apos;application</h1>
        </div>
        <p className="text-indigo-100">
          Configurez les informations de contact, horaires et réseaux sociaux de l&apos;église
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-[#fffefa] text-[#3d3200] border border-[#e6af00]'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : 
           message.type === 'error' ? <AlertCircle className="h-5 w-5" /> : null}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Actions en haut */}
      <div className="flex justify-between items-center">
        <button
          onClick={loadSettings}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>

        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
              hasChanges 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Navigation des catégories */}
      <div className="flex flex-wrap gap-2">
        {settingCategories.map(cat => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Formulaire des paramètres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentFields.map(field => {
            const Icon = field.icon
            const value = settings[field.key] || ''
            const hasChanged = value !== (originalSettings[field.key] || '')
            
            return (
              <div key={field.key} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Icon className="h-4 w-4 text-gray-400" />
                  {field.label}
                  {hasChanged && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Modifié
                    </span>
                  )}
                </label>
                <input
                  type={field.type}
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    hasChanged ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                  }`}
                />
              </div>
            )
          })}
        </div>

        {currentFields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun paramètre dans cette catégorie
          </div>
        )}
      </div>

      {/* Aperçu */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Aperçu des informations de contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Téléphone principal</div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-600" />
              {settings['contact_phone'] || 'Non défini'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Email</div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-600" />
              {settings['contact_email'] || 'Non défini'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Urgences</div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              <Phone className="h-4 w-4 text-red-600" />
              {settings['emergency_phone'] || 'Non défini'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsManagement


