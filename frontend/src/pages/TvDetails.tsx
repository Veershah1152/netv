import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiHeart, FiStar, FiCalendar, FiArrowLeft, FiPlus, FiTv, FiCheckSquare, FiUsers } from 'react-icons/fi';
import { useTvDetails, useTvVideos, useTvCast, useTvRecommendations } from '@/hooks/useTv';
import { getBackdropUrl, getPosterUrl, getProfileUrl, getFallbackPoster } from '@/utils/imageUtils';
import { formatDate, formatRating, formatVoteCount } from '@/utils/formatUtils';
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

export const TvDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tvId = parseInt(id || '0');
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useAppStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { data: show, isLoading, isError, error, refetch } = useTvDetails(tvId);
  const { data: videos } = useTvVideos(tvId);
  const { data: credits } = useTvCast(tvId);
  const { data: recommendations } = useTvRecommendations(tvId);

  const { data: isWatched } = useWatchedStatus(tvId, 'tv');
  const toggleWatchedMut = useToggleWatchedMutation();
  const createPartyMut = useCreatePartyMutation();

  if (isLoading) return <DetailPageSkeleton />;
  if (isError || !show) return (
    <ErrorComponent title="TV show not found" message={error?.message} onRetry={() => refetch()} />
  );

  const isFav = isFavorite(tvId, 'tv');
  const isUpcoming = show.first_air_date ? new Date(show.first_air_date) > new Date() : false;
  const trailerVideos = videos?.results || [];
  const cast = credits?.cast?.slice(0, 12) || [];
  const backdropUrl = imgError ? '' : getBackdropUrl(show.backdrop_path);

  const handleFavorite = () => {
    if (isFav) { removeFavorite(tvId, 'tv'); showToast('Removed from favorites', 'info'); }
    else { addFavorite({ ...show, media_type: 'tv' } as FavoriteItem); showToast('Added to favorites', 'success'); }
  };

  const handleToggleWatched = () => {
    if (!user) {
      showToast('Please sign in to save watched history!', 'info');
      navigate('/auth');
      return;
    }
    toggleWatchedMut.mutate(
      { movieId: tvId, mediaType: 'tv' },
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
      { movieId: tvId, mediaType: 'tv' },
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
    <motion.div className="page-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="relative w-full" style={{ height: '65vh', minHeight: '400px' }}>
        {backdropUrl && (
          <img src={backdropUrl} alt={show.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #141414 30%, rgba(20,20,20,0.4)), linear-gradient(to top, #141414 0%, transparent 50%)' }} />
        <button onClick={() => navigate(-1)} className="absolute top-20 left-8 flex items-center gap-2 text-text-secondary hover:text-white transition-colors duration-150">
          <FiArrowLeft className="w-5 h-5" />
          <span className="text-ui">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-12 -mt-40 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-shrink-0">
            <img src={getPosterUrl(show.poster_path, 'w342') || getFallbackPoster()} alt={show.name} className="w-48 md:w-56 rounded-card shadow-modal" />
          </div>

          <div className="flex-1">
            {show.tagline && <p className="text-text-muted text-ui italic mb-2">{show.tagline}</p>}
            <h1 className="text-h1 font-black text-white mb-2">{show.name}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {show.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-yellow-400" />
                  <span className="text-match font-semibold">{formatRating(show.vote_average)}</span>
                  <span className="text-text-muted text-small">({formatVoteCount(show.vote_count)})</span>
                </div>
              )}
              {show.first_air_date && (
                <div className="flex items-center gap-1 text-text-secondary">
                  <FiCalendar className="w-4 h-4" />
                  <span className="text-ui">{formatDate(show.first_air_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-text-secondary">
                <FiTv className="w-4 h-4" />
                <span className="text-ui">{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''} · {show.number_of_episodes} Episodes</span>
              </div>
              {show.status && (
                <span className={`text-small border rounded px-2 py-0.5 ${show.status === 'Returning Series' ? 'border-match text-match' : 'border-nv-border text-text-secondary'}`}>
                  {show.status}
                </span>
              )}
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {show.genres.map((g) => <GenreBadge key={g.id} id={g.id} name={g.name} />)}
              </div>
            )}

            <p className="text-text-secondary text-body leading-relaxed mb-6 max-w-2xl">{show.overview}</p>

            {show.created_by && show.created_by.length > 0 && (
              <p className="text-text-secondary text-ui mb-6">
                <span className="text-white font-medium">Created by: </span>
                {show.created_by.map((c) => c.name).join(', ')}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              {isUpcoming ? (
                <motion.button
                  className="btn-play opacity-60 cursor-not-allowed bg-nv-elevated border border-nv-border/40 text-text-secondary flex items-center gap-1.5"
                  disabled
                >
                  <FiCalendar className="w-5 h-5" />
                  Releasing {formatDate(show.first_air_date)}
                </motion.button>
              ) : (
                <>
                  <motion.button className="btn-play" onClick={() => navigate(`/watch/tv/${tvId}`)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <FiPlay className="w-5 h-5 fill-current" /> Play Now
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

              <motion.button className="btn-info" onClick={() => setTrailerOpen(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Trailer
              </motion.button>

              <motion.button className={`btn-icon w-auto px-5 gap-2 flex items-center ${isFav ? 'border-brand-red text-brand-red' : ''}`} onClick={handleFavorite} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
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
          </div>
        </div>

        {/* Seasons */}
        {show.seasons && show.seasons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-h2 font-semibold text-white mb-4">Seasons</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {show.seasons.filter((s) => s.season_number > 0).map((season) => (
                <div key={season.id} className="flex-shrink-0 w-36">
                  <div className="aspect-[2/3] rounded-card overflow-hidden bg-nv-surface mb-2">
                    <img src={getPosterUrl(season.poster_path, 'w185') || getFallbackPoster()} alt={season.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = getFallbackPoster(); }} />
                  </div>
                  <p className="text-white text-small font-medium line-clamp-1">{season.name}</p>
                  <p className="text-text-muted text-small">{season.episode_count} episodes</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mb-12">
            <h2 className="text-h2 font-semibold text-white mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {cast.map((member) => (
                <motion.button key={member.id} className="flex-shrink-0 w-28 text-center group" onClick={() => navigate(`/actor/${member.id}`)} whileHover={{ y: -4 }}>
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-nv-surface mx-auto mb-2 border-2 border-transparent group-hover:border-brand-red transition-colors duration-200">
                    <img src={getProfileUrl(member.profile_path) || getFallbackPoster()} alt={member.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = getFallbackPoster(); }} />
                  </div>
                  <p className="text-white text-small font-medium line-clamp-1">{member.name}</p>
                  <p className="text-text-muted text-small line-clamp-1">{member.character}</p>
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <MovieRow title="Recommendations" items={recommendations?.results || []} mediaType="tv" />
      </div>

      <Footer />
      <TrailerModal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} videos={trailerVideos} title={show.name} />

      <RecommendToFriendsModal
        isOpen={recommendModalOpen}
        onClose={() => setRecommendModalOpen(false)}
        movieId={tvId}
        mediaType="tv"
        title={show.name}
      />
    </motion.div>
  );
};
