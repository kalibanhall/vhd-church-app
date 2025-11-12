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
import PreachingsPage from './user/PreachingsPageSimple'
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
  const adminOnlyTabs = ['admin', 'analytics', 'members', 'events', 'polls-admin', 'notifications', 'validate-testimonies']
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
    // Restriction ADMIN : uniquement accès au dashboard admin
    if (user?.role === 'ADMIN' && !adminOnlyTabs.includes(activeTab) && activeTab !== 'pastor-appointments' && activeTab !== 'facial-enrollment' && activeTab !== 'facial-attendance' && activeTab !== 'profile') {
      // Rediriger vers le dashboard admin
      setActiveTab('admin')
      return <AdminDashboard />
    }

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole={user.role}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        isInAdminSpace && user?.role === 'ADMIN' ? 'ml-64' : 'ml-0'
      }`}>
        <Header
          user={user}
          onProfileClick={() => handleTabChange('profile')}
          onTabChange={handleTabChange}
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          hideMenuButton={isInAdminSpace}
        />

        <main className="p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  )
}