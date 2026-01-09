/**
 * Hook useModal - Gestion des modals/dialogs
 * Ouverture, fermeture et gestion de l'état
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

export interface UseModalReturn {
  isOpen: boolean;
  data: unknown;
  open: (data?: unknown) => void;
  close: () => void;
  toggle: () => void;
}

export interface UseModalOptions {
  defaultOpen?: boolean;
  onOpen?: (data?: unknown) => void;
  onClose?: () => void;
  closeOnEscape?: boolean;
}

/**
 * Hook pour gérer un modal
 */
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const {
    defaultOpen = false,
    onOpen,
    onClose,
    closeOnEscape = true,
  } = options;

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState<unknown>(null);

  const open = useCallback(
    (modalData?: unknown) => {
      setData(modalData);
      setIsOpen(true);
      onOpen?.(modalData);
    },
    [onOpen]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, close, open]);

  // Gérer la fermeture avec Escape
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, isOpen, close]);

  // Bloquer le scroll quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

/**
 * Hook pour gérer plusieurs modals
 * Note: Cette approche utilise un state object au lieu de hooks séparés
 */
export function useModals<T extends string>(
  modalNames: readonly T[]
): Record<T, UseModalReturn> & { closeAll: () => void; openModal: (name: T, data?: unknown) => void } {
  const [modalStates, setModalStates] = useState<Record<T, { isOpen: boolean; data: unknown }>>(() => {
    const initial = {} as Record<T, { isOpen: boolean; data: unknown }>;
    for (const name of modalNames) {
      initial[name] = { isOpen: false, data: null };
    }
    return initial;
  });

  const closeAll = useCallback(() => {
    setModalStates((prev) => {
      const newStates = { ...prev };
      for (const name of modalNames) {
        newStates[name] = { isOpen: false, data: null };
      }
      return newStates;
    });
  }, [modalNames]);

  const openModal = useCallback(
    (name: T, data?: unknown) => {
      setModalStates((prev) => {
        const newStates = { ...prev };
        // Fermer tous les autres modals
        for (const modalName of modalNames) {
          newStates[modalName] = { isOpen: false, data: null };
        }
        // Ouvrir le modal demandé
        newStates[name] = { isOpen: true, data };
        return newStates;
      });
    },
    [modalNames]
  );

  const modals = useMemo(() => {
    const result = {} as Record<T, UseModalReturn>;
    
    for (const name of modalNames) {
      result[name] = {
        isOpen: modalStates[name]?.isOpen ?? false,
        data: modalStates[name]?.data ?? null,
        open: (data?: unknown) => {
          setModalStates((prev) => ({
            ...prev,
            [name]: { isOpen: true, data },
          }));
        },
        close: () => {
          setModalStates((prev) => ({
            ...prev,
            [name]: { isOpen: false, data: null },
          }));
        },
        toggle: () => {
          setModalStates((prev) => ({
            ...prev,
            [name]: { 
              isOpen: !prev[name]?.isOpen, 
              data: prev[name]?.isOpen ? null : prev[name]?.data 
            },
          }));
        },
      };
    }
    
    return result;
  }, [modalNames, modalStates]);

  return {
    ...modals,
    closeAll,
    openModal,
  };
}

/**
 * Hook pour les modals de confirmation
 */
export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  variant: 'danger' | 'warning' | 'info';
}

export interface UseConfirmModalReturn {
  state: ConfirmModalState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  close: () => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalState['variant'];
}

export function useConfirmModal(): UseConfirmModalReturn {
  const [state, setState] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    onConfirm: null,
    onCancel: null,
    variant: 'info',
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirmer',
        cancelText: options.cancelText || 'Annuler',
        variant: options.variant || 'info',
        onConfirm: () => {
          setState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
    state.onCancel?.();
  }, [state]);

  const handleConfirm = useCallback(() => {
    state.onConfirm?.();
  }, [state]);

  const handleCancel = useCallback(() => {
    state.onCancel?.();
  }, [state]);

  return {
    state,
    confirm,
    close,
    handleConfirm,
    handleCancel,
  };
}

export default useModal;
