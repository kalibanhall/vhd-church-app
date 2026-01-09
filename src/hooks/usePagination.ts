/**
 * Hook usePagination - Gestion de la pagination
 * Utile pour les listes de données paginées
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { useState, useMemo, useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationActions {
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  reset: () => void;
}

export interface UsePaginationReturn extends PaginationState, PaginationActions {
  hasNext: boolean;
  hasPrev: boolean;
  startIndex: number;
  endIndex: number;
  pageNumbers: number[];
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  initialTotal?: number;
  maxPageNumbers?: number;
}

/**
 * Hook pour gérer la pagination
 * @param options - Options de pagination
 * @returns État et actions de pagination
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialTotal = 0,
    maxPageNumbers = 5,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [total, setTotal] = useState(initialTotal);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  // Générer les numéros de page à afficher
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const halfMax = Math.floor(maxPageNumbers / 2);
    
    let start = Math.max(1, page - halfMax);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);
    
    if (end - start + 1 < maxPageNumbers) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [page, totalPages, maxPageNumbers]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage((p) => p + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage((p) => p - 1);
    }
  }, [hasPrev]);

  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(validPage);
  }, [totalPages]);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimitState(initialLimit);
    setTotal(initialTotal);
  }, [initialPage, initialLimit, initialTotal]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    startIndex,
    endIndex,
    pageNumbers,
    nextPage,
    prevPage,
    goToPage,
    setLimit,
    setTotal,
    reset,
  };
}

/**
 * Hook pour paginer des données locales
 * @param data - Les données à paginer
 * @param options - Options de pagination
 */
export function usePaginatedData<T>(
  data: T[],
  options: Omit<UsePaginationOptions, 'initialTotal'> = {}
) {
  const pagination = usePagination({
    ...options,
    initialTotal: data.length,
  });

  // Mettre à jour le total quand les données changent
  useMemo(() => {
    pagination.setTotal(data.length);
  }, [data.length, pagination]);

  const paginatedData = useMemo(() => {
    return data.slice(pagination.startIndex, pagination.endIndex);
  }, [data, pagination.startIndex, pagination.endIndex]);

  return {
    data: paginatedData,
    ...pagination,
  };
}

export default usePagination;
