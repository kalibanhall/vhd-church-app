/**
 * Hook useLocalStorage - Persistance des données dans le localStorage
 * Synchronisation automatique avec React state
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour persister une valeur dans le localStorage
 * @param key - La clé de stockage
 * @param initialValue - La valeur initiale
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Fonction pour lire la valeur initiale
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de localStorage[${key}]:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Fonction pour mettre à jour la valeur
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn(`Impossible d'utiliser localStorage côté serveur`);
        return;
      }

      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch event pour synchroniser les autres onglets
        window.dispatchEvent(new StorageEvent('local-storage', { key }));
      } catch (error) {
        console.warn(`Erreur lors de l'écriture dans localStorage[${key}]:`, error);
      }
    },
    [key, storedValue]
  );

  // Fonction pour supprimer la valeur
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new StorageEvent('local-storage', { key }));
    } catch (error) {
      console.warn(`Erreur lors de la suppression de localStorage[${key}]:`, error);
    }
  }, [key, initialValue]);

  // Écouter les changements depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key || event.type === 'local-storage') {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook pour gérer un objet dans le localStorage
 */
export function useLocalStorageObject<T extends Record<string, unknown>>(
  key: string,
  initialValue: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [value, setValue, removeValue] = useLocalStorage<T>(key, initialValue);

  const updateValue = useCallback(
    (updates: Partial<T>) => {
      setValue((prev) => ({ ...prev, ...updates }));
    },
    [setValue]
  );

  return [value, updateValue, removeValue];
}

export default useLocalStorage;
