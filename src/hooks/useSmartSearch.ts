'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SearchSuggestion {
  id: string
  label: string
  icon: string
  description: string
  category: string
  action: string
  target: string
  requiresRole?: string[]
  keywords?: string[]
}

export const useSmartSearch = (
  user: { role: string },
  onTabChange?: (tab: string) => void,
  onProfileClick?: () => void
) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Actions rapides spécialisées
  const executeQuickAction = async (action: string, target: string) => {
    switch (action) {
      case 'quick-donate':
        // Navigation vers donation avec montant prérempli
        router.push(`/dashboard?tab=donations&amount=${target}&quick=true`)
        break
      
      case 'quick-prayer':
        // Navigation vers prières avec type urgent
        router.push(`/dashboard?tab=prayers&type=${target}&quick=true`)
        break
      
      case 'quick-praise':
        // Navigation vers témoignages avec type louange
        router.push(`/dashboard?tab=testimonies&type=${target}&quick=true`)
        break

      case 'quick-appointment':
        // Pré-remplir un rendez-vous urgent
        router.push(`/dashboard?tab=appointments&urgency=${target}&quick=true`)
        break

      default:
        console.warn('Action rapide non reconnue:', action)
    }
  }

  // Suggestions intelligentes avec phrases naturelles
  const suggestions: SearchSuggestion[] = [
    // Navigation principale
    { 
      id: 'home', 
      label: 'Aller à l\'accueil', 
      icon: '🏠', 
      description: 'Retourner à la page d\'accueil du ministère', 
      category: 'Navigation', 
      action: 'navigate', 
      target: '/dashboard',
      keywords: ['accueil', 'home', 'tableau de bord', 'dashboard']
    },
    
    // Prédications et contenus spirituels
    { 
      id: 'sermons', 
      label: 'Voir les dernières prédications', 
      icon: '📹', 
      description: 'Consulter les messages et enseignements récents', 
      category: 'Spirituel', 
      action: 'tab', 
      target: 'sermons',
      keywords: ['prédication', 'sermon', 'message', 'enseignement', 'pasteur', 'vidéo']
    },
    { 
      id: 'upload-sermon', 
      label: 'Ajouter une nouvelle prédication', 
      icon: '🎥', 
      description: 'Télécharger un nouveau message (pasteurs/admin)', 
      category: 'Spirituel', 
      action: 'navigate', 
      target: '/sermons/upload', 
      requiresRole: ['pasteur', 'admin'],
      keywords: ['upload', 'ajouter', 'télécharger', 'nouveau message']
    },
    
    // Donations et soutien financier
    { 
      id: 'donations', 
      label: 'Faire un don au ministère', 
      icon: '💰', 
      description: 'Soutenir financièrement l\'œuvre de Dieu', 
      category: 'Soutien', 
      action: 'tab', 
      target: 'donations',
      keywords: ['don', 'donation', 'soutien', 'argent', 'financer', 'donner']
    },
    { 
      id: 'quick-donation-1000', 
      label: 'Don rapide de 1000 FCFA', 
      icon: '⚡', 
      description: 'Faire un don express de mille francs', 
      category: 'Action Rapide', 
      action: 'quick-donate', 
      target: '1000',
      keywords: ['don rapide', 'mille', '1000', 'express', 'urgent']
    },
    { 
      id: 'quick-donation-5000', 
      label: 'Don rapide de 5000 FCFA', 
      icon: '⚡', 
      description: 'Faire un don express de cinq mille francs', 
      category: 'Action Rapide', 
      action: 'quick-donate', 
      target: '5000',
      keywords: ['don rapide', 'cinq mille', '5000', 'express']
    },
    
    // Rendez-vous et conseil pastoral
    { 
      id: 'appointments', 
      label: 'Prendre rendez-vous avec un pasteur', 
      icon: '📅', 
      description: 'Réserver un moment pour un conseil spirituel', 
      category: 'Conseil', 
      action: 'tab', 
      target: 'appointments',
      keywords: ['rendez-vous', 'rdv', 'pasteur', 'conseil', 'rencontrer', 'consultation']
    },
    { 
      id: 'urgent-appointment', 
      label: 'Rendez-vous urgent avec un pasteur', 
      icon: '🚨', 
      description: 'Demande de conseil pastoral prioritaire', 
      category: 'Action Rapide', 
      action: 'quick-appointment', 
      target: 'urgent',
      keywords: ['urgent', 'prioritaire', 'immédiat', 'critique']
    },
    
    // Prières et intercession
    { 
      id: 'prayers', 
      label: 'Soumettre une demande de prière', 
      icon: '🙏', 
      description: 'Partager un besoin d\'intercession avec la communauté', 
      category: 'Prière', 
      action: 'tab', 
      target: 'prayers',
      keywords: ['prière', 'intercession', 'demande', 'prier', 'besoin spirituel']
    },
    { 
      id: 'emergency-prayer', 
      label: 'Demande de prière urgente', 
      icon: '🚨', 
      description: 'Intercession prioritaire pour une situation critique', 
      category: 'Action Rapide', 
      action: 'quick-prayer', 
      target: 'urgent',
      keywords: ['prière urgente', 'intercession urgente', 'critique', 'immédiat']
    },
    
    // Témoignages et partage
    { 
      id: 'testimonies', 
      label: 'Partager mon témoignage', 
      icon: '📖', 
      description: 'Raconter ce que Dieu a fait dans ma vie', 
      category: 'Témoignage', 
      action: 'tab', 
      target: 'testimonies',
      keywords: ['témoignage', 'partager', 'histoire', 'miracle', 'bénédiction']
    },
    { 
      id: 'praise-testimony', 
      label: 'Témoignage de louange rapide', 
      icon: '🙌', 
      description: 'Partager une louange ou action de grâce', 
      category: 'Action Rapide', 
      action: 'quick-praise', 
      target: 'praise',
      keywords: ['louange', 'praise', 'action de grâce', 'merci', 'gloire']
    },
    
    // Communication et communauté
    { 
      id: 'chat', 
      label: 'Rejoindre la discussion communautaire', 
      icon: '💬', 
      description: 'Échanger avec les autres membres du ministère', 
      category: 'Communauté', 
      action: 'tab', 
      target: 'chat',
      keywords: ['chat', 'discussion', 'communauté', 'parler', 'échanger', 'message']
    },
    
    // Gestion du profil
    { 
      id: 'profile', 
      label: 'Gérer mon profil', 
      icon: '👤', 
      description: 'Modifier mes informations personnelles', 
      category: 'Profil', 
      action: 'navigate', 
      target: '/profile',
      keywords: ['profil', 'compte', 'informations', 'modifier', 'paramètres']
    },
    
    // Administration (selon le rôle)
    { 
      id: 'manage-members', 
      label: 'Gérer les membres', 
      icon: '👥', 
      description: 'Administration des comptes utilisateurs', 
      category: 'Administration', 
      action: 'navigate', 
      target: '/admin/members', 
      requiresRole: ['admin'],
      keywords: ['membres', 'utilisateurs', 'gestion', 'administration']
    },
    { 
      id: 'moderate-content', 
      label: 'Modérer le contenu', 
      icon: '🛡️', 
      description: 'Approuver ou rejeter les contenus soumis', 
      category: 'Administration', 
      action: 'navigate', 
      target: '/admin/moderation', 
      requiresRole: ['admin', 'pasteur'],
      keywords: ['modération', 'approuver', 'rejeter', 'contenu']
    }
  ]

  // Filtrage intelligent avec recherche dans les mots-clés
  const filteredSuggestions = suggestions.filter(suggestion => {
    // Vérifier si l'utilisateur a le rôle requis
    if (suggestion.requiresRole && !suggestion.requiresRole.includes(user.role.toLowerCase())) {
      return false
    }
    
    // Si pas de recherche, montrer les principales suggestions
    if (!searchQuery) {
      return ['Navigation', 'Spirituel', 'Soutien', 'Conseil', 'Prière'].includes(suggestion.category)
    }
    
    // Filtrage par texte de recherche (plus intelligent)
    const searchLower = searchQuery.toLowerCase()
    return suggestion.label.toLowerCase().includes(searchLower) ||
           suggestion.description.toLowerCase().includes(searchLower) ||
           suggestion.category.toLowerCase().includes(searchLower) ||
           (suggestion.keywords && suggestion.keywords.some(keyword => 
             keyword.toLowerCase().includes(searchLower) || 
             searchLower.includes(keyword.toLowerCase())
           ))
  })

  // Grouper les suggestions par catégorie
  const groupedSuggestions = filteredSuggestions.reduce((groups, suggestion) => {
    const category = suggestion.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(suggestion)
    return groups
  }, {} as Record<string, SearchSuggestion[]>)

  // Gérer le clic sur une suggestion
  const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
    try {
      switch (suggestion.action) {
        case 'navigate':
          router.push(suggestion.target)
          break
        
        case 'tab':
          onTabChange?.(suggestion.target)
          break
        
        case 'quick-donate':
        case 'quick-prayer':
        case 'quick-praise':
        case 'quick-appointment':
          await executeQuickAction(suggestion.action, suggestion.target)
          break
        
        default:
          // Fallback vers l'ancien système
          if (suggestion.id === 'profile') {
            onProfileClick?.()
          } else {
            onTabChange?.(suggestion.target || suggestion.id)
          }
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error)
    }
    
    // Fermer les suggestions
    setSearchQuery('')
    setShowSuggestions(false)
  }

  return {
    searchQuery,
    setSearchQuery,
    showSuggestions,
    setShowSuggestions,
    suggestions,
    filteredSuggestions,
    groupedSuggestions,
    handleSuggestionClick
  }
}