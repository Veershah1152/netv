import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiHeart, FiInfo, FiStar, FiShare2,
  FiPlus, FiChevronDown, FiGrid, FiCalendar
} from 'react-icons/fi';
import { useTvDetails, useTvCast, useTvRecommendations } from '@/hooks/useTv';
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
import { formatDate, formatRating, formatVoteCount } from '@/utils/formatUtils';

const PROGRESS_SAVE_INTERVAL = 5000;

export const WatchTv: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tvId = parseInt(id || '0');
  const navigate = useNavigate();

  const { addFavorite, removeFavorite, isFavorite, updateWatchProgress, watchProgress } = useAppStore();
  const { showToast } = useToast();

  // Season / episode from URL params (defaults to 1/1)
  const [season, setSeason] = useState(() => parseInt(searchParams.get('s') || '1'));
  const [episode, setEpisode] = useState(() => parseInt(searchParams.get('e') || '1'));
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);

  const { data: show, isLoading, isError, error, refetch } = useTvDetails(tvId);
  const { data: credits } = useTvCast(tvId);
  const { data: recommendations } = useTvRecommendations(tvId);

  // Fetch available players from our Player Service
  const { data: players, isLoading: isPlayersLoading, isError: isPlayersError } = usePlayers(tvId, 'tv', season, episode);

  const [activePlayerId, setActivePlayerId] = useState<string>('player1');
  const [sandboxActive, setSandboxActive] = useState<boolean>(false);

  const savedEntry = getSavedProgress(watchProgress, tvId, 'tv', season, episode);
  const savedProgressSeconds = savedEntry?.progress || 0;

  const currentProgressRef = useRef<number>(savedProgressSeconds);
  const saveTimerRef = useRef<number | null>(null);
  const isFav = isFavorite(tvId, 'tv');

  // Sync season/episode to URL
  useEffect(() => {
    setSearchParams({ s: season.toString(), e: episode.toString() }, { replace: true });
  }, [season, episode]);

  // Set default active player when players list is resolved
  useEffect(() => {
    if (players && players.length > 0) {
      // Default to Player 1 if available
      const firstStream = players.find(p => p.id === 'player1') || players[0];
      setActivePlayerId(firstStream.id);
    }
  }, [players]);

  // When player auto-advances the episode
  const handleEpisodeChange = useCallback((newSeason: number, newEpisode: number) => {
    setSeason(newSeason);
    setEpisode(newEpisode);
  }, []);

  // Throttled progress save
  const handleProgress = useCallback((currentTime: number) => {
    if (activePlayerId === 'trailer') return;

    currentProgressRef.current = currentTime;
    if (saveTimerRef.current) return;

    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      if (!show) return;

      updateWatchProgress({
        id: tvId,
        media_type: 'tv',
        title: show.name,
        poster_path: show.poster_path,
        progress: currentProgressRef.current,
        duration: 0, // TV episodes vary
        watchedAt: new Date().toISOString(),
        season,
        episode,
      });
    }, PROGRESS_SAVE_INTERVAL);
  }, [show, tvId, season, episode, updateWatchProgress, activePlayerId]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (!show || activePlayerId === 'trailer') return;
      const progress = currentProgressRef.current;
      if (progress > 30) {
        updateWatchProgress({
          id: tvId,
          media_type: 'tv',
          title: show.name,
          poster_path: show.poster_path,
          progress,
          duration: 0,
          watchedAt: new Date().toISOString(),
          season,
          episode,
        });
      }
    };
  }, [show, tvId, season, episode, updateWatchProgress, activePlayerId]);

  const handleEnded = useCallback(() => {
    showToast(`Episode ${episode} finished!`, 'success');
  }, [episode, showToast]);

  const handleFavorite = () => {
    if (!show) return;
    if (isFav) { removeFavorite(tvId, 'tv'); showToast('Removed from favorites', 'info'); }
    else { addFavorite({ ...show, media_type: 'tv' }); showToast('Added to favorites', 'success'); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard', 'success');
  };

  const goToEpisode = (s: number, e: number) => {
    setSeason(s);
    setEpisode(e);
    setShowSeasonPicker(false);
    currentProgressRef.current = 0; // reset progress for new episode
  };

  if (isLoading || isPlayersLoading) return <DetailPageSkeleton />;
  if (isError || isPlayersError || !show || !players) {
    return <ErrorComponent title="TV show not found" message={error?.message || 'Player service failure'} onRetry={() => refetch()} />;
  }

  const isUpcoming = show.first_air_date ? new Date(show.first_air_date) > new Date() : false;
  const cast = credits?.cast?.slice(0, 10) || [];
  const validSeasons = show.seasons?.filter((s) => s.season_number > 0) || [];
  const currentSeason = validSeasons.find((s) => s.season_number === season);
  const episodeCount = currentSeason?.episode_count || 1;
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
          <h1 className="text-white font-bold text-h3 line-clamp-1">{show.name}</h1>
          <p className="text-text-muted text-small">Season {season} · Episode {episode}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-1.5 text-ui transition-colors duration-150 ${isFav ? 'text-brand-red' : 'text-text-secondary hover:text-white'}`}
          >
            {isFav ? <FiHeart className="w-5 h-5 fill-current" /> : <FiPlus className="w-5 h-5" />}
            <span className="hidden sm:block">{isFav ? 'Saved' : 'Save'}</span>
          </button>
          <button onClick={handleShare} className="text-text-secondary hover:text-white transition-colors duration-150">
            <FiShare2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isUpcoming ? (
        <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 mb-8">
          <div className="relative aspect-video w-full rounded-card overflow-hidden border border-nv-border/40 shadow-2xl bg-nv-surface/20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
            <FiCalendar className="w-16 h-16 text-brand-red mb-4 animate-bounce" />
            <h2 className="text-h2 font-black text-white mb-2">Coming Soon to NetVeer</h2>
            <p className="text-body text-text-secondary max-w-md mb-6">
              This show has not been released yet. It will be available for streaming starting on{' '}
              <strong className="text-white">{formatDate(show.first_air_date)}</strong>.
            </p>
            <Link to={`/tv/${tvId}`} className="btn-primary flex items-center gap-1.5 font-bold">
              <FiInfo className="w-4 h-4" />
              <span>View Details</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Switcher above the video player */}
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 mb-4">
            <PlayerSwitcher
              players={players}
              activePlayerId={activePlayerId}
              onSelectPlayer={(id) => setActivePlayerId(id)}
              sandboxActive={sandboxActive}
              onToggleSandbox={setSandboxActive}
            />
          </div>

          {/* Player + Episode picker layout */}
          <div className="w-full flex flex-col xl:flex-row gap-0">
            {/* Player Container */}
            <div className="flex-1 px-4 md:px-8 xl:px-8">
              <UnifiedPlayer
                key={`${tvId}-s${season}-e${episode}-${activePlayer.id}`}
                player={activePlayer}
                onProgress={handleProgress}
                onEpisodeChange={handleEpisodeChange}
                onEnded={handleEnded}
                title={`${show.name} — S${season}E${episode} (${activePlayer.name})`}
                sandboxActive={sandboxActive}
              />
            </div>

            {/* Episode selector sidebar */}
            <div className="xl:w-80 bg-nv-surface xl:max-h-[30vw] xl:overflow-y-auto scrollbar-hide flex-shrink-0 border-l border-nv-border">
              {/* Season header */}
              <div className="p-4 border-b border-nv-border sticky top-0 bg-nv-surface z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-ui flex items-center gap-2">
                    <FiGrid className="w-4 h-4 text-brand-red" />
                    Episodes
                  </h3>

                  {/* Season dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSeasonPicker((p) => !p)}
                      className="flex items-center gap-1 text-white text-small bg-nv-elevated border border-nv-border rounded px-3 py-1.5 hover:border-white/30 transition-colors"
                    >
                      Season {season}
                      <FiChevronDown className="w-3 h-3" />
                    </button>
                    <AnimatePresence>
                      {showSeasonPicker && (
                        <motion.div
                          className="absolute right-0 top-full mt-1 bg-nv-elevated border border-nv-border rounded-card shadow-modal z-20 min-w-[100px]"
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                        >
                          {validSeasons.map((s) => (
                            <button
                              key={s.season_number}
                              onClick={() => goToEpisode(s.season_number, 1)}
                              className={`w-full text-left px-3 py-2 text-small transition-colors duration-150 ${s.season_number === season ? 'text-brand-red font-semibold' : 'text-text-secondary hover:text-white hover:bg-nv-surface'}`}
                            >
                              Season {s.season_number}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Episode list */}
              <div>
                {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => {
                  const epSaved = getSavedProgress(watchProgress, tvId, 'tv', season, ep);
                  const isActive = ep === episode;
                  const progressPct = epSaved && epSaved.duration > 0
                    ? Math.round((epSaved.progress / epSaved.duration) * 100)
                    : epSaved ? Math.min(Math.round((epSaved.progress / 1500) * 100), 100) : 0;

                  return (
                    <button
                      key={ep}
                      onClick={() => goToEpisode(season, ep)}
                      className={`w-full text-left px-4 py-3 border-b border-nv-border/50 transition-all duration-150 ${isActive ? 'bg-brand-red/10 border-l-2 border-l-brand-red' : 'hover:bg-nv-elevated'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-small font-bold flex-shrink-0 ${isActive ? 'bg-brand-red text-white' : 'bg-nv-elevated text-text-secondary'}`}>
                          {ep}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-small font-medium ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                            Episode {ep}
                          </p>
                          {progressPct > 0 && (
                            <div className="mt-1 h-0.5 bg-nv-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-red rounded-full"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <div className="flex-shrink-0">
                            <motion.div
                              className="w-1.5 h-5 bg-brand-red rounded-full"
                              animate={{ scaleY: [1, 0.5, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Click outside season picker */}
      {showSeasonPicker && (
        <div className="fixed inset-0 z-10" onClick={() => setShowSeasonPicker(false)} />
      )}

      {/* Content below */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-shrink-0">
            <img
              src={getPosterUrl(show.poster_path, 'w342') || getFallbackPoster()}
              alt={show.name}
              className="w-32 md:w-40 rounded-card shadow-card hidden sm:block"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-h2 font-bold text-white mb-2">{show.name}</h2>

            <div className="flex flex-wrap items-center gap-4 text-ui mb-3">
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1 text-match font-semibold">
                  <FiStar className="w-4 h-4 text-yellow-400" />
                  {formatRating(show.vote_average)}
                  <span className="text-text-muted">({formatVoteCount(show.vote_count)})</span>
                </span>
              )}
              {show.first_air_date && (
                <span className="text-text-secondary">{formatDate(show.first_air_date)}</span>
              )}
              <span className={`text-small border rounded px-2 py-0.5 ${show.status === 'Returning Series' ? 'border-match text-match' : 'border-nv-border text-text-secondary'}`}>
                {show.status}
              </span>
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {show.genres.map((g) => <GenreBadge key={g.id} id={g.id} name={g.name} />)}
              </div>
            )}

            <p className="text-text-secondary text-body leading-relaxed max-w-3xl mb-4">
              {show.overview}
            </p>

            {savedProgressSeconds > 30 && activePlayerId !== 'trailer' && (
              <p className="text-text-muted text-small mb-4">
                ⏱ Resuming S{season}E{episode} from {Math.floor(savedProgressSeconds / 60)}m {Math.floor(savedProgressSeconds % 60)}s
              </p>
            )}

            <Link
              to={`/tv/${tvId}`}
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

      <div className="max-w-7xl mx-auto">
        <MovieRow
          title="More Like This"
          items={recommendations?.results || []}
          mediaType="tv"
        />
      </div>

      <Footer />
    </motion.div>
  );
};
