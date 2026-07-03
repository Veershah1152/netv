import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 7,
}) => {
  const clampedTotal = Math.min(totalPages, 500);
  if (clampedTotal <= 1) return null;

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (clampedTotal <= maxVisible) {
      return Array.from({ length: clampedTotal }, (_, i) => i + 1);
    }
    pages.push(1);
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(clampedTotal - 1, currentPage + 2);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < clampedTotal - 1) pages.push('...');
    pages.push(clampedTotal);
    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <motion.button
        className="btn-icon w-9 h-9 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        whileHover={currentPage > 1 ? { scale: 1.1 } : {}}
        whileTap={currentPage > 1 ? { scale: 0.9 } : {}}
      >
        <FiChevronLeft className="w-4 h-4" />
      </motion.button>

      <div className="flex items-center gap-1">
        {pages.map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="text-text-muted px-2">…</span>
          ) : (
            <motion.button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-9 h-9 rounded text-ui font-medium transition-all duration-150 ${
                page === currentPage
                  ? 'bg-brand-red text-white'
                  : 'text-text-secondary hover:text-white hover:bg-nv-surface'
              }`}
              whileHover={page !== currentPage ? { scale: 1.1 } : {}}
              whileTap={{ scale: 0.9 }}
            >
              {page}
            </motion.button>
          )
        ))}
      </div>

      <motion.button
        className="btn-icon w-9 h-9 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= clampedTotal}
        whileHover={currentPage < clampedTotal ? { scale: 1.1 } : {}}
        whileTap={currentPage < clampedTotal ? { scale: 0.9 } : {}}
      >
        <FiChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
