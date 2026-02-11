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
  
  // Utiliser le hook de recherche intelligente
  const {
    searchQuery,
    setSearchQuery,
    showSuggestions,
    setShowSuggestions,
    groupedSuggestions,
    filteredSuggestions,
    handleSuggestionClick
  } = useSmartSearch(user, onTabChange, onProfileClick)

  const handleProfileClick = () => {
    router.push('/profile')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Search Bar */}
          <div className="flex-1 max-w-2xl">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
              />
              
              {/* Smart Suggestions Dropdown */}
              {showSuggestions && (searchQuery || Object.keys(groupedSuggestions).length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[32rem] overflow-y-auto">
                  {/* Header */}
                  {searchQuery === '' ? (
                    <div className="p-4 text-sm font-medium text-[#cc9b00] border-b bg-gradient-to-r from-[#fffefa] to-[#fff3cc]">
                      <div className="flex items-center space-x-2">
                        <span>🚀</span>
                        <span>Navigation intelligente MyChurchApp - Que souhaitez-vous faire ?</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-gray-600 border-b bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span>Résultats pour "{searchQuery}"</span>
                        <span className="text-[#cc9b00] font-medium">{filteredSuggestions.length} trouvé{filteredSuggestions.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Suggestions groupées */}
                  {Object.keys(groupedSuggestions).length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {Object.entries(groupedSuggestions).map(([category, categorysuggestions], categoryIndex) => (
                        <div key={category} className="border-b border-gray-100 last:border-b-0">
                          {/* Catégorie (uniquement si recherche active) */}
                          {searchQuery && Object.keys(groupedSuggestions).length > 1 && (
                            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-100">
                              <span className="flex items-center space-x-2">
                                <span>{getCategoryIcon(category)}</span>
                                <span>{category}</span>
                              </span>
                            </div>
                          )}
                          
                          {/* Suggestions de la catégorie */}
                          {categorysuggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.id}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full flex items-center space-x-4 px-4 py-4 hover:bg-[#fffefa] hover:border-l-4 hover:border-[#ffc200] transition-all text-left group focus:outline-none focus:bg-[#fffefa]"
                            >
                              <span className="text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                                {suggestion.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 group-hover:text-[#cc9b00] truncate">
                                  {suggestion.label}
                                </div>
                                <div className="text-sm text-gray-500 group-hover:text-[#cc9b00] line-clamp-2">
                                  {suggestion.description}
                                </div>
                                {suggestion.requiresRole && (
                                  <div className="text-xs text-orange-500 font-medium mt-1 flex items-center space-x-1">
                                    <span>🔒</span>
                                    <span>Réservé aux {suggestion.requiresRole.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                {getActionIcon(suggestion.action)}
                              </div>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="p-6 text-center">
                      <div className="text-gray-500 mb-3">
                        <span className="text-2xl mb-2 block">🔍</span>
                        Aucun résultat trouvé pour "{searchQuery}"
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>💡 Essayez des mots-clés comme :</div>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          {['prédication', 'don', 'prière', 'témoignage', 'rendez-vous', 'chat'].map(keyword => (
                            <span key={keyword} className="px-2 py-1 bg-gray-100 rounded text-gray-600">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Footer avec raccourcis */}
                  <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <span>💡</span>
                      <span>Tapez vos intentions naturellement</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Échap</kbd>
                      <span>pour fermer</span>
                    </span>
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

// Fonctions utilitaires pour les icônes
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Navigation': '🧭',
    'Spirituel': '✝️',
    'Soutien': '💰',
    'Conseil': '📅',
    'Prière': '🙏',
    'Témoignage': '📖',
    'Communauté': '👥',
    'Profil': '👤',
    'Administration': '⚙️',
    'Action Rapide': '⚡'
  }
  return icons[category] || '📂'
}

function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    'navigate': '↗️',
    'tab': '📋',
    'quick-donate': '⚡💰',
    'quick-prayer': '⚡🙏',
    'quick-praise': '⚡🙌',
    'quick-appointment': '⚡📅'
  }
  return icons[action] || '▶️'
}