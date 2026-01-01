/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * Version: 1.0.3
 * Date: Octobre 2025
 * 
 * =============================================================================
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
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

// Suppression des imports mockés - utilisation des API réelles

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true) // Replié par défaut comme Gmail
  const { user } = useAuth()
  const searchParams = useSearchParams()
  
  // Gestion des paramètres d'URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])
  const isAdmin = user?.role === 'ADMIN'
  const isPastor = user?.role === 'PASTOR'
  
  // Redirection automatique de l'ADMIN vers son dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN' && activeTab === 'home') {
      setActiveTab('admin')
    }
  }, [user?.role, activeTab])
  
  // Vérifier si on est dans l'espace admin (cohérent avec Sidebar.tsx)
  const adminOnlyTabs = ['admin', 'analytics', 'members', 'events', 'polls-admin', 'notifications', 'validate-testimonies', 'volunteer-admin', 'activities-admin', 'help-requests-admin', 'training-admin']
  const isInAdminSpace = adminOnlyTabs.includes(activeTab)
  
  // Fonction pour gérer le changement d'onglet avec auto-repli
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Auto-repli après sélection seulement si pas en mode admin strict
    if (!adminOnlyTabs.includes(tab)) {
      setIsSidebarCollapsed(true)
    }
  }
  
  // Si pas d'utilisateur connecté, ne rien afficher
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      
      default:
        return <HomePageSimple />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar VRAIMENT FIXE - AU-DESSUS DE TOUT - Hauteur réduite mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16">
        <Header
          user={user}
          onProfileClick={() => handleTabChange('profile')}
          onTabChange={handleTabChange}
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
          <main className="w-full max-w-full p-4 md:p-6">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </div>
  )
}