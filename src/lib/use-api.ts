/**
 * @fileoverview Hook React pour utiliser les API avec gestion d'erreur
 * @author MyChurchApp Management System
 * @version 1.0.0
 */

'use client'

import { useState } from 'react'
import type { ApiResponse } from './api-utils'

/**
 * Hook pour utiliser les API avec gestion d'erreur automatique
 */
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
      
      return result.data
    } catch (err) {
      setError('Erreur de connexion')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, callAPI }
}
