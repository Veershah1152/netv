import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWatchedList } from '@/hooks/useWatched';
import { useMovieDetails } from '@/hooks/useMovies';
import { useTvDetails } from '@/hooks/useTv';
import { MovieCard } from '@/components/ui/MovieCard';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/store/useAuthStore';

// Helper card to dynamically resolve TMDB info for each watched log item
const WatchedItemCard: React.FC<{
  movieId: number;
  mediaType: 'movie' | 'tv';
}> = ({ movieId, mediaType }) => {
  const isMovie = mediaType === 'movie';
  const movieDetails = useMovieDetails(isMovie ? movieId : 0);
  const tvDetails = useTvDetails(!isMovie ? movieId : 0);

  const isLoading = isMovie ? movieDetails.isLoading : tvDetails.isLoading;
  const data = isMovie ? movieDetails.data : tvDetails.data;

  if (isLoading) {
    return <div className="aspect-[2/3] bg-nv-elevated animate-pulse rounded-card" />;
  }

  if (!data) return null;

  const adaptedItem = {
    ...data,
    media_type: mediaType,
  } as any;

  return <MovieCard item={adaptedItem} mediaType={mediaType} />;
};

export const Watched: React.FC = () => {
  const { user } = useAuthStore();
  const { data: watchedList, isLoading } = useWatchedList();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  // Remove duplicates to group by series/movie title
  const uniqueWatchedList = watchedList
    ? watchedList.filter((item, index, self) =>
        self.findIndex((t) => t.movie_id === item.movie_id && t.media_type === item.media_type) === index
      )
    : [];

  return (
    <motion.div
      className="page-wrapper pt-20 text-white min-h-screen flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FiCheckSquare className="w-7 h-7 text-brand-red" />
            <h1 className="text-h1 font-bold">Watched History</h1>
            <span className="text-text-muted text-body">({uniqueWatchedList.length})</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-nv-elevated animate-pulse rounded-card" />
            ))}
          </div>
        ) : uniqueWatchedList.length === 0 ? (
          <div className="text-center py-24">
            <FiCheckSquare className="w-16 h-16 text-nv-surface mx-auto mb-4" />
            <h2 className="text-h2 font-semibold mb-2">No watched content yet</h2>
            <p className="text-text-secondary text-body mb-8">Movies and shows you watch or mark as watched will appear here.</p>
            <button onClick={() => navigate('/')} className="btn-primary">Browse Content</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {uniqueWatchedList.map((item) => (
              <WatchedItemCard
                key={`${item.media_type}-${item.movie_id}`}
                movieId={item.movie_id}
                mediaType={item.media_type}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </motion.div>
  );
};
