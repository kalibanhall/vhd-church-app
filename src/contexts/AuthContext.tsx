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

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  phone?: string
  profileImageUrl?: string
  membershipNumber?: string
  membershipDate?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Détecter le montage côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const clearAuth = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token') // Nettoyage pour compatibilité
    }
  }

  const checkAuth = async () => {
    if (!isClient || typeof window === 'undefined') return
    
    try {
      console.log('[AuthContext] Vérification de l\'authentification...')
      
      // Récupérer le token du localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('[AuthContext] Pas de token trouvé')
        clearAuth()
        return
      }
      
      console.log('[AuthContext] Token trouvé, vérification...')
      
      // Utiliser la route proxy au lieu de l'appel direct
      const response = await fetch('/api/auth/me-proxy', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('[AuthContext] Statut de auth/me:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('[AuthContext] Données reçues:', data)
        if (data.success && data.user) {
          console.log('[AuthContext] Utilisateur authentifié:', data.user.email)
          setUser(data.user)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(data.user))
          }
        } else {
          console.log('[AuthContext] Données invalides, déconnexion')
          clearAuth()
        }
      } else {
        const errorData = await response.text()
        console.log('[AuthContext] Erreur', response.status, ':', errorData)
        clearAuth()
      }
    } catch (error) {
      console.error('[AuthContext] Erreur de vérification:', error)
      clearAuth()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    // Après connexion réussie, vérifier l'authentification
    await checkAuth()
  }

  const logout = async () => {
    try {
      // Logout via API Render (optionnel car le token est dans localStorage)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1'
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      clearAuth()
      // Utiliser replace pour éviter que le bouton retour ramène à une page authentifiée
      router.replace('/auth')
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isClient) {
      checkAuth()
    }
  }, [isClient])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}