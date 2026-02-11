/**
 * =============================================================================
 * APP NAVIGATION CONTEXT - Gestion de la navigation type application
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * 
 * Fonctionnalités:
 * - Persistance de l'onglet actif (localStorage)
 * - Protection contre le retour arrière vers la page de connexion
 * - Confirmation avant déconnexion
 * - Historique de navigation interne
 * - Comportement d'application native (pas de refresh web)
 * 
 * =============================================================================
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationState {
  currentTab: string;
  previousTab: string | null;
  history: string[];
  formData: Record<string, unknown>;
}

interface AppNavigationContextType {
  // Navigation
  currentTab: string;
  previousTab: string | null;
  navigateTo: (tab: string) => void;
  goBack: () => boolean;
  canGoBack: boolean;
  
  // Persistance des données
  saveFormData: (key: string, data: unknown) => void;
  getFormData: (key: string) => unknown;
  clearFormData: (key: string) => void;
  
  // Modal de confirmation déconnexion
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  
  // État de l'app
  isAppReady: boolean;
}

const AppNavigationContext = createContext<AppNavigationContextType | undefined>(undefined);

const STORAGE_KEY = 'mychurchapp_navigation';
const FORM_DATA_KEY = 'mychurchapp_form_data';

export function AppNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentTab: 'home',
    previousTab: null,
    history: ['home'],
    formData: {},
  });

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Charger l'état de navigation
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          setNavigationState(prev => ({
            ...prev,
            currentTab: parsed.currentTab || 'home',
            previousTab: parsed.previousTab || null,
            history: parsed.history || ['home'],
          }));
        }

        // Charger les données de formulaire
        const savedFormData = localStorage.getItem(FORM_DATA_KEY);
        if (savedFormData) {
          const parsed = JSON.parse(savedFormData);
          setNavigationState(prev => ({
            ...prev,
            formData: parsed || {},
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'état de navigation:', error);
      }
      
      setIsAppReady(true);
    }
  }, []);

  // Sauvegarder l'état dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined' && isAppReady) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentTab: navigationState.currentTab,
          previousTab: navigationState.previousTab,
          history: navigationState.history.slice(-20), // Garder les 20 derniers
        }));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'état:', error);
      }
    }
  }, [navigationState.currentTab, navigationState.previousTab, navigationState.history, isAppReady]);

  // Bloquer le bouton retour du navigateur
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ajouter une entrée dans l'historique pour bloquer le retour
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      
      // Re-pousser l'état pour maintenir la position
      window.history.pushState(null, '', window.location.href);
      
      // Utiliser notre navigation interne
      if (navigationState.history.length > 1) {
        // Naviguer vers la page précédente dans notre historique
        const newHistory = [...navigationState.history];
        newHistory.pop();
        const previousTab = newHistory[newHistory.length - 1] || 'home';
        
        setNavigationState(prev => ({
          ...prev,
          currentTab: previousTab,
          previousTab: prev.currentTab,
          history: newHistory,
        }));
      } else {
        // Si on est à la racine, afficher la confirmation de déconnexion
        setShowLogoutConfirm(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigationState.history]);

  // Bloquer le refresh de la page (F5, Ctrl+R)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Sauvegarder l'état avant le refresh
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentTab: navigationState.currentTab,
          previousTab: navigationState.previousTab,
          history: navigationState.history,
        }));
        
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(navigationState.formData));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde avant refresh:', error);
      }
      
      // Ne pas afficher de message de confirmation pour le refresh
      // car nous sauvegardons l'état
      return;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigationState]);

  // Navigation vers un onglet
  const navigateTo = useCallback((tab: string) => {
    setNavigationState(prev => {
      // Éviter les doublons consécutifs dans l'historique
      const newHistory = prev.currentTab !== tab 
        ? [...prev.history, tab]
        : prev.history;
      
      return {
        ...prev,
        currentTab: tab,
        previousTab: prev.currentTab,
        history: newHistory.slice(-20), // Limiter l'historique
      };
    });
  }, []);

  // Retour en arrière
  const goBack = useCallback((): boolean => {
    if (navigationState.history.length <= 1) {
      // On est à la racine, afficher confirmation de déconnexion
      setShowLogoutConfirm(true);
      return false;
    }

    const newHistory = [...navigationState.history];
    newHistory.pop();
    const previousTab = newHistory[newHistory.length - 1] || 'home';

    setNavigationState(prev => ({
      ...prev,
      currentTab: previousTab,
      previousTab: prev.currentTab,
      history: newHistory,
    }));

    return true;
  }, [navigationState.history]);

  // Sauvegarder des données de formulaire
  const saveFormData = useCallback((key: string, data: unknown) => {
    setNavigationState(prev => {
      const newFormData = { ...prev.formData, [key]: data };
      
      // Sauvegarder immédiatement dans localStorage
      try {
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(newFormData));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
      }
      
      return {
        ...prev,
        formData: newFormData,
      };
    });
  }, []);

  // Récupérer des données de formulaire
  const getFormData = useCallback((key: string): unknown => {
    return navigationState.formData[key];
  }, [navigationState.formData]);

  // Effacer des données de formulaire
  const clearFormData = useCallback((key: string) => {
    setNavigationState(prev => {
      const newFormData = { ...prev.formData };
      delete newFormData[key];
      
      try {
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(newFormData));
      } catch (error) {
        console.error('Erreur lors de l\'effacement des données:', error);
      }
      
      return {
        ...prev,
        formData: newFormData,
      };
    });
  }, []);

  const value: AppNavigationContextType = {
    currentTab: navigationState.currentTab,
    previousTab: navigationState.previousTab,
    navigateTo,
    goBack,
    canGoBack: navigationState.history.length > 1,
    saveFormData,
    getFormData,
    clearFormData,
    showLogoutConfirm,
    setShowLogoutConfirm,
    isAppReady,
  };

  return (
    <AppNavigationContext.Provider value={value}>
      {children}
    </AppNavigationContext.Provider>
  );
}

export function useAppNavigation() {
  const context = useContext(AppNavigationContext);
  if (context === undefined) {
    throw new Error('useAppNavigation must be used within an AppNavigationProvider');
  }
  return context;
}
