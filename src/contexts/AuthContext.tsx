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
  const router = useRouter()

  const clearAuth = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token') // Nettoyage pour compatibilité
  }

  const checkAuth = async () => {
    try {
      console.log('🔍 AuthContext: Vérification de l\'authentification...')
      
      // Vérification via API
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })

      console.log('📊 AuthContext: Statut de /api/auth/me:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ AuthContext: Données reçues:', data)
        if (data.success && data.user) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          console.log('⚠️  AuthContext: Données invalides, déconnexion')
          clearAuth()
        }
      } else {
        const errorData = await response.text()
        console.log('❌ AuthContext: Erreur', response.status, ':', errorData)
        clearAuth()
      }
    } catch (error) {
      console.error('💥 AuthContext: Erreur de vérification:', error)
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
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      clearAuth()
      router.push('/auth')
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

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