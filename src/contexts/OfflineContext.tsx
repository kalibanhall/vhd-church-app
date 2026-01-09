/**
 * OfflineContext - Gestion du mode hors ligne (PWA)
 * Cache, synchronisation et détection de connexion
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: unknown;
  createdAt: string;
  retryCount: number;
}

interface OfflineContextValue {
  isOnline: boolean;
  isOfflineReady: boolean;
  pendingOperations: PendingOperation[];
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'createdAt' | 'retryCount'>) => void;
  syncPendingOperations: () => Promise<void>;
  clearPendingOperations: () => void;
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T, ttl?: number) => void;
  clearCache: () => void;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

const PENDING_OPS_KEY = 'mychurch-pending-operations';
const CACHE_PREFIX = 'mychurch-cache-';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 heures

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const pendingCount = pendingOperations.length;

  // Charger les opérations en attente depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem(PENDING_OPS_KEY);
    if (saved) {
      try {
        setPendingOperations(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur lors du chargement des opérations en attente:', e);
      }
    }
  }, []);

  // Sauvegarder les opérations en attente
  useEffect(() => {
    localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pendingOperations));
  }, [pendingOperations]);

  // Synchroniser les opérations en attente
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || pendingOperations.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const failedOperations: PendingOperation[] = [];

    for (const operation of pendingOperations) {
      try {
        const method = operation.type === 'create' ? 'POST' : operation.type === 'update' ? 'PUT' : 'DELETE';

        const response = await fetch(operation.endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: operation.type !== 'delete' ? JSON.stringify(operation.data) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de l'opération ${operation.id}:`, error);
        
        // Réessayer jusqu'à 3 fois
        if (operation.retryCount < 3) {
          failedOperations.push({
            ...operation,
            retryCount: operation.retryCount + 1,
          });
        }
      }
    }

    setPendingOperations(failedOperations);
    setLastSyncAt(new Date());
    setIsSyncing(false);
  }, [isOnline, pendingOperations, isSyncing]);

  // Détecter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync quand on revient en ligne
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      syncPendingOperations();
    }
  }, [isOnline, pendingOperations.length, syncPendingOperations]);

  // Vérifier si le service worker est prêt
  useEffect(() => {
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        setIsOfflineReady(!!registration.active);
      }
    };

    checkServiceWorker();
  }, []);

  // Ajouter une opération en attente
  const addPendingOperation = useCallback(
    (operation: Omit<PendingOperation, 'id' | 'createdAt' | 'retryCount'>) => {
      const newOperation: PendingOperation = {
        ...operation,
        id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        retryCount: 0,
      };

      setPendingOperations((prev) => [...prev, newOperation]);
    },
    []
  );

  // Effacer les opérations en attente
  const clearPendingOperations = useCallback(() => {
    setPendingOperations([]);
    localStorage.removeItem(PENDING_OPS_KEY);
  }, []);

  // Récupérer des données du cache
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, expiresAt } = JSON.parse(cached);
      
      if (expiresAt && new Date(expiresAt) < new Date()) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return data as T;
    } catch {
      return null;
    }
  }, []);

  // Sauvegarder des données dans le cache
  const setCachedData = useCallback(<T,>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    try {
      const expiresAt = new Date(Date.now() + ttl).toISOString();
      localStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify({ data, expiresAt })
      );
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
    }
  }, []);

  // Vider le cache
  const clearCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isOfflineReady,
        pendingOperations,
        pendingCount,
        isSyncing,
        lastSyncAt,
        addPendingOperation,
        syncPendingOperations,
        clearPendingOperations,
        getCachedData,
        setCachedData,
        clearCache,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline doit être utilisé dans un OfflineProvider');
  }
  return context;
}

export default OfflineContext;
