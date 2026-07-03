import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiHeart, FiPlus } from 'react-icons/fi';
import { Movie } from '@/types/movie.types';
import { TvShow } from '@/types/tv.types';
import { getPosterUrl, getFallbackPoster } from '@/utils/imageUtils';
import { formatYear, formatRating } from '@/utils/formatUtils';
import { useAppStore, FavoriteItem } from '@/store/useAppStore';
import { useToast } from '@/components/ui/Toast';

type MediaItem = (Movie | TvShow) & { media_type?: string };

interface MovieCardProps {
  item: MediaItem;
  mediaType?: 'movie' | 'tv';
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
}

const getTitle = (item: MediaItem): string =>
  ('title' in item && item.title) || ('name' in item && item.name) || 'Unknown';

const getDate = (item: MediaItem): string =>
  ('release_date' in item && item.release_date) ||
  ('first_air_date' in item && item.first_air_date) ||
  '';

const getMediaType = (item: MediaItem, fallback?: string): 'movie' | 'tv' => {
  if (item.media_type === 'movie' || item.media_type === 'tv') return item.media_type;
  if (fallback === 'tv') return 'tv';
  return 'title' in item ? 'movie' : 'tv';
};

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  mediaType,
  size = 'md',
  showRating = true,
}) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, addRecentlyViewed } = useAppStore();
  const { showToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const detectedMediaType = getMediaType(item, mediaType);
  const title = getTitle(item);
  const year = formatYear(getDate(item));
  const posterUrl = imgError ? getFallbackPoster() : (getPosterUrl(item.poster_path) || getFallbackPoster());
  const isFav = isFavorite(item.id, detectedMediaType);

  const widthClasses = {
    sm: 'w-32 xs:w-36',
    md: 'w-40 xs:w-44 md:w-48',
    lg: 'w-48 xs:w-52 md:w-56',
  };

  const handleClick = () => {
    addRecentlyViewed({
      id: item.id,
      media_type: detectedMediaType,
      title,
      poster_path: item.poster_path,
      viewedAt: new Date().toISOString(),
    });
    navigate(`/${detectedMediaType}/${item.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      removeFavorite(item.id, detectedMediaType);
      showToast(`Removed from favorites`, 'info');
    } else {
      addFavorite({ ...item, media_type: detectedMediaType } as FavoriteItem);
      showToast(`Added to favorites`, 'success');
    }
  };

  return (
    <motion.div
      className={`${widthClasses[size]} flex-shrink-0 cursor-pointer group`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="relative overflow-hidden rounded-card shadow-card aspect-[2/3]">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgError(true)}
        />

        {/* Gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Rating badge */}
        {showRating && item.vote_average > 0 && (
          <div className="absolute top-2 left-2">
            <div className="bg-nv-black/80 rounded px-1.5 py-0.5 text-small font-semibold text-match backdrop-blur-sm">
              ★ {formatRating(item.vote_average)}
            </div>
          </div>
        )}

        {/* Actions on hover */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-end p-3 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex gap-2">
            <motion.button
              className="flex-1 flex items-center justify-center gap-1 bg-white text-nv-black text-small font-bold py-2 rounded-btn"
              whileHover={{ backgroundColor: '#e5e7eb' }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                addRecentlyViewed({
                  id: item.id,
                  media_type: detectedMediaType,
                  title,
                  poster_path: item.poster_path,
                  viewedAt: new Date().toISOString(),
                });
                navigate(`/watch/${detectedMediaType}/${item.id}`);
              }}
              title="Play"
            >
              <FiPlay className="w-3 h-3 fill-current" />
              <span>Play</span>
            </motion.button>
            <motion.button
              className={`w-9 h-9 rounded-btn flex items-center justify-center border-2 transition-colors duration-150 ${
                isFav
                  ? 'border-brand-red bg-brand-red/20 text-brand-red'
                  : 'border-white/60 bg-nv-black/60 text-white'
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFav ? <FiHeart className="w-4 h-4 fill-current" /> : <FiPlus className="w-4 h-4" />}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Card info below */}
      <div className="mt-2 px-0.5">
        <p className="text-white text-small font-medium line-clamp-1 group-hover:text-brand-red transition-colors duration-150">
          {title}
        </p>
        <p className="text-text-muted text-small">{year}</p>
      </div>
    </motion.div>
  );
};
