/**
 * =============================================================================
 * PAGE WRAPPER - Conteneur uniforme pour toutes les pages
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * 
 * Assure un design cohérent et professionnel pour toutes les pages de l'app
 * avec padding, max-width, et style uniforme
 * 
 * =============================================================================
 */

'use client';

import { ReactNode } from 'react';
import { Loader2, LucideIcon } from 'lucide-react';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  loading?: boolean;
  loadingText?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  noPadding?: boolean;
  headerActions?: ReactNode;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export default function PageWrapper({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#cc9b00]',
  iconBgColor = 'bg-[#fff3cc]',
  loading = false,
  loadingText = 'Chargement...',
  maxWidth = '4xl',
  noPadding = false,
  headerActions,
  className = '',
}: PageWrapperProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${noPadding ? '' : 'p-4 pb-24'} ${className}`}>
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full ${iconBgColor} flex items-center justify-center mx-auto mb-4`}>
            <Loader2 className={`h-8 w-8 ${iconColor} animate-spin`} />
          </div>
          {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
          <p className="text-gray-600 mt-2">{loadingText}</p>
        </div>
        
        {/* Skeleton content */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto ${noPadding ? '' : 'p-4 pb-24'} ${className}`}>
      {/* Header */}
      {(title || Icon) && (
        <div className="text-center mb-8">
          {Icon && (
            <div className={`w-16 h-16 rounded-full ${iconBgColor} flex items-center justify-center mx-auto mb-4 shadow-lg shadow-${iconBgColor}/50`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
          )}
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
          {subtitle && (
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">{subtitle}</p>
          )}
          {headerActions && (
            <div className="mt-4 flex justify-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}

// Composant pour les cartes de contenu uniformes
interface ContentCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function ContentCard({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  onClick,
}: ContentCardProps) {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Composant pour les grilles de statistiques
interface StatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 3, className = '' }: StatGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 mb-6 ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les items de stat
interface StatItemProps {
  value: string | number;
  label: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  icon?: LucideIcon;
}

const colorClasses = {
  blue: { bg: 'bg-[#fffefa]', text: 'text-[#cc9b00]' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
};

export function StatItem({ value, label, color = 'blue', icon: Icon }: StatItemProps) {
  return (
    <div className={`${colorClasses[color].bg} rounded-xl p-3 text-center`}>
      {Icon && (
        <Icon className={`h-5 w-5 ${colorClasses[color].text} mx-auto mb-1`} />
      )}
      <p className={`text-2xl font-bold ${colorClasses[color].text}`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

// Composant pour les sections
interface SectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Section({ title, subtitle, children, className = '', action }: SectionProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Composant pour liste vide
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl">
      {Icon && <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />}
      <p className="text-gray-600 font-medium">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}


