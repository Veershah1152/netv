import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiInfo } from 'react-icons/fi';
import { Movie } from '@/types/movie.types';
import { TvShow } from '@/types/tv.types';
import { getBackdropUrl, getFallbackBackdrop } from '@/utils/imageUtils';
import { formatYear, formatRating } from '@/utils/formatUtils';
import { GENRE_MAP } from '@/utils/constants';
import { TrailerModal } from '@/components/ui/TrailerModal';
import { useMovieVideos } from '@/hooks/useMovies';
import { Video } from '@/types/common.types';

type MediaItem = (Movie | TvShow) & { media_type?: string };

interface HeroProps {
  items: MediaItem[];
  autoPlayInterval?: number;
}

const getTitle = (item: MediaItem): string =>
  ('title' in item && item.title) || ('name' in item && item.name) || '';

const getDate = (item: MediaItem): string =>
  ('release_date' in item && item.release_date) ||
  ('first_air_date' in item && item.first_air_date) ||
  '';

export const Hero: React.FC<HeroProps> = ({ items, autoPlayInterval = 8000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const current = items[currentIndex];
  const mediaType = current?.media_type === 'tv' ? 'tv' : 'movie';

  const { data: videosData } = useMovieVideos(
    mediaType === 'movie' ? current?.id || 0 : 0
  );

  const videos: Video[] = videosData?.results || [];

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % Math.min(items.length, 6));
      setImgError(false);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [items.length, autoPlayInterval]);

  if (!current) return null;

  const title = getTitle(current);
  const year = formatYear(getDate(current));
  const genreIds = current.genre_ids?.slice(0, 3) || [];
  const genres = genreIds.map((id) => GENRE_MAP[id]).filter(Boolean);
  const backdropUrl = imgError
    ? getFallbackBackdrop()
    : (getBackdropUrl(current.backdrop_path) || getFallbackBackdrop());

  const handleDetails = () => navigate(`/${mediaType}/${current.id}`);

  return (
    <div className="relative w-full" style={{ height: '85vh', minHeight: '520px', maxHeight: '900px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Backdrop */}
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />

          {/* Gradient overlay */}
          <div className="hero-gradient absolute inset-0" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, #141414 8%, transparent 40%)'
          }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${currentIndex}`}
          className="absolute bottom-0 left-0 right-0 px-8 md:px-12 lg:px-16 pb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex gap-2 mb-3">
              {genres.map((g) => (
                <span key={g} className="text-small text-text-secondary border border-white/20 rounded px-2 py-0.5">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="font-black text-white text-shadow mb-3 max-w-xl"
            style={{ fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: '1.1' }}
          >
            {title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-4">
            {current.vote_average > 0 && (
              <span className="text-match font-semibold text-ui">
                ★ {formatRating(current.vote_average)}
              </span>
            )}
            {year && <span className="text-text-secondary text-ui">{year}</span>}
            <span className="text-text-muted text-small uppercase border border-white/20 px-1 rounded">
              {mediaType === 'tv' ? 'TV' : 'Movie'}
            </span>
          </div>

          {/* Overview */}
          <p className="text-text-secondary text-body max-w-lg line-clamp-3 mb-6 text-shadow">
            {current.overview}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <motion.button
              className="btn-play"
              onClick={() => navigate(`/watch/${mediaType}/${current.id}`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiPlay className="w-5 h-5 fill-current" />
              Play
            </motion.button>
            <motion.button
              className="btn-info"
              onClick={handleDetails}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiInfo className="w-5 h-5" />
              More Info
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-8 flex gap-2">
          {Array.from({ length: Math.min(items.length, 6) }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setImgError(false); }}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videos={videos}
        title={title}
      />
    </div>
  );
};
