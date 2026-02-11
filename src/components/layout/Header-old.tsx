'use client'

import { Search, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useSmartSearch } from '../../hooks/useSmartSearch'
import NotificationsPanel from '../ui/NotificationsPanel'

interface HeaderProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
  onProfileClick?: () => void;
  onTabChange?: (tab: string) => void;
}

export default function Header({ user, onProfileClick, onTabChange }: HeaderProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Suggestions intelligentes avec phrases naturelles et actions directes
  const suggestions = [
    // Navigation principale
    { id: 'home', label: 'Aller à l\'accueil', icon: '🏠', description: 'Retourner à la page d\'accueil du ministère', category: 'Navigation', action: 'navigate', target: '/dashboard' },
    
    // Prédications et contenus
    { id: 'sermons', label: 'Voir les dernières prédications', icon: '📹', description: 'Consulter les messages et enseignements récents', category: 'Spirituel', action: 'tab', target: 'sermons' },
    { id: 'upload-sermon', label: 'Ajouter une nouvelle prédication', icon: '🎥', description: 'Télécharger un nouveau message (pasteurs/admin)', category: 'Spirituel', action: 'navigate', target: '/sermons/upload', requiresRole: ['pasteur', 'admin'] },
    { id: 'search-sermons', label: 'Rechercher dans les prédications', icon: '🔍', description: 'Trouver un message spécifique par titre ou pasteur', category: 'Spirituel', action: 'tab', target: 'sermons' },
    
    // Donations et soutien
    { id: 'donations', label: 'Faire un don au ministère', icon: '💰', description: 'Soutenir financièrement l\'œuvre de Dieu', category: 'Soutien', action: 'tab', target: 'donations' },
    { id: 'donation-projects', label: 'Voir les projets de donation', icon: '🎯', description: 'Consulter les projets spécifiques à soutenir', category: 'Soutien', action: 'tab', target: 'donations' },
    { id: 'donation-history', label: 'Mon historique de dons', icon: '📊', description: 'Voir mes contributions précédentes', category: 'Soutien', action: 'navigate', target: '/donations/history' },
    
    // Rendez-vous et conseil
    { id: 'appointments', label: 'Prendre rendez-vous avec un pasteur', icon: '📅', description: 'Réserver un moment pour un conseil spirituel', category: 'Conseil', action: 'tab', target: 'appointments' },
    { id: 'my-appointments', label: 'Mes rendez-vous programmés', icon: '🗓️', description: 'Voir mes rendez-vous à venir', category: 'Conseil', action: 'tab', target: 'appointments' },
    { id: 'cancel-appointment', label: 'Annuler un rendez-vous', icon: '❌', description: 'Modifier ou annuler un rendez-vous existant', category: 'Conseil', action: 'tab', target: 'appointments' },
    
    // Prières et intercession
    { id: 'prayers', label: 'Soumettre une demande de prière', icon: '🙏', description: 'Partager un besoin d\'intercession', category: 'Prière', action: 'tab', target: 'prayers' },
    { id: 'prayer-list', label: 'Liste des demandes de prière', icon: '�', description: 'Voir toutes les demandes d\'intercession', category: 'Prière', action: 'tab', target: 'prayers' },
    { id: 'prayer-groups', label: 'Rejoindre un groupe de prière', icon: '👥', description: 'Participer aux groupes d\'intercession', category: 'Prière', action: 'navigate', target: '/prayer-groups' },
    
    // Témoignages et partage
    { id: 'testimonies', label: 'Partager mon témoignage', icon: '📖', description: 'Raconter ce que Dieu a fait dans ma vie', category: 'Témoignage', action: 'tab', target: 'testimonies' },
    { id: 'read-testimonies', label: 'Lire les témoignages', icon: '�️', description: 'Découvrir les œuvres de Dieu dans nos vies', category: 'Témoignage', action: 'tab', target: 'testimonies' },
    { id: 'share-testimony', label: 'Encourager par un témoignage', icon: '💭', description: 'Partager une expérience édifiante', category: 'Témoignage', action: 'tab', target: 'testimonies' },
    
    // Communication et communauté
    { id: 'chat', label: 'Rejoindre la discussion communautaire', icon: '💬', description: 'Échanger avec les autres membres', category: 'Communauté', action: 'tab', target: 'chat' },
    { id: 'send-message', label: 'Envoyer un message', icon: '✉️', description: 'Communiquer avec la communauté', category: 'Communauté', action: 'tab', target: 'chat' },
    { id: 'community-events', label: 'Événements de la communauté', icon: '🎉', description: 'Voir les activités et événements à venir', category: 'Communauté', action: 'navigate', target: '/events' },
    
    // Gestion du profil
    { id: 'profile', label: 'Gérer mon profil', icon: '👤', description: 'Modifier mes informations personnelles', category: 'Profil', action: 'navigate', target: '/profile' },
    { id: 'change-password', label: 'Changer mon mot de passe', icon: '�', description: 'Mettre à jour mes informations de sécurité', category: 'Profil', action: 'navigate', target: '/profile?tab=security' },
    { id: 'notification-settings', label: 'Gérer mes notifications', icon: '🔔', description: 'Configurer les alertes et notifications', category: 'Profil', action: 'navigate', target: '/profile?tab=notifications' },
    
    // Administration (selon le rôle)
    { id: 'manage-members', label: 'Gérer les membres', icon: '👥', description: 'Administration des comptes utilisateurs', category: 'Admin', action: 'navigate', target: '/admin/members', requiresRole: ['admin'] },
    { id: 'moderate-content', label: 'Modérer le contenu', icon: '🛡️', description: 'Approuver ou rejeter les contenus soumis', category: 'Admin', action: 'navigate', target: '/admin/moderation', requiresRole: ['admin', 'pasteur'] },
    { id: 'view-statistics', label: 'Voir les statistiques', icon: '📈', description: 'Consulter les métriques de l\'application', category: 'Admin', action: 'navigate', target: '/admin/stats', requiresRole: ['admin'] },
    
    // Actions rapides contextuelles
    { id: 'quick-donation', label: 'Don rapide de 1000 FCFA', icon: '⚡', description: 'Faire un don express', category: 'Action', action: 'quick-donate', target: '1000' },
    { id: 'emergency-prayer', label: 'Prière urgente', icon: '🚨', description: 'Demande de prière prioritaire', category: 'Action', action: 'quick-prayer', target: 'urgent' },
    { id: 'praise-god', label: 'Témoignage de louange', icon: '🙌', description: 'Partager une louange rapide', category: 'Action', action: 'quick-praise', target: 'praise' }
  ]

  // Filtrage intelligent avec prise en compte des rôles
  const filteredSuggestions = suggestions.filter(suggestion => {
    // Vérifier si l'utilisateur a le rôle requis
    if (suggestion.requiresRole && !suggestion.requiresRole.includes(user.role.toLowerCase())) {
      return false
    }
    
    // Filtrage par texte de recherche
    const searchLower = searchQuery.toLowerCase()
    return suggestion.label.toLowerCase().includes(searchLower) ||
           suggestion.description.toLowerCase().includes(searchLower) ||
           suggestion.category.toLowerCase().includes(searchLower)
  })

  // Grouper les suggestions par catégorie pour un affichage organisé
  const groupedSuggestions = filteredSuggestions.reduce((groups, suggestion) => {
    const category = suggestion.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(suggestion)
    return groups
  }, {} as Record<string, typeof filteredSuggestions>)

  const handleSuggestionClick = (suggestion: any) => {
    switch (suggestion.action) {
      case 'navigate':
        router.push(suggestion.target)
        break
      
      case 'tab':
        onTabChange?.(suggestion.target)
        break
      
      case 'quick-donate':
        // Navigation vers donation avec montant prérempli
        router.push(`/dashboard?tab=donations&amount=${suggestion.target}`)
        break
      
      case 'quick-prayer':
        // Navigation vers prières avec type urgent
        router.push(`/dashboard?tab=prayers&type=${suggestion.target}`)
        break
      
      case 'quick-praise':
        // Navigation vers témoignages avec type louange
        router.push(`/dashboard?tab=testimonies&type=${suggestion.target}`)
        break
      
      default:
        // Fallback vers l'ancien système
        if (suggestion.id === 'profile') {
          onProfileClick?.()
        } else {
          onTabChange?.(suggestion.target || suggestion.id)
        }
    }
    
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Que voulez-vous faire ? Ex: faire un don, voir les prédications, prendre rendez-vous..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSuggestions(false)
                    setSearchQuery('')
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-transparent text-sm"
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && (searchQuery || Object.keys(groupedSuggestions).length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchQuery === '' ? (
                    <div className="p-3 text-sm font-medium text-[#cc9b00] border-b bg-[#fffefa]">
                      🚀 Navigation intelligente MyChurchApp - Que souhaitez-vous faire ?
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-gray-500 border-b">
                      Résultats pour "{searchQuery}" ({filteredSuggestions.length} trouvé{filteredSuggestions.length > 1 ? 's' : ''}) :
                    </div>
                  )}
                  
                  {Object.keys(groupedSuggestions).length > 0 ? (
                    Object.entries(groupedSuggestions).map(([category, categorysuggestions]) => (
                      <div key={category} className="border-b border-gray-100 last:border-b-0">
                        {searchQuery && (
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {category}
                          </div>
                        )}
                        
                        {categorysuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#fffefa] hover:border-l-4 hover:border-[#ffc200] transition-all text-left group"
                          >
                            <span className="text-xl group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-[#cc9b00]">{suggestion.label}</div>
                              <div className="text-sm text-gray-500 group-hover:text-[#cc9b00]">{suggestion.description}</div>
                              {suggestion.requiresRole && (
                                <div className="text-xs text-orange-500 font-medium mt-1">
                                  🔒 Réservé aux {suggestion.requiresRole.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {suggestion.action === 'navigate' && '↗️'}
                              {suggestion.action === 'tab' && '📋'}
                              {suggestion.action?.startsWith('quick-') && '⚡'}
                            </div>
                          </button>
                        ))}
                      </div>
                    ))
                  ) : searchQuery ? (
                    <div className="p-4 text-center">
                      <div className="text-gray-500 mb-2">Aucun résultat trouvé pour "{searchQuery}"</div>
                      <div className="text-xs text-gray-400">
                        Essayez des mots-clés comme : prédication, don, prière, témoignage, rendez-vous, chat
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Footer avec raccourcis clavier */}
                  <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
                    <span>💡 Astuce : Tapez vos intentions naturellement</span>
                    <span>Échap pour fermer</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationsPanel />

            {/* User Profile */}
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#ffc200] to-[#cc9b00] rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}