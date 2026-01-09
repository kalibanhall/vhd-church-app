/**
 * Index des hooks personnalisés - MyChurchApp
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

// Hooks existants
export { useNotifications } from './useNotifications';
export { useSmartSearch } from './useSmartSearch';

// Nouveaux hooks utilitaires
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useLocalStorage, useLocalStorageObject } from './useLocalStorage';
export { usePagination, usePaginatedData } from './usePagination';
export { useForm, validators } from './useForm';
export { useOnlineStatus, useIsOnline } from './useOnlineStatus';
export { useToast, toast, toastSuccess, toastError, toastWarning, toastInfo, setGlobalToastHandler } from './useToast';
export { useModal, useModals, useConfirmModal } from './useModal';

// Types
export type { PaginationState, PaginationActions, UsePaginationReturn, UsePaginationOptions } from './usePagination';
export type { ValidationRule, ValidationRules, FormErrors, FormTouched, UseFormOptions, UseFormReturn } from './useForm';
export type { OnlineStatusState, UseOnlineStatusReturn } from './useOnlineStatus';
export type { Toast, ToastType, ToastOptions, UseToastReturn } from './useToast';
export type { UseModalReturn, UseModalOptions, ConfirmModalState, UseConfirmModalReturn, ConfirmOptions } from './useModal';
