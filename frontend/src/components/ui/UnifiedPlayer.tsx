import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiMaximize2 } from 'react-icons/fi';
import { PlayerInfo } from '@/types/player.types';

export interface UnifiedPlayerProps {
  player: PlayerInfo;
  onProgress?: (progress: number) => void;
  onEpisodeChange?: (season: number, episode: number) => void;
  onEnded?: () => void;
  title?: string;
  sandboxActive?: boolean;
}

interface VidkingMessage {
  type: string;
  currentTime?: number;
  duration?: number;
  season?: number;
  episode?: number;
  ended?: boolean;
}

const LOAD_TIMEOUT_MS = 12000; // Show error if loader times out in 12 seconds

export const UnifiedPlayer: React.FC<UnifiedPlayerProps> = ({
  player,
  onProgress,
  onEpisodeChange,
  onEnded,
  title,
  sandboxActive,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [playerUrl, setPlayerUrl] = useState(player.url);
  const timeoutRef = useRef<number | null>(null);

  // Reset status and set URL when player changes
  useEffect(() => {
    setStatus('loading');
    setPlayerUrl(player.url);
    setRetryCount(0);

    // Clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Set safety timeout for loading state
    timeoutRef.current = window.setTimeout(() => {
      setStatus((currentStatus) => {
        if (currentStatus === 'loading') {
          return 'error';
        }
        return currentStatus;
      });
    }, LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [player.id, player.url]);

  // Listen for postMessage events (specifically for Vidking or compatible frame interfaces)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data: VidkingMessage =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (!data || !data.type) return;

        switch (data.type) {
          case 'PLAYER_READY':
          case 'ready':
            setStatus('ready');
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
            break;

          case 'TIME_UPDATE':
          case 'timeupdate':
            if (typeof data.currentTime === 'number') {
              onProgress?.(data.currentTime);
            }
            break;

          case 'EPISODE_CHANGE':
          case 'episodeChange':
            if (typeof data.season === 'number' && typeof data.episode === 'number') {
              onEpisodeChange?.(data.season, data.episode);
            }
            break;

          case 'ENDED':
          case 'ended':
            onEnded?.();
            break;

          case 'ERROR':
            setStatus('error');
            break;
        }
      } catch {
        // Ignore parse errors from other frames
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress, onEpisodeChange, onEnded]);

  const handleLoad = () => {
    // If the timeout hasn't fired yet, count load as successful
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    // Allow minor buffering time for general embeds
    setTimeout(() => {
      setStatus((currentStatus) => {
        if (currentStatus === 'loading') {
          return 'ready';
        }
        return currentStatus;
      });
    }, 1000);
  };

  const handleError = () => {
    setStatus('error');
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    setStatus('loading');

    // Force iframe reload by appending a query time parameter
    const separator = player.url.includes('?') ? '&' : '?';
    setPlayerUrl(`${player.url}${separator}_retry=${Date.now()}`);

    // Set safety timeout again
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setStatus((currentStatus) => {
        if (currentStatus === 'loading') {
          return 'error';
        }
        return currentStatus;
      });
    }, LOAD_TIMEOUT_MS);
  };

  const handleFullscreen = () => {
    iframeRef.current?.requestFullscreen?.();
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-card overflow-hidden shadow-modal border border-nv-border/20">
      {/* Loading state */}
      <AnimatePresence>
        {status === 'loading' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-nv-black z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-14 h-14 border-4 border-brand-red border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-text-secondary text-ui mt-4">Connecting to server…</p>
            {title && <p className="text-white text-small font-medium mt-1">{title}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-nv-black z-10 px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-brand-red/10 flex items-center justify-center mb-4">
              <FiAlertTriangle className="w-8 h-8 text-brand-red" />
            </div>
            <h3 className="text-white text-h3 font-semibold mb-2">Unable to load this player.</h3>
            <p className="text-text-secondary text-body mb-6 max-w-sm">
              The requested streaming source did not respond. Try retrying or switching players.
            </p>
            <motion.button
              className="flex items-center gap-2 bg-brand-red text-white px-6 py-3 rounded-btn font-semibold text-ui"
              onClick={handleRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiRefreshCw className="w-4 h-4 animate-spin-hover" />
              Retry{retryCount > 0 ? ` (${retryCount})` : ''}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Iframe */}
      {status !== 'error' && playerUrl && (
        <iframe
          ref={iframeRef}
          src={playerUrl}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          sandbox={sandboxActive ? "allow-scripts allow-same-origin allow-presentation allow-forms" : undefined}
          onLoad={handleLoad}
          onError={handleError}
          title={title || player.name}
          style={{ border: 'none' }}
        />
      )}

      {/* Alternate Player Notice / Empty URL state */}
      {(!playerUrl || playerUrl === '') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-nv-black px-6 text-center">
          <FiAlertTriangle className="w-10 h-10 text-brand-red mb-3" />
          <p className="text-white text-body font-semibold">No URL available for this source.</p>
          <p className="text-text-muted text-small mt-1">Please try choosing another player.</p>
        </div>
      )}

      {/* Fullscreen Button */}
      <AnimatePresence>
        {status === 'ready' && player.type === 'iframe' && (
          <motion.button
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-nv-black/60 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-nv-black/80 transition-colors duration-150"
            onClick={handleFullscreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            title="Fullscreen"
          >
            <FiMaximize2 className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
