/**
 * =============================================================================
 * SIDEBAR - NAVIGATION PRINCIPALE DE L'APPLICATION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Composant de navigation latérale avec gestion des rôles utilisateur.
 * Affiche différents menus selon le rôle (ADMIN, PASTOR, FIDELE, etc.)
 * 
 * Fonctionnalités:
 * - Navigation contextuelle selon le rôle utilisateur
 * - Sidebar collapsible pour mobile
 * - Titres d'espace personnalisés par rôle
 * - Menu déroulant pour le tableau de bord admin/pasteur
 * 
 * =============================================================================
 */

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Home,
  Video,
  Heart,
  Calendar,
  Users,
  Settings,
  DollarSign,
  BookOpen,
  MessageCircle,
  BarChart3,
  UserCheck,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Vote,
  Bell,
  ScanFace,
  UserCog,
  HeartHandshake,
  GraduationCap,
  BookMarked,
  FileText,
  HelpCircle,
  // Nouvelles icônes pour les 16 modules
  Newspaper,
  AlertTriangle,
  UserPlus,
  Scale,
  ShieldAlert,
  HeartPulse,
  ShoppingBag,
  Library,
  Headphones,
  Music,
  ImageIcon,
  Bus
} from 'lucide-react'

/**
 * Interface pour les propriétés du composant Sidebar
 * @param activeTab - Onglet actuellement actif
 * @param onTabChange - Fonction de callback pour changer d'onglet
 * @param userRole - Rôle de l'utilisateur connecté (ADMIN, PASTOR, FIDELE, etc.)
 * @param isCollapsed - État de la sidebar (repliée ou étendue)
 * @param onToggleCollapse - Fonction pour basculer l'état de la sidebar
 */
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ activeTab, onTabChange, userRole, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  // État pour contrôler l'ouverture/fermeture du menu déroulant du tableau de bord
  const [isDashboardOpen, setIsDashboardOpen] = useState(true)
  // Compteur de messages non lus pour le badge de discussion
  const [unreadChatCount, setUnreadChatCount] = useState(0)

  // Récupérer le nombre de messages non lus
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/unread-count')
      if (res.ok) {
        const data = await res.json()
        setUnreadChatCount(data.count ?? 0)
      }
    } catch {
      // Silently fail - badge just won't show
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Menu principal accessible à tous les utilisateurs (membres fidèles)
  // ADMIN n'a PAS accès à ce menu, uniquement au dashboard admin
  const userMenuItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'news-feed', label: 'Fil d\'actualité', icon: Newspaper },
    { id: 'urgent-alerts', label: 'Alertes urgentes', icon: AlertTriangle },
    { id: 'sermons', label: 'Prédications', icon: Video },
    { id: 'donations', label: 'Soutien à l\'œuvre', icon: DollarSign },
    { id: 'volunteer', label: 'Servir', icon: HeartHandshake },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'activities', label: 'Activités', icon: Calendar },
    { id: 'prayer-cell', label: 'Cellules de prière', icon: Users },
    { id: 'serve-you', label: 'Vous servir', icon: HeartHandshake },
    { id: 'follow-up', label: 'Être suivi', icon: UserPlus },
    { id: 'ask-question', label: 'Poser une question', icon: HelpCircle },
    { id: 'conflict-resolution', label: 'Résolution conflits', icon: Scale },
    { id: 'abuse-report', label: 'Signaler un abus', icon: ShieldAlert },
    { id: 'mutual-help', label: 'S\'entraider', icon: HeartPulse },
    { id: 'marketplace', label: 'Acheter/Vendre', icon: ShoppingBag },
    { id: 'training', label: 'Formations', icon: GraduationCap },
    { id: 'bible', label: 'Bible', icon: BookMarked },
    { id: 'library', label: 'Bibliothèque', icon: Library },
    { id: 'audiobooks', label: 'Livres audio', icon: Headphones },
    { id: 'gospel-music', label: 'Musique gospel', icon: Music },
    { id: 'songbook', label: 'Cantiques', icon: BookOpen },
    { id: 'photo-gallery', label: 'Galerie photos', icon: ImageIcon },
    { id: 'transport', label: 'Navette', icon: Bus },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'polls', label: 'Sondages', icon: Vote },
    { id: 'prayers', label: 'Prières', icon: Heart },
    { id: 'help', label: 'Besoin d\'aide', icon: HelpCircle },
    { id: 'testimonies', label: 'Témoignages', icon: BookOpen },
    { id: 'chat', label: 'Discussion', icon: MessageCircle },
  ]

  /**
   * Configuration des éléments du tableau de bord selon le rôle utilisateur
   * - PASTOR: Accès limité à la gestion des rendez-vous uniquement
   * - ADMIN: Accès complet à tous les outils d'administration
   */
  const dashboardSubItems = userRole === 'PASTOR' 
    ? [
        // Pasteurs : accès uniquement au gestionnaire de rendez-vous
        { id: 'pastor-appointments', label: 'Gestion rendez-vous', icon: UserCheck },
        { id: 'facial-enrollment', label: 'Enregistrement facial', icon: UserCog },
        { id: 'facial-attendance', label: 'Pointage facial', icon: ScanFace }
      ]
    : [
        // Admins : accès complet à tous les outils de gestion
        { id: 'admin', label: 'Vue d\'ensemble', icon: Settings },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'members', label: 'Gestion des membres', icon: Users },
        { id: 'events', label: 'Gestion d\'événements', icon: Calendar },
        { id: 'activities-admin', label: 'Gestion activités', icon: Calendar },
        { id: 'volunteer-admin', label: 'Gestion bénévoles', icon: HeartHandshake },
        { id: 'training-admin', label: 'Gestion formations', icon: GraduationCap },
        { id: 'help-requests-admin', label: 'Demandes d\'aide', icon: HelpCircle },
        { id: 'polls-admin', label: 'Gestion des sondages', icon: Vote },
        { id: 'notifications', label: 'Gestion des notifications', icon: Bell },
        { id: 'validate-testimonies', label: 'Validation témoignages', icon: CheckCircle },
        { id: 'pastor-appointments', label: 'Gestion rendez-vous', icon: UserCheck },
        { id: 'facial-enrollment', label: 'Enregistrement facial', icon: UserCog },
        { id: 'facial-attendance', label: 'Pointage facial', icon: ScanFace },
        { id: 'settings-admin', label: 'Réglages', icon: Settings }
      ]

  // Détermine si l'utilisateur a des privilèges d'administration
  const isAdminUser = userRole === 'ADMIN' || userRole === 'PASTOR'
  
  /**
   * Retourne le titre de l'espace selon le rôle de l'utilisateur
   * - ADMIN: Espace Admin (accès complet)
   * - PASTOR: Espace Pasteur (gestion rendez-vous)
   * - FIDELE: Espace Fidèle (membre de l'église)
   * - Autres: Espace Fidèle (par défaut)
   */
  const getSpaceTitle = () => {
    switch (userRole) {
      case 'ADMIN': return 'Espace Admin'
      case 'PASTOR': return 'Espace Pasteur'
      case 'FIDELE': return 'Espace Fidèle'
      default: return 'Espace Fidèle'
    }
  }
  
  // Titre du tableau de bord selon le rôle
  const getDashboardTitle = () => {
    switch (userRole) {
      case 'ADMIN': return 'Tableau de Bord Admin'
      case 'PASTOR': return 'Tableau de Bord Pasteur'
      default: return 'Tableau de Bord'
    }
  }
  
  // Vérifier si on est dans l'espace admin
  const adminOnlyTabs = ['admin', 'analytics', 'members', 'events', 'polls-admin', 'notifications', 'validate-testimonies', 'activities-admin', 'volunteer-admin', 'help-requests-admin', 'training-admin', 'settings-admin']
  const isInAdminSpace = adminOnlyTabs.includes(activeTab)
  
  // Vérifier si on est dans l'espace de travail spécialisé (admin ou pasteur)
  const isInSpecializedSpace = userRole === 'ADMIN' 
    ? isInAdminSpace || activeTab === 'pastor-appointments'
    : activeTab === 'pastor-appointments'

  // La sidebar est visible/cachée selon l'état isCollapsed pour tous les utilisateurs
  const shouldBeVisible = !isCollapsed

  // Gérer le clic sur un élément du menu avec auto-repli
  const handleMenuItemClick = (itemId: string) => {
    onTabChange(itemId)
    // Ne pas replier automatiquement sur desktop, seulement sur mobile
    // L'auto-repli est géré dans Dashboard.tsx
  }

  return (
    <div>
      {/* Overlay pour mobile quand la sidebar est ouverte - Pas en mode spécialisé */}
      {!isCollapsed && !isInSpecializedSpace && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggleCollapse}
        />
      )}
      
      <aside className={`fixed left-0 top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-gradient-to-b from-[#ffc200] via-[#e6af00] to-[#cc9b00] text-[#0a0a0a] z-40 flex flex-col transition-all duration-300 ease-in-out w-64 ${
        shouldBeVisible ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header avec Logo - Affiché pour tous sauf ADMIN */}
        {userRole !== 'ADMIN' && (
          <div className="p-2 md:p-3 border-b border-[#cc9b00]">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                {/* Logo MyChurchApp - Taille réduite */}
                <div className="mb-1 md:mb-2 flex justify-center">
                  <Image
                    src="/images/logos/mychurchapp-logo.svg"
                    alt="Logo MyChurchApp"
                    width={40}
                    height={40}
                    className="md:w-[50px] md:h-[50px] rounded-full border border-[#fff3cc] object-cover"
                  />
                </div>
                <h1 className="text-xs md:text-sm font-bold text-[#0a0a0a] leading-tight">MyChurchApp</h1>
                <p className="text-[#5c4d00] text-xs hidden md:block">{getSpaceTitle()}</p>
              </div>
              {/* Bouton de fermeture sidebar */}
              <button
                onClick={onToggleCollapse}
                className="text-[#5c4d00] hover:text-[#0a0a0a] p-1 rounded transition-colors ml-2"
                title="Masquer le menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      {/* Navigation - Padding réduit */}
      <nav className="flex-1 p-2 md:p-4 overflow-y-auto scrollbar-hide">
        <ul className="space-y-2">
          {/* Menu utilisateur normal - Affiché UNIQUEMENT pour les non-ADMIN */}
          {/* Les ADMIN voient UNIQUEMENT leur menu admin */}
          {userRole !== 'ADMIN' && userMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#0a0a0a]/20 text-[#0a0a0a] font-bold'
                      : 'text-[#3d3200] hover:bg-[#0a0a0a]/10 hover:text-[#0a0a0a]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.id === 'chat' && unreadChatCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadChatCount > 99 ? '99+' : unreadChatCount}
                    </span>
                  )}
                </button>
              </li>
            )
          })}

          {/* Section Tableau de bord pour PASTOR seulement (dans menu normal) */}
          {userRole === 'PASTOR' && !isInSpecializedSpace && (
            <li>
              <button
                onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-3 text-left rounded-lg transition-colors text-[#3d3200] hover:bg-[#0a0a0a]/10 hover:text-[#0a0a0a] mt-4`}
                title={isCollapsed ? 'Tableau de Bord' : undefined}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                  <Settings className="h-5 w-5" />
                  {!isCollapsed && <span className="font-medium">Tableau de Bord</span>}
                </div>
                {!isCollapsed && (isDashboardOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
              </button>

              {/* Sous-menu Tableau de bord */}
              {isDashboardOpen && !isCollapsed && (
                <ul className="mt-2 ml-4 space-y-1">
                  {dashboardSubItems.map((subItem) => {
                    const SubIcon = subItem.icon
                    return (
                      <li key={subItem.id}>
                        <button
                          onClick={() => handleMenuItemClick(subItem.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-left rounded-lg transition-colors ${
                            activeTab === subItem.id
                              ? 'bg-[#0a0a0a]/20 text-[#0a0a0a] font-bold'
                              : 'text-[#5c4d00] hover:bg-[#0a0a0a]/10 hover:text-[#0a0a0a]'
                          }`}
                        >
                          <SubIcon className="h-4 w-4" />
                          <span className="text-sm">{subItem.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )}

          {/* Interface spécialisée - Tableau de bord admin (ADMIN voit UNIQUEMENT ça) */}
          {isAdminUser && (userRole === 'ADMIN' || isInSpecializedSpace) && (
            <li>
              {/* Titre Tableau de Bord avec icône Settings */}
              {!isCollapsed && (
                <div className="flex items-center justify-between px-4 py-3 text-[#3d3200] mb-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">{getDashboardTitle()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Bouton retour pour les pasteurs */}
                    {userRole === 'PASTOR' && activeTab === 'pastor-appointments' && (
                      <button
                        onClick={() => handleMenuItemClick('home')}
                        className="text-[#5c4d00] hover:text-[#0a0a0a] p-1 rounded transition-colors"
                        title="Retour au menu principal"
                      >
                        <Home className="h-4 w-4" />
                      </button>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* Liste des fonctions admin - Style direct comme dans l'image */}
              <ul className="space-y-1">
                {dashboardSubItems.map((subItem) => {
                  const SubIcon = subItem.icon
                  return (
                    <li key={subItem.id}>
                      <button
                        onClick={() => handleMenuItemClick(subItem.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                          activeTab === subItem.id
                            ? 'bg-[#0a0a0a]/20 text-[#0a0a0a] font-bold'
                            : 'text-[#3d3200] hover:bg-[#0a0a0a]/10 hover:text-[#0a0a0a]'
                        }`}
                        title={isCollapsed ? subItem.label : undefined}
                      >
                        <SubIcon className="h-5 w-5" />
                        {!isCollapsed && <span className="font-medium">{subItem.label}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#cc9b00] mt-auto">
        <div className="text-center text-[#5c4d00] text-sm">
          <p>Version 1.0.3</p>
          <p>© 2025 My Church App</p>
        </div>
      </div>
    </aside>
    </div>
  )
}