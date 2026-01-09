/**
 * Hook useOnlineStatus - Détection du statut en ligne/hors ligne
 * Utile pour les applications PWA
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { useState, useEffect, useCallback } from 'react';

export interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
}

export interface UseOnlineStatusReturn extends OnlineStatusState {
  checkConnection: () => Promise<boolean>;
}

/**
 * Hook pour détecter le statut de connexion
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const [state, setState] = useState<OnlineStatusState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineAt: null,
    lastOfflineAt: null,
  });

  // Vérifier activement la connexion
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Ping une ressource légère pour vérifier la connexion réelle
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: true,
        wasOffline: !prev.isOnline ? true : prev.wasOffline,
        lastOnlineAt: new Date(),
      }));
    };

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: false,
        lastOfflineAt: new Date(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier périodiquement la connexion réelle
    const intervalId = setInterval(async () => {
      const reallyOnline = await checkConnection();
      if (reallyOnline !== state.isOnline) {
        if (reallyOnline) {
          handleOnline();
        } else {
          handleOffline();
        }
      }
    }, 30000); // Toutes les 30 secondes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnection, state.isOnline]);

  return {
    ...state,
    checkConnection,
  };
}

/**
 * Hook simplifié qui retourne juste le statut booléen
 */
export function useIsOnline(): boolean {
  const { isOnline } = useOnlineStatus();
  return isOnline;
}

export default useOnlineStatus;
