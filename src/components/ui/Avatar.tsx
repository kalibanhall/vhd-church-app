/**
 * Avatar - Composant d'avatar utilisateur
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusClasses = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

export function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  className = '',
  status,
}: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const bgColors = [
    'bg-[#ffc200]',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  const getBgColor = (name?: string) => {
    if (!name) return 'bg-gray-400';
    const index = name.charCodeAt(0) % bgColors.length;
    return bgColors[index];
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full overflow-hidden 
          flex items-center justify-center
          ${!src ? getBgColor(name) : 'bg-gray-200 dark:bg-gray-700'}
        `}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || name || 'Avatar'}
            fill
            className="object-cover"
          />
        ) : name ? (
          <span className="font-medium text-white">
            {getInitials(name)}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-gray-400" />
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 
            ${statusSizes[size]} 
            ${statusClasses[status]}
            rounded-full border-2 border-white dark:border-gray-900
          `}
        />
      )}
    </div>
  );
}

/**
 * AvatarGroup - Groupe d'avatars empilés
 */
interface AvatarGroupProps {
  avatars: Array<{ src?: string; name?: string }>;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`
            ${sizeClasses[size]} 
            rounded-full bg-gray-100 dark:bg-gray-800
            flex items-center justify-center
            ring-2 ring-white dark:ring-gray-900
            font-medium text-gray-600 dark:text-gray-400
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default Avatar;


