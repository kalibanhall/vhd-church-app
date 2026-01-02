'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { SplashScreen } from './SplashScreen';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  // Enregistrement du Service Worker pour PWA avec mise à jour forcée
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          console.log('✅ Service Worker enregistré:', registration.scope);
          
          // Vérifier les mises à jour immédiatement
          registration.update();
          
          // Écouter les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('🔄 Nouvelle version du Service Worker détectée');
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('📦 Nouvelle version prête - Rechargement...');
                  // Forcer le rechargement pour appliquer la mise à jour
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erreur Service Worker:', error);
        });
      
      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker mis à jour');
      });
    }

    // Masquer le splash screen après le chargement
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen />}
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}
