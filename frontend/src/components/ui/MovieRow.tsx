import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/types/movie.types';
import { TvShow } from '@/types/tv.types';
import { MovieCard } from './MovieCard';
import { RowSkeleton } from './Skeleton';

type MediaItem = (Movie | TvShow) & { media_type?: string };

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  mediaType?: 'movie' | 'tv';
  isLoading?: boolean;
  viewAllLink?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  items,
  mediaType,
  isLoading = false,
  viewAllLink,
  size = 'md',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();

  if (isLoading) return <RowSkeleton />;
  if (!items || items.length === 0) return null;

  const cardWidths = { sm: 144, md: 192, lg: 224 };
  const scrollAmount = cardWidths[size] * 4 + 12;

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(updateScrollState, 350);
  };

  return (
    <div className="content-row group/row">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="row-title">{title}</h2>
          {viewAllLink && (
            <motion.button
              className="flex items-center gap-1 text-text-secondary hover:text-brand-red text-ui transition-colors duration-150 opacity-0 group-hover/row:opacity-100"
              onClick={() => navigate(viewAllLink)}
              whileHover={{ x: 4 }}
            >
              <span>See all</span>
              <FiArrowRight className="w-3 h-3" />
            </motion.button>
          )}
        </div>

        <div className="flex gap-1">
          <motion.button
            className={`w-7 h-7 rounded-full border border-white/30 flex items-center justify-center transition-all duration-150 ${
              canScrollLeft ? 'text-white hover:border-white' : 'text-white/20 cursor-not-allowed'
            }`}
            onClick={() => scroll('left')}
            whileTap={canScrollLeft ? { scale: 0.9 } : {}}
            disabled={!canScrollLeft}
          >
            <FiChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            className={`w-7 h-7 rounded-full border border-white/30 flex items-center justify-center transition-all duration-150 ${
              canScrollRight ? 'text-white hover:border-white' : 'text-white/20 cursor-not-allowed'
            }`}
            onClick={() => scroll('right')}
            whileTap={canScrollRight ? { scale: 0.9 } : {}}
            disabled={!canScrollRight}
          >
            <FiChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-4"
        onScroll={updateScrollState}
      >
        {items.map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            mediaType={mediaType}
            size={size}
          />
        ))}
      </div>
    </div>
  );
};
