'use client'

import { useState } from 'react'
import { Search, User, LogOut, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import NotificationsPanel from '../ui/NotificationsPanel'

interface HeaderProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
    profileImageUrl?: string;
  };
  onProfileClick?: () => void;
  onTabChange?: (tab: string) => void;
  onMenuClick?: () => void;
  onLogoutClick?: () => void;
  hideMenuButton?: boolean;
}

export default function Header({ user, onProfileClick, onTabChange, onMenuClick, onLogoutClick, hideMenuButton = false }: HeaderProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Liens simples et directs
  const searchResults = [
    { id: 'home', text: 'Accueil', url: '/dashboard' },
    { id: 'sermons', text: 'Prédications', action: 'tab', target: 'sermons' },
    { id: 'donations', text: 'Faire un don', action: 'tab', target: 'donations' },
    { id: 'appointments', text: 'Prendre rendez-vous', action: 'tab', target: 'appointments' },
    { id: 'prayers', text: 'Demandes de prière', action: 'tab', target: 'prayers' },
    { id: 'testimonies', text: 'Témoignages', action: 'tab', target: 'testimonies' },
    { id: 'chat', text: 'Chat communauté', action: 'tab', target: 'chat' },
    { id: 'profile', text: 'Mon profil', url: '/profile' },
  ]

  // Ajouter des liens admin si l'utilisateur est admin
  if (user.role.toLowerCase() === 'admin') {
    searchResults.push(
      { id: 'manage-members', text: 'Gérer les membres', url: '/admin/members' },
      { id: 'moderation', text: 'Modération', url: '/admin/moderation' }
    )
  }

  // Filtrer selon la recherche
  const filteredResults = searchQuery 
    ? searchResults.filter(item => 
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchResults

  const handleResultClick = (result: any) => {
    if (result.url) {
      router.push(result.url)
    } else if (result.action === 'tab') {
      onTabChange?.(result.target)
    }
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  return (
    <header className="bg-gradient-to-r from-[#ffc200] via-[#e6af00] to-[#cc9b00] shadow-md border-b border-[#cc9b00] w-full">
      <div className="px-3 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          {/* Bouton Menu (style Gmail mobile) - visible sur mobile et desktop sauf en mode admin */}
          {!hideMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-1.5 md:p-2 rounded-lg hover:bg-[#0a0a0a]/10 transition-colors flex-shrink-0"
              title="Menu"
            >
              <Menu className="h-5 w-5 md:h-6 md:w-6 text-[#0a0a0a]" />
            </button>
          )}
          
          {/* Simple Search Bar */}
          <div className={`flex-1 max-w-md ${hideMenuButton ? '' : 'ml-2 md:ml-4'}`}>
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-[#5c4d00] h-4 w-4 md:h-5 md:w-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 text-sm bg-white/90 border border-[#cc9b00] rounded-lg focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent placeholder-[#5c4d00]"
              />
              
              {/* Simple Results Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 md:mt-2 bg-white border border-[#cc9b00] rounded-lg shadow-lg z-50 max-h-64 md:max-h-80 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    <>
                      {searchQuery && (
                        <div className="p-2 text-xs md:text-sm text-[#5c4d00] border-b border-[#fff3cc]">
                          {filteredResults.length} résultat(s) trouvé(s)
                        </div>
                      )}
                      {filteredResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-3 md:px-4 py-2 md:py-3 text-left text-sm hover:bg-[#fff3cc] border-b border-[#fff3cc] last:border-b-0 transition-colors"
                        >
                          <div className="text-[#0a0a0a]">{result.text}</div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-3 md:p-4 text-[#5c4d00] text-center text-sm">
                      Aucun résultat trouvé
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notifications */}
            <NotificationsPanel />

            {/* User Profile avec Menu Déroulant */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                onBlur={() => setTimeout(() => setShowProfileMenu(false), 200)}
                className="flex items-center space-x-2 md:space-x-3 p-1.5 md:p-2 rounded-lg hover:bg-[#0a0a0a]/10 transition-colors"
              >
                {/* Photo de profil ou icône par défaut */}
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Photo de profil"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-[#0a0a0a]"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 md:h-6 md:w-6 text-[#ffc200]" />
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="font-semibold text-[#0a0a0a] text-sm">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-[#3d3200] capitalize">{user.role.toLowerCase()}</p>
                </div>
              </button>

              {/* Menu déroulant Profil/Déconnexion */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-1 md:mt-2 w-48 md:w-56 bg-white border border-[#cc9b00] rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      onProfileClick ? onProfileClick() : handleProfileClick()
                    }}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-left hover:bg-[#fff3cc] flex items-center space-x-2 md:space-x-3 border-b border-[#fff3cc] text-sm"
                  >
                    <User className="h-4 w-4 md:h-5 md:w-5 text-[#cc9b00]" />
                    <span className="text-[#0a0a0a]">Profil</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      if (onLogoutClick) {
                        onLogoutClick()
                      } else {
                        setShowLogoutConfirm(true)
                      }
                    }}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-left hover:bg-red-50 flex items-center space-x-2 md:space-x-3 text-red-600 text-sm"
                  >
                    <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de déconnexion */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la déconnexion</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ? Toutes les données non sauvegardées seront perdues.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false)
                    logout()
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}