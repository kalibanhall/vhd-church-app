/**
 * ProgressBar - Barre de progression
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  valueFormat?: 'percent' | 'fraction' | 'custom';
  customValueFormat?: (value: number, max: number) => string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gradient';
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorClasses = {
  blue: 'bg-[#ffc200]',
  green: 'bg-green-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-600',
  gradient: 'bg-gradient-to-r from-[#ffc200] to-[#cc9b00]',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  valueFormat = 'percent',
  customValueFormat,
  size = 'md',
  color = 'blue',
  animated = false,
  striped = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const formatValue = () => {
    if (customValueFormat) {
      return customValueFormat(value, max);
    }
    switch (valueFormat) {
      case 'percent':
        return `${Math.round(percentage)}%`;
      case 'fraction':
        return `${value.toLocaleString()} / ${max.toLocaleString()}`;
      default:
        return `${Math.round(percentage)}%`;
    }
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {formatValue()}
            </span>
          )}
        </div>
      )}
      
      <div
        className={`
          w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden
          ${sizeClasses[size]}
        `}
      >
        <div
          className={`
            ${sizeClasses[size]} rounded-full transition-all duration-500
            ${colorClasses[color]}
            ${animated ? 'animate-pulse' : ''}
            ${striped ? 'bg-stripes' : ''}
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

/**
 * CircularProgress - Progression circulaire
 */
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 100,
  strokeWidth = 8,
  color = '#3B82F6',
  bgColor = '#E5E7EB',
  showValue = true,
  label,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      {label && (
        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );
}

export default ProgressBar;


