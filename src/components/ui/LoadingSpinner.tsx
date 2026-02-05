/**
 * =============================================================================
 * LOADING SPINNER - COMPOSANT DE CHARGEMENT STANDARDISÉ
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * 
 * Description: Composant de chargement réutilisable pour toute l'application.
 * Garantit une expérience utilisateur cohérente.
 * 
 * =============================================================================
 */

'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  fullPage?: boolean
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  className = '',
  fullPage = true 
}: LoadingSpinnerProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#cc9b00]`} />
      {text && (
        <p className="text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {content}
      </div>
    )
  }

  return content
}

// Export aussi un composant inline plus simple
export function InlineLoader({ className = '' }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />
}


