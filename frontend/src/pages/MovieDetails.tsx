import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlay, FiHeart, FiStar, FiClock, FiCalendar,
  FiGlobe, FiArrowLeft, FiPlus, FiCheckSquare, FiUsers, FiTv
} from 'react-icons/fi';
import { useMovieDetails, useMovieVideos, useMovieCast, useMovieRecommendations, useSimilarMovies } from '@/hooks/useMovies';
import { getBackdropUrl, getPosterUrl, getProfileUrl, getFallbackPoster } from '@/utils/imageUtils';
import { formatDate, formatRuntime, formatCurrency, formatRating, formatVoteCount } from '@/utils/formatUtils';
import { TrailerModal } from '@/components/ui/TrailerModal';
import { MovieRow } from '@/components/ui/MovieRow';
import { GenreBadge } from '@/components/ui/GenreBadge';
import { Footer } from '@/components/layout/Footer';
import { DetailPageSkeleton } from '@/components/ui/Skeleton';
import { ErrorComponent } from '@/components/ui/ErrorComponent';
import { useAppStore, FavoriteItem } from '@/store/useAppStore';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useWatchedStatus, useToggleWatchedMutation } from '@/hooks/useWatched';
import { useCreatePartyMutation } from '@/hooks/useParty';
import { RecommendToFriendsModal } from '@/components/ui/RecommendToFriendsModal';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0');
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useAppStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { data: movie, isLoading, isError, error, refetch } = useMovieDetails(movieId);
  const { data: videos } = useMovieVideos(movieId);
  const { data: credits } = useMovieCast(movieId);
  const { data: recommendations } = useMovieRecommendations(movieId);
  const { data: similar } = useSimilarMovies(movieId);

  const { data: isWatched } = useWatchedStatus(movieId, 'movie');
  const toggleWatchedMut = useToggleWatchedMutation();
  const createPartyMut = useCreatePartyMutation();

  if (isLoading) return <DetailPageSkeleton />;
  if (isError || !movie) return (
    <ErrorComponent
      title="Movie not found"
      message={error?.message}
      onRetry={() => refetch()}
    />
  );

  const isFav = isFavorite(movieId, 'movie');
  const isUpcoming = movie.release_date ? new Date(movie.release_date) > new Date() : false;
  const trailerVideos = videos?.results || [];
  const cast = credits?.cast?.slice(0, 12) || [];
  const director = credits?.crew?.find((c) => c.job === 'Director');
  const backdropUrl = imgError ? '' : getBackdropUrl(movie.backdrop_path);

  const handleFavorite = () => {
    if (isFav) {
      removeFavorite(movieId, 'movie');
      showToast('Removed from favorites', 'info');
    } else {
      addFavorite({ ...movie, media_type: 'movie' } as FavoriteItem);
      showToast('Added to favorites', 'success');
    }
  };

  const handleToggleWatched = () => {
    if (!user) {
      showToast('Please sign in to save watched history!', 'info');
      navigate('/auth');
      return;
    }
    toggleWatchedMut.mutate(
      { movieId, mediaType: 'movie' },
      {
        onSuccess: (res) => {
          showToast(res.message, 'success');
        },
      }
    );
  };

  const handleCreateWatchParty = () => {
    if (!user) {
      showToast('Please sign in to start a watch party!', 'info');
      navigate('/auth');
      return;
    }
    createPartyMut.mutate(
      { movieId, mediaType: 'movie' },
      {
        onSuccess: (data) => {
          showToast('Watch Party created!', 'success');
          navigate(`/party/${data.id}`);
        },
        onError: (err: any) => {
          showToast(err.message || 'Failed to create watch party', 'error');
        },
      }
    );
  };

  return (
    <motion.div
      className="page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <div className="relative w-full" style={{ height: '65vh', minHeight: '400px' }}>
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, #141414 30%, rgba(20,20,20,0.4) 100%), linear-gradient(to top, #141414 0%, transparent 50%)'
        }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-8 flex items-center gap-2 text-text-secondary hover:text-white transition-colors duration-150"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="text-ui">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 -mt-40 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Poster */}
          <div className="flex-shrink-0">
            <motion.img
              src={getPosterUrl(movie.poster_path, 'w342') || getFallbackPoster()}
              alt={movie.title}
              className="w-48 md:w-56 rounded-card shadow-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            {movie.tagline && (
              <p className="text-text-muted text-ui italic mb-2">{movie.tagline}</p>
            )}
            <h1 className="text-h1 font-black text-white mb-2">{movie.title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-yellow-400" />
                  <span className="text-match font-semibold">{formatRating(movie.vote_average)}</span>
                  <span className="text-text-muted text-small">({formatVoteCount(movie.vote_count)})</span>
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center gap-1 text-text-secondary">
                  <FiCalendar className="w-4 h-4" />
                  <span className="text-ui">{formatDate(movie.release_date)}</span>
                </div>
              )}
              {movie.runtime && (
                <div className="flex items-center gap-1 text-text-secondary">
                  <FiClock className="w-4 h-4" />
                  <span className="text-ui">{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              {movie.original_language && (
                <div className="flex items-center gap-1 text-text-secondary">
                  <FiGlobe className="w-4 h-4" />
                  <span className="text-ui uppercase">{movie.original_language}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g) => (
                  <GenreBadge key={g.id} id={g.id} name={g.name} />
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-text-secondary text-body leading-relaxed mb-6 max-w-2xl">
              {movie.overview}
            </p>

            {/* Director */}
            {director && (
              <p className="text-text-secondary text-ui mb-6">
                <span className="text-white font-medium">Director: </span>
                {director.name}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              {isUpcoming ? (
                <motion.button
                  className="btn-play opacity-60 cursor-not-allowed bg-nv-elevated border border-nv-border/40 text-text-secondary flex items-center gap-1.5"
                  disabled
                >
                  <FiCalendar className="w-5 h-5" />
                  Releasing {formatDate(movie.release_date)}
                </motion.button>
              ) : (
                <>
                  <motion.button
                    className="btn-play"
                    onClick={() => navigate(`/watch/movie/${movieId}`)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiPlay className="w-5 h-5 fill-current" />
                    Play Now
                  </motion.button>

                  <motion.button
                    className="btn-info flex items-center gap-1.5 bg-brand-red/10 border border-brand-red/40 hover:bg-brand-red/20 text-brand-red font-bold hover:text-brand-red"
                    onClick={handleCreateWatchParty}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiTv className="w-4 h-4" />
                    Watch Together
                  </motion.button>
                </>
              )}

              <motion.button
                className="btn-info"
                onClick={() => setTrailerOpen(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Trailer
              </motion.button>

              <motion.button
                className={`btn-icon w-auto px-5 gap-2 flex items-center ${isFav ? 'border-brand-red text-brand-red' : ''}`}
                onClick={handleFavorite}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isFav ? <FiHeart className="w-4 h-4 fill-current" /> : <FiPlus className="w-4 h-4" />}
                <span className="text-ui">{isFav ? 'In Favorites' : 'Add to List'}</span>
              </motion.button>

              {user && !isUpcoming && (
                <>
                  {/* Mark as Watched */}
                  <motion.button
                    className={`btn-icon w-auto px-5 gap-2 flex items-center ${isWatched ? 'border-green-600 text-green-500 bg-green-950/10' : ''}`}
                    onClick={handleToggleWatched}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiCheckSquare className="w-4 h-4" />
                    <span className="text-ui">{isWatched ? '✓ Watched' : 'Mark as Watched'}</span>
                  </motion.button>

                  {/* Recommend to Friends */}
                  <motion.button
                    className="btn-icon w-auto px-5 gap-2 flex items-center text-text-secondary hover:text-white"
                    onClick={() => setRecommendModalOpen(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiUsers className="w-4 h-4 text-brand-red" />
                    <span className="text-ui">Recommend</span>
                  </motion.button>
                </>
              )}
            </div>

            {/* Budget & Revenue */}
            {(movie.budget > 0 || movie.revenue > 0) && (
              <div className="flex gap-8">
                {movie.budget > 0 && (
                  <div>
                    <p className="text-text-muted text-small uppercase tracking-wider mb-1">Budget</p>
                    <p className="text-white font-semibold">{formatCurrency(movie.budget)}</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <p className="text-text-muted text-small uppercase tracking-wider mb-1">Revenue</p>
                    <p className="text-white font-semibold">{formatCurrency(movie.revenue)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mb-12">
            <h2 className="text-h2 font-semibold text-white mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {cast.map((member) => (
                <motion.button
                  key={member.id}
                  className="flex-shrink-0 w-28 text-center group"
                  onClick={() => navigate(`/actor/${member.id}`)}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-nv-surface mx-auto mb-2 border-2 border-transparent group-hover:border-brand-red transition-colors duration-200">
                    <img
                      src={getProfileUrl(member.profile_path) || getFallbackPoster()}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = getFallbackPoster(); }}
                    />
                  </div>
                  <p className="text-white text-small font-medium line-clamp-1">{member.name}</p>
                  <p className="text-text-muted text-small line-clamp-1">{member.character}</p>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Production Companies */}
        {movie.production_companies && movie.production_companies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-h2 font-semibold text-white mb-4">Production</h2>
            <div className="flex flex-wrap gap-4">
              {movie.production_companies.map((co) => (
                <div key={co.id} className="flex items-center gap-2 bg-nv-surface rounded px-3 py-2">
                  <span className="text-text-secondary text-ui">{co.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Recommendations */}
      <div className="max-w-7xl mx-auto">
        <MovieRow
          title="Recommendations"
          items={recommendations?.results || []}
          mediaType="movie"
          viewAllLink={`/discover`}
        />
        <MovieRow
          title="Similar Movies"
          items={similar?.results || []}
          mediaType="movie"
        />
      </div>

      <Footer />

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videos={trailerVideos}
        title={movie.title}
      />

      <RecommendToFriendsModal
        isOpen={recommendModalOpen}
        onClose={() => setRecommendModalOpen(false)}
        movieId={movieId}
        mediaType="movie"
        title={movie.title}
      />
    </motion.div>
  );
};
