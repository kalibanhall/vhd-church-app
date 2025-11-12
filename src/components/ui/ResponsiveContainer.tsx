'use client'

import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full'
}

/**
 * Container responsive pour toutes les pages
 * Assure un affichage correct sur mobile sans recadrage
 */
export default function ResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = '6xl' 
}: ResponsiveContainerProps) {
  const maxWidthClass = maxWidth === 'full' ? 'max-w-full' : `max-w-${maxWidth}`
  
  return (
    <div className={`w-full ${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
