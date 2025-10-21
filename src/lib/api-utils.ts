/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID - API UTILITIES
 * =============================================================================
 * 
 * Fonctions utilitaires pour les appels API avec authentification par cookies
 * =============================================================================
 */

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Fonction générique pour faire des appels API avec authentification par cookies
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      credentials: 'include', // Important pour envoyer les cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erreur ${response.status}`,
        data: data
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error(`Erreur API ${endpoint}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur réseau'
    }
  }
}

/**
 * Fonctions spécialisées pour chaque type d'API
 */

// Donations
export const donationsAPI = {
  async getAll(): Promise<ApiResponse<{ donations: any[], total: number }>> {
    return apiCall('/api/donations')
  },

  async create(donationData: {
    amount: number
    donationType: string
    paymentMethod: string
    projectId?: string
    notes?: string
  }): Promise<ApiResponse<any>> {
    return apiCall('/api/donations', {
      method: 'POST',
      body: JSON.stringify(donationData)
    })
  }
}

// Appointments  
export const appointmentsAPI = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiCall('/api/appointments')
  },

  async create(appointmentData: {
    pastorId: string
    appointmentDate: string
    startTime: string
    endTime: string
    reason: string
    location?: string
  }): Promise<ApiResponse<any>> {
    return apiCall('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    })
  }
}

// Prayers
export const prayersAPI = {
  async getAll(userId?: string): Promise<ApiResponse<any[]>> {
    const url = userId ? `/api/prayers?userId=${userId}` : '/api/prayers'
    return apiCall(url)
  },

  async create(prayerData: {
    title: string
    content: string
    category?: string
    isPublic?: boolean
    isAnonymous?: boolean
  }, userId: string): Promise<ApiResponse<any>> {
    return apiCall(`/api/prayers?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(prayerData)
    })
  }
}

// Testimonies
export const testimoniesAPI = {
  async getAll(userId?: string): Promise<ApiResponse<any[]>> {
    const url = userId ? `/api/testimonies?userId=${userId}` : '/api/testimonies'
    return apiCall(url)
  },

  async create(testimonyData: {
    title: string
    content: string
    category?: string
    isAnonymous?: boolean
    imageUrl?: string
  }, userId: string): Promise<ApiResponse<any>> {
    return apiCall(`/api/testimonies?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(testimonyData)
    })
  }
}

// Profile
export const profileAPI = {
  async get(): Promise<ApiResponse<any>> {
    return apiCall('/api/profile')
  },

  async update(profileData: any): Promise<ApiResponse<any>> {
    return apiCall('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }
}

/**
 * Hook pour utiliser les API avec gestion d'erreur automatique
 */
import { useState } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callAPI = async <T>(apiFunction: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction()
      
      if (!result.success) {
        setError(result.error || 'Erreur inconnue')
        return null
      }
      
      return result.data || null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { callAPI, loading, error, setError }
}