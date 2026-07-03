import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiHeart, FiInfo, FiStar, FiClock,
  FiCalendar, FiShare2, FiPlus
} from 'react-icons/fi';
import { useMovieDetails, useMovieCast, useMovieRecommendations } from '@/hooks/useMovies';
import { usePlayers } from '@/hooks/usePlayers';
import { useAppStore, getSavedProgress } from '@/store/useAppStore';
import { useToast } from '@/components/ui/Toast';
import { PlayerSwitcher } from '@/components/ui/PlayerSwitcher';
import { UnifiedPlayer } from '@/components/ui/UnifiedPlayer';
import { MovieRow } from '@/components/ui/MovieRow';
import { GenreBadge } from '@/components/ui/GenreBadge';
import { Footer } from '@/components/layout/Footer';
import { DetailPageSkeleton } from '@/components/ui/Skeleton';
import { ErrorComponent } from '@/components/ui/ErrorComponent';
import { getPosterUrl, getProfileUrl, getFallbackPoster } from '@/utils/imageUtils';
import { formatDate, formatRuntime, formatRating, formatVoteCount } from '@/utils/formatUtils';

const PROGRESS_SAVE_INTERVAL = 5000; // Save every 5 seconds

export const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0');
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, updateWatchProgress, watchProgress } = useAppStore();
  const { showToast } = useToast();

  const { data: movie, isLoading, isError, error, refetch } = useMovieDetails(movieId);
  const { data: credits } = useMovieCast(movieId);
  const { data: recommendations } = useMovieRecommendations(movieId);

  // Fetch available players from our Player Service
  const { data: players, isLoading: isPlayersLoading, isError: isPlayersError } = usePlayers(movieId, 'movie');

  const [activePlayerId, setActivePlayerId] = useState<string>('player1');
  const [sandboxActive, setSandboxActive] = useState<boolean>(false);

  const savedEntry = getSavedProgress(watchProgress, movieId, 'movie');
  const savedProgressSeconds = savedEntry?.progress || 0;

  const currentProgressRef = useRef<number>(savedProgressSeconds);
  const saveTimerRef = useRef<number | null>(null);

  const isFav = isFavorite(movieId, 'movie');

  // Set default active player when players list is resolved
  useEffect(() => {
    if (players && players.length > 0) {
      // Default to Player 1 if available, otherwise fallback to the first item
      const firstStream = players.find(p => p.id === 'player1') || players[0];
      setActivePlayerId(firstStream.id);
    }
  }, [players]);

  // Throttled progress save to Zustand (and thus localStorage)
  const handleProgress = useCallback((currentTime: number) => {
    // Only save progress if the user is watching an actual movie player, not the trailer
    if (activePlayerId === 'trailer') return;

    currentProgressRef.current = currentTime;

    if (saveTimerRef.current) return; // debounce

    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      if (!movie) return;

      updateWatchProgress({
        id: movieId,
        media_type: 'movie',
        title: movie.title,
        poster_path: movie.poster_path,
        progress: currentProgressRef.current,
        duration: movie.runtime ? movie.runtime * 60 : 0,
        watchedAt: new Date().toISOString(),
      });
    }, PROGRESS_SAVE_INTERVAL);
  }, [movie, movieId, updateWatchProgress, activePlayerId]);

  // Save progress on unmount too
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (!movie || activePlayerId === 'trailer') return;
      const progress = currentProgressRef.current;
      if (progress > 30) { // only save if watched > 30s
        updateWatchProgress({
          id: movieId,
          media_type: 'movie',
          title: movie.title,
          poster_path: movie.poster_path,
          progress,
          duration: movie.runtime ? movie.runtime * 60 : 0,
          watchedAt: new Date().toISOString(),
        });
      }
    };
  }, [movie, movieId, updateWatchProgress, activePlayerId]);

  const handleEnded = useCallback(() => {
    showToast('Finished! Check out recommendations below.', 'success');
  }, [showToast]);

  const handleFavorite = () => {
    if (!movie) return;
    if (isFav) {
      removeFavorite(movieId, 'movie');
      showToast('Removed from favorites', 'info');
    } else {
      addFavorite({ ...movie, media_type: 'movie' });
      showToast('Added to favorites', 'success');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard', 'success');
  };

  if (isLoading || isPlayersLoading) return <DetailPageSkeleton />;
  if (isError || isPlayersError || !movie || !players) {
    return <ErrorComponent title="Movie not found" message={error?.message || 'Player service failure'} onRetry={() => refetch()} />;
  }

  const isUpcoming = movie.release_date ? new Date(movie.release_date) > new Date() : false;
  const cast = credits?.cast?.slice(0, 10) || [];
  const activePlayer = players.find((p) => p.id === activePlayerId) || players[0];

  return (
    <motion.div
      className="min-h-screen bg-nv-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 md:px-8 py-4 pt-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors duration-150"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="text-ui hidden sm:block">Back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-h3 line-clamp-1">{movie.title}</h1>
          {movie.tagline && (
            <p className="text-text-muted text-small italic line-clamp-1">{movie.tagline}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-1.5 text-ui transition-colors duration-150 ${isFav ? 'text-brand-red' : 'text-text-secondary hover:text-white'}`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFav ? <FiHeart className="w-5 h-5 fill-current" /> : <FiPlus className="w-5 h-5" />}
            <span className="hidden sm:block">{isFav ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={handleShare}
            className="text-text-secondary hover:text-white transition-colors duration-150"
            title="Share"
          >
            <FiShare2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dynamic Player & Switcher Container */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 flex flex-col gap-4">
        {isUpcoming ? (
          <div className="relative aspect-video w-full rounded-card overflow-hidden border border-nv-border/40 shadow-2xl bg-nv-surface/20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
            <FiCalendar className="w-16 h-16 text-brand-red mb-4 animate-bounce" />
            <h2 className="text-h2 font-black text-white mb-2">Coming Soon to NetVeer</h2>
            <p className="text-body text-text-secondary max-w-md mb-6">
              This movie has not been released yet. It will be available for streaming starting on{' '}
              <strong className="text-white">{formatDate(movie.release_date)}</strong>.
            </p>
            <Link to={`/movie/${movieId}`} className="btn-primary flex items-center gap-1.5 font-bold">
              <FiInfo className="w-4 h-4" />
              <span>View Details</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Switcher above the video player */}
            <PlayerSwitcher
              players={players}
              activePlayerId={activePlayerId}
              onSelectPlayer={(id) => setActivePlayerId(id)}
              sandboxActive={sandboxActive}
              onToggleSandbox={setSandboxActive}
            />

            {/* Responsive player window (aspect-video gives 16:9 on desktop, scaling dynamically) */}
            <UnifiedPlayer
              key={activePlayer.id}
              player={activePlayer}
              onProgress={handleProgress}
              onEnded={handleEnded}
              title={`${movie.title} — ${activePlayer.name}`}
              sandboxActive={sandboxActive}
            />
          </>
        )}
      </div>

      {/* Content below player */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={getPosterUrl(movie.poster_path, 'w342') || getFallbackPoster()}
              alt={movie.title}
              className="w-32 md:w-40 rounded-card shadow-card hidden sm:block"
            />
          </div>

          {/* Movie info */}
          <div className="flex-1">
            <h2 className="text-h2 font-bold text-white mb-2">{movie.title}</h2>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-ui mb-3">
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1 text-match font-semibold">
                  <FiStar className="w-4 h-4 text-yellow-400" />
                  {formatRating(movie.vote_average)}
                  <span className="text-text-muted">({formatVoteCount(movie.vote_count)})</span>
                </span>
              )}
              {movie.release_date && (
                <span className="flex items-center gap-1 text-text-secondary">
                  <FiCalendar className="w-4 h-4" />
                  {formatDate(movie.release_date)}
                </span>
              )}
              {movie.runtime && (
                <span className="flex items-center gap-1 text-text-secondary">
                  <FiClock className="w-4 h-4" />
                  {formatRuntime(movie.runtime)}
                </span>
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
            <p className="text-text-secondary text-body leading-relaxed max-w-3xl mb-4">
              {movie.overview}
            </p>

            {/* Resume progress indicator */}
            {savedProgressSeconds > 30 && activePlayerId !== 'trailer' && (
              <div className="flex items-center gap-2 mb-4 text-small text-text-muted">
                <div className="flex-1 max-w-xs h-1 bg-nv-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-red rounded-full"
                    style={{
                      width: `${Math.min(100, (savedProgressSeconds / ((movie.runtime || 120) * 60)) * 100)}%`
                    }}
                  />
                </div>
                <span>Resumed from {Math.floor(savedProgressSeconds / 60)}m {Math.floor(savedProgressSeconds % 60)}s</span>
              </div>
            )}

            {/* Details link */}
            <Link
              to={`/movie/${movieId}`}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-ui transition-colors duration-150"
            >
              <FiInfo className="w-4 h-4" />
              Full details & cast
            </Link>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-10">
            <h3 className="text-h3 font-semibold text-white mb-4">Cast</h3>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {cast.map((member) => (
                <motion.button
                  key={member.id}
                  className="flex-shrink-0 w-20 text-center group"
                  onClick={() => navigate(`/actor/${member.id}`)}
                  whileHover={{ y: -3 }}
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-nv-surface mx-auto mb-1 border-2 border-transparent group-hover:border-brand-red transition-colors">
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
      </div>

      {/* Recommendations */}
      <div className="max-w-7xl mx-auto">
        <MovieRow
          title="More Like This"
          items={recommendations?.results || []}
          mediaType="movie"
        />
      </div>

      <Footer />
    </motion.div>
  );
};
