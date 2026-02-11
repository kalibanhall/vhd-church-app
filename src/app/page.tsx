/**
 * =============================================================================
 * MYCHURCHAPP
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

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Dashboard from '../components/Dashboard'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Utiliser replace au lieu de push pour éviter les problèmes de bouton retour
      router.replace('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffefa]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#fff3cc] border-t-[#ffc200]"></div>
      </div>
    )
  }

  // Si non connecté, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fffefa]">
      <Dashboard />
    </div>
  )
}
