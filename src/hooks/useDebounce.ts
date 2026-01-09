/**
 * Hook useDebounce - Retarde l'exécution d'une valeur
 * Utile pour les recherches, les inputs en temps réel
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { useState, useEffect } from 'react';

/**
 * Hook qui retourne une valeur retardée
 * @param value - La valeur à retarder
 * @param delay - Le délai en millisecondes (par défaut 500ms)
 * @returns La valeur après le délai
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook qui retourne une fonction retardée
 * @param callback - La fonction à exécuter
 * @param delay - Le délai en millisecondes
 * @returns La fonction retardée
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}

export default useDebounce;
