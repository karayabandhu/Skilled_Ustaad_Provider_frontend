import { useState, useMemo, useCallback } from 'react';

/**
 * usePagination - Shared pagination logic
 * @param {Array} items - The full list of items (for client-side pagination)
 * @param {number} itemsPerPage - Number of items per page
 */
export const usePagination = (items = [], itemsPerPage = 5) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    const count = Array.isArray(items) ? items.length : 0;
    return Math.max(1, Math.ceil(count / itemsPerPage));
  }, [items, itemsPerPage]);

  const currentItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return safeItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

  // Reset to first page if items change in a way that makes current page invalid
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    setCurrentPage
  };
};
