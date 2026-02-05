/**
 * StatCard - Carte de statistique
 * Affiche une statistique avec icône, valeur et variation
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#cc9b00]',
  iconBgColor = 'bg-[#fff3cc]',
  trend,
  loading = false,
  onClick,
  className = '',
}: StatCardProps) {
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  const trendColor = trend
    ? trend.isPositive !== undefined
      ? trend.isPositive
        ? 'text-green-600'
        : 'text-red-600'
      : trend.value > 0
        ? 'text-green-600'
        : trend.value < 0
          ? 'text-red-600'
          : 'text-gray-500'
    : '';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm 
        border border-gray-100 dark:border-gray-700
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          
          {loading ? (
            <div className="mt-2 h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            </p>
          )}

          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}

          {trend && !loading && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
              {TrendIcon && <TrendIcon className="h-4 w-4" />}
              <span className="font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`${iconBgColor} p-3 rounded-full flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * StatCardGrid - Grille de cartes statistiques
 */
interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatCardGrid({
  children,
  columns = 4,
  className = '',
}: StatCardGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

export default StatCard;


