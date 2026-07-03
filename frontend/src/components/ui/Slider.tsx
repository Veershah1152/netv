import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface SliderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  scrollAmount?: number;
  className?: string;
}

export const Slider = <T,>({
  items,
  renderItem,
  scrollAmount = 800,
  className = '',
}: SliderProps<T>) => {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`relative group ${className}`}>
      <motion.button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-nv-black/80 border border-nv-border rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-5"
        onClick={() => scroll('left')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiChevronLeft className="w-5 h-5" />
      </motion.button>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
      >
        {items.map((item, index) => renderItem(item, index))}
      </div>

      <motion.button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-nv-black/80 border border-nv-border rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-5"
        onClick={() => scroll('right')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
};
