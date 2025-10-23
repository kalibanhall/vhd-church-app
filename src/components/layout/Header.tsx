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
  hideMenuButton?: boolean;
}

export default function Header({ user, onProfileClick, onTabChange, onMenuClick, hideMenuButton = false }: HeaderProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 w-full z-50">
      <div className="px-6 py-4">
  <div className="flex items-center justify-between">
          {/* Bouton Menu (style Gmail mobile) - visible sur mobile et desktop sauf en mode admin */}
          {!hideMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-base md:text-lg"
              title="Menu"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          )}
          
          {/* Simple Search Bar */}
          <div className={`flex-1 max-w-lg ${hideMenuButton ? '' : 'ml-4'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
              />
              
              {/* Simple Results Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    <>
                      {searchQuery && (
                        <div className="p-2 text-sm text-gray-500 border-b">
                          {filteredResults.length} résultat(s) trouvé(s)
                        </div>
                      )}
                      {filteredResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="text-gray-900">{result.text}</div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-4 text-gray-500 text-center">
                      Aucun résultat trouvé
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationsPanel />

            {/* User Profile */}
            {/* Photo de profil cliquable uniquement, sans texte résumé */}
            <button
              onClick={onProfileClick || handleProfileClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Profil"
            >
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Photo de profil"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </button>

            {/* Menu déroulant du profil avec accès au profil et déconnexion */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Profil">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-500" />
                )}
                <span className="font-semibold text-gray-900 text-base md:text-lg">{user.firstName} {user.lastName}</span>
                <svg className="w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profil" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-gray-500" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-base md:text-lg"
                >
                  <User className="h-5 w-5 mr-2" />
                  Profil
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 text-base md:text-lg"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Déconnexion
                </button>
              </div>
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