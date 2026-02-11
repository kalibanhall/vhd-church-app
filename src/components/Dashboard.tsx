/**
 * =============================================================================
 * MYCHURCHAPP
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * Version: 1.0.4
 * Date: Janvier 2026
 * 
 * Dashboard principal avec:
 * - Navigation type application (pas de refresh web)
 * - Persistance de l'onglet actif
 * - Confirmation avant déconnexion
 * - Protection contre le retour arrière vers la connexion
 * - Design uniforme et professionnel
 * 
 * =============================================================================
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import LogoutConfirmModal from './ui/LogoutConfirmModal'
import Header from './layout/Header'
import Sidebar from './layout/Sidebar'
import HomePageSimple from './user/HomePageSimple'
import PreachingsPage from './user/PreachingsPageLive'
import DonationsPage from './user/DonationsPage'
import AppointmentsPage from './user/AppointmentsPage'
import PollsPage from './user/PollsPage'
import PrayersPage from './user/PrayersPage'
import TestimoniesPage from './user/TestimoniesPage'
import UserProfile from './user/UserProfile'
import ChatPageReal from './user/ChatPageReal'
import ContactPage from './ContactPage'
import AdminDashboard from './admin/AdminDashboard'
import MembersManagement from './admin/MembersManagement'
import EventsManagement from './admin/EventsManagement'
import PollsManagement from './admin/PollsManagement'
import AnalyticsPage from './admin/AnalyticsPage'
import PrayersTestimoniesValidation from './admin/PrayersTestimoniesValidation'
import NotificationsManagement from './admin/NotificationsManagement'
import AppointmentsManagement from './pastor/AppointmentsManagement'
import MemberAppointments from './member/MemberAppointments'
import VolunteerPage from './user/VolunteerPage'
import VolunteerManagement from './admin/VolunteerManagement'
import ActivitiesPage from './user/ActivitiesPage'
import ActivitiesManagement from './admin/ActivitiesManagement'
import TrainingPage from './user/TrainingPage'
import TrainingManagement from './admin/TrainingManagement'
import BiblePage from './user/BiblePage'
import NotesPage from './user/NotesPage'
import HelpRequestPage from './user/HelpRequestPage'
import HelpRequestsManagement from './admin/HelpRequestsManagement'
import SettingsManagement from './admin/SettingsManagement'

// Nouveaux modules - 16 fonctionnalités ajoutées
import NewsFeedPage from './user/NewsFeedPage'
import UrgentAlertsPage from './user/UrgentAlertsPage'
import PrayerCellPage from './user/PrayerCellPage'
import ServeYouPage from './user/ServeYouPage'
import FollowUpPage from './user/FollowUpPage'
import AskQuestionPage from './user/AskQuestionPage'
import ConflictResolutionPage from './user/ConflictResolutionPage'
import AbuseReportPage from './user/AbuseReportPage'
import MutualHelpPage from './user/MutualHelpPage'
import MarketplacePage from './user/MarketplacePage'
import LibraryPage from './user/LibraryPage'
import AudiobooksPage from './user/AudiobooksPage'
import GospelMusicPage from './user/GospelMusicPage'
import SongbookPage from './user/SongbookPage'
import PhotoGalleryPage from './user/PhotoGalleryPage'
import TransportPage from './user/TransportPage'

// Suppression des imports mockés - utilisation des API réelles

// Clés de stockage pour la persistance
const TAB_STORAGE_KEY = 'mychurchapp_active_tab';
const HISTORY_STORAGE_KEY = 'mychurchapp_tab_history';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [tabHistory, setTabHistory] = useState<string[]>(['home'])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isAppReady, setIsAppReady] = useState(false)
  const { user, logout } = useAuth()
  const searchParams = useSearchParams()
  
  // Charger l'état sauvegardé au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
        const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        
        if (savedTab) {
          setActiveTab(savedTab);
        }
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          if (Array.isArray(history) && history.length > 0) {
            setTabHistory(history);
          }
        }
      } catch (error) {
        console.error('Erreur chargement état:', error);
      }
      setIsAppReady(true);
    }
  }, []);

  // Sauvegarder l'état à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined' && isAppReady) {
      localStorage.setItem(TAB_STORAGE_KEY, activeTab);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(tabHistory.slice(-30)));
    }
  }, [activeTab, tabHistory, isAppReady]);

  // Gestion des paramètres d'URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && isAppReady) {
      handleTabChange(tab)
    }
  }, [searchParams, isAppReady])

  // Bloquer le bouton retour du navigateur
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ajouter une entrée dans l'historique
    window.history.pushState({ tab: activeTab }, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      
      // Re-pousser l'état pour maintenir la position
      window.history.pushState({ tab: activeTab }, '', window.location.href);
      
      // Utiliser notre navigation interne
      if (tabHistory.length > 1) {
        const newHistory = [...tabHistory];
        newHistory.pop();
        const previousTab = newHistory[newHistory.length - 1] || 'home';
        
        setTabHistory(newHistory);
        setActiveTab(previousTab);
      } else {
        // Si on est à la racine, afficher la confirmation de déconnexion
        setShowLogoutModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab, tabHistory]);
  const isAdmin = user?.role === 'ADMIN'
  const isPastor = user?.role === 'PASTOR'
  
  // Redirection automatique de l'ADMIN vers son dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN' && activeTab === 'home' && isAppReady) {
      handleTabChange('admin')
    }
  }, [user?.role, isAppReady])
  
  // Vérifier si on est dans l'espace admin (cohérent avec Sidebar.tsx)
  const adminOnlyTabs = ['admin', 'analytics', 'members', 'events', 'polls-admin', 'notifications', 'validate-testimonies', 'volunteer-admin', 'activities-admin', 'help-requests-admin', 'training-admin', 'settings-admin']
  const isInAdminSpace = adminOnlyTabs.includes(activeTab)
  
  // Fonction pour gérer le changement d'onglet avec persistance
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setTabHistory(prev => {
      // Éviter les doublons consécutifs
      if (prev[prev.length - 1] !== tab) {
        return [...prev, tab].slice(-30);
      }
      return prev;
    });
    
    // Auto-repli après sélection seulement si pas en mode admin strict
    if (!adminOnlyTabs.includes(tab)) {
      setIsSidebarCollapsed(true);
    }
  }, [adminOnlyTabs]);

  // Gérer la déconnexion avec nettoyage
  const handleLogout = useCallback(async () => {
    // Nettoyer le localStorage
    localStorage.removeItem(TAB_STORAGE_KEY);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    
    // Déconnecter
    await logout();
    setShowLogoutModal(false);
  }, [logout]);
  
  // Si pas d'utilisateur connecté ou app pas prête, afficher le loader
  if (!user || !isAppReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-church-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-church-light border-t-church-primary mx-auto mb-4"></div>
          <p className="text-church-text-muted font-medium">Chargement de l&apos;application...</p>
        </div>
      </div>
    )
  }

  // Les stats sont maintenant gérées directement dans chaque composant via leurs APIs respectives

  const renderCurrentPage = () => {
    // L'ADMIN peut maintenant accéder à toutes les pages via la sidebar
    // Pas de restriction de navigation pour permettre l'accès aux modules admin

    switch (activeTab) {
      case 'home':
        return <HomePageSimple />
      
      case 'sermons':
        return <PreachingsPage />
      
      case 'donations':
        return <DonationsPage />
      
      case 'appointments':
        // Redirection selon le rôle
        if (user?.role === 'PASTOR' || user?.role === 'ADMIN') {
          return <AppointmentsManagement />
        } else {
          return <MemberAppointments />
        }
      
      case 'polls':
        return <PollsPage />
      
      case 'prayers':
        return <PrayersPage />
      
      case 'testimonies':
        return <TestimoniesPage />
      
      case 'profile':
        return <UserProfile user={user} />
      
      case 'chat':
        return <ChatPageReal />
      
      case 'volunteer':
        return <VolunteerPage />
      
      case 'volunteer-admin':
        return <VolunteerManagement />
      
      case 'activities':
        return <ActivitiesPage />
      
      case 'activities-admin':
        return <ActivitiesManagement />
      
      case 'training':
        return <TrainingPage />
      
      case 'training-admin':
        return <TrainingManagement />
      
      case 'bible':
        return <BiblePage />
      
      case 'notes':
        return <NotesPage />
      
      case 'notes':
        return <NotesPage />
      
      case 'help':
        return <HelpRequestPage />
      
      case 'help-requests-admin':
        return <HelpRequestsManagement />
      
      case 'admin':
        return <AdminDashboard />
      
      case 'analytics':
        return <AnalyticsPage />
      
      case 'members':
        return <MembersManagement />

      case 'events':
        return <EventsManagement />

      case 'polls-admin':
        return <PollsManagement />

      case 'validate-testimonies':
        return <PrayersTestimoniesValidation />

      case 'notifications':
        return <NotificationsManagement />
      
      case 'settings-admin':
        return <SettingsManagement />
      
      case 'pastor-appointments':
        return <AppointmentsManagement />
      
      case 'facial-enrollment':
        // Rediriger vers la page d'enregistrement facial
        window.location.href = '/facial-enrollment'
        return null
      
      case 'facial-attendance':
        // Rediriger vers la page de pointage facial
        window.location.href = '/facial-attendance'
        return null
      
      // === NOUVEAUX MODULES - 16 fonctionnalités ===
      case 'news-feed':
        return <NewsFeedPage />
      
      case 'urgent-alerts':
        return <UrgentAlertsPage />
      
      case 'prayer-cell':
        return <PrayerCellPage />
      
      case 'serve-you':
        return <ServeYouPage />
      
      case 'follow-up':
        return <FollowUpPage />
      
      case 'ask-question':
        return <AskQuestionPage />
      
      case 'conflict-resolution':
        return <ConflictResolutionPage />
      
      case 'abuse-report':
        return <AbuseReportPage />
      
      case 'mutual-help':
        return <MutualHelpPage />
      
      case 'marketplace':
        return <MarketplacePage />
      
      case 'library':
        return <LibraryPage />
      
      case 'audiobooks':
        return <AudiobooksPage />
      
      case 'gospel-music':
        return <GospelMusicPage />
      
      case 'songbook':
        return <SongbookPage />
      
      case 'photo-gallery':
        return <PhotoGalleryPage />
      
      case 'transport':
        return <TransportPage />
      
      default:
        return <HomePageSimple />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-church-bg">
      {/* Modal de confirmation de déconnexion */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        userName={`${user.firstName} ${user.lastName}`}
      />

      {/* Navbar FIXE */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16">
        <Header
          user={user}
          onProfileClick={() => handleTabChange('profile')}
          onTabChange={handleTabChange}
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogoutClick={() => setShowLogoutModal(true)}
          hideMenuButton={false}
        />
      </div>

      {/* Conteneur principal avec sidebar et contenu */}
      <div className="flex flex-1 pt-14 md:pt-16 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userRole={user.role}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content - Scrollable avec hauteur fixe */}
        <div className={`flex-1 transition-all duration-300 ${
          isInAdminSpace && user?.role === 'ADMIN' ? 'ml-64' : 'ml-0'
        } h-full overflow-y-auto overflow-x-hidden`}>
          <main className="w-full max-w-full">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </div>
  )
}