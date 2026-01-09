/**
 * ToastContext - Notifications toast globales
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useToast, setGlobalToastHandler, UseToastReturn } from '@/hooks/useToast';

const ToastContext = createContext<UseToastReturn | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const toastMethods = useToast();

  // Enregistrer le handler global
  useEffect(() => {
    setGlobalToastHandler(toastMethods);
  }, [toastMethods]);

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext(): UseToastReturn {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext doit être utilisé dans un ToastProvider');
  }
  return context;
}

export default ToastContext;
