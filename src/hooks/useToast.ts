/**
 * Hook useToast - Système de notifications toast
 * Gestion des messages temporaires à l'utilisateur
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  dismissible?: boolean;
  action?: Toast['action'];
}

export interface UseToastReturn {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
}

const DEFAULT_DURATION = 5000;

/**
 * Hook pour gérer les notifications toast
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Générer un ID unique
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Supprimer un toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Ajouter un toast
  const addToast = useCallback(
    (type: ToastType, message: string, options: ToastOptions = {}): string => {
      const id = generateId();
      const toast: Toast = {
        id,
        type,
        message,
        title: options.title,
        duration: options.duration ?? DEFAULT_DURATION,
        dismissible: options.dismissible ?? true,
        action: options.action,
        createdAt: new Date(),
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove après la durée spécifiée
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }

      return id;
    },
    [generateId, removeToast]
  );

  // Effacer tous les toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Raccourcis pour chaque type
  const success = useCallback(
    (message: string, options?: ToastOptions) => addToast('success', message, options),
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => addToast('error', message, options),
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => addToast('warning', message, options),
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => addToast('info', message, options),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}

// État global pour les toasts (singleton pattern)
let globalToastHandler: UseToastReturn | null = null;

export function setGlobalToastHandler(handler: UseToastReturn) {
  globalToastHandler = handler;
}

export function toast(type: ToastType, message: string, options?: ToastOptions) {
  if (globalToastHandler) {
    return globalToastHandler.addToast(type, message, options);
  }
  console.warn('Toast handler not initialized');
  return '';
}

export const toastSuccess = (message: string, options?: ToastOptions) => 
  toast('success', message, options);

export const toastError = (message: string, options?: ToastOptions) => 
  toast('error', message, options);

export const toastWarning = (message: string, options?: ToastOptions) => 
  toast('warning', message, options);

export const toastInfo = (message: string, options?: ToastOptions) => 
  toast('info', message, options);

export default useToast;
