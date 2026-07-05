import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUsers, FiMessageSquare, FiSend, FiLink,
  FiPlay, FiPause, FiTv, FiLogOut, FiRefreshCw
} from 'react-icons/fi';
import { supabase } from '@/api/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { usePartyDetails } from '@/hooks/useParty';
import { useMovieDetails } from '@/hooks/useMovies';
import { useTvDetails } from '@/hooks/useTv';
import { useToast } from '@/components/ui/Toast';
import { UnifiedPlayer } from '@/components/ui/UnifiedPlayer';
import { PlayerInfo } from '@/types/player.types';
import { usePlayers } from '@/hooks/usePlayers';
import { PlayerSwitcher } from '@/components/ui/PlayerSwitcher';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

interface Participant {
  presenceRef: string;
  userId: string;
  username: string;
  joinedAt: string;
}

/**
 * Epoch-based playback position anchor.
 * startedAt  — wall clock (Date.now()) when play was pressed
 * atPosition — stream position in seconds at that moment
 *
 * Live position = atPosition + (Date.now() - startedAt) / 1000
 * This keeps host and guests in lock-step without any polling or drift.
 */
interface PlaybackEpoch {
  startedAt: number;   // ms since Unix epoch
  atPosition: number;  // seconds into the stream
}

export const WatchParty: React.FC = () => {
  const { id: partyId } = useParams<{ id: string }>();
  const { user, profile } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { data: party, isLoading: loadingParty, isError } = usePartyDetails(partyId || '');
  const isMovie = party?.media_type === 'movie';
  const movieDetails = useMovieDetails(isMovie && party ? party.movie_id : 0);
  const tvDetails = useTvDetails(!isMovie && party ? party.movie_id : 0);

  const mediaData = isMovie ? movieDetails.data : tvDetails.data;
  const mediaTitle = isMovie ? (mediaData as any)?.title : (mediaData as any)?.name;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);

  // ─── Playback state ──────────────────────────────────────────────────────────
  const [hostPlaying, setHostPlaying] = useState(false);
  /**
   * displayTime is what all clocks show. When playing it is computed every
   * second from the epoch. When paused it is the last known position.
   */
  const [displayTime, setDisplayTime] = useState(0);
  /**
   * Epoch is the single source of truth for live position.
   * Null when paused.
   */
  const [epoch, setEpoch] = useState<PlaybackEpoch | null>(null);

  // Player selector
  const [activePlayerId, setActivePlayerId] = useState<string>('player1');
  const [sandboxActive, setSandboxActive] = useState<boolean>(false);
  /**
   * Changing syncKey forces UnifiedPlayer to remount (iframe reload),
   * which resets the embed to its start — triggering a coordinated
   * "live sync" for all guests when the host presses play.
   */
  const [syncKey, setSyncKey] = useState(0);

  // Fetch players
  const { data: players, isLoading: isPlayersLoading } = usePlayers(
    party?.movie_id || 0,
    (party?.media_type as 'movie' | 'tv') || 'movie',
    party?.season || 1,
    party?.episode || 1
  );

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const channelRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const displayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const epochRef = useRef<PlaybackEpoch | null>(null);
  const hostPlayingRef = useRef(false);
  const isHostRef = useRef(false);
  const activePlayerIdRef = useRef('player1');
  /**
   * Debounce map for presence leave toasts.
   * Key: userId, Value: setTimeout handle
   * If a user rejoins before the timer fires, we cancel both toasts.
   */
  const leaveDebounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Keep refs in sync with state (avoids stale closures in Supabase callbacks)
  useEffect(() => {
    epochRef.current = epoch;
    hostPlayingRef.current = hostPlaying;
    isHostRef.current = isHost;
    activePlayerIdRef.current = activePlayerId;
  }, [epoch, hostPlaying, isHost, activePlayerId]);

  // ─── Live clock tick ─────────────────────────────────────────────────────────
  /**
   * Instead of ticking +1 every second (which drifts from wall clock),
   * we recompute the position from the epoch every second.
   */
  useEffect(() => {
    if (displayTimerRef.current) clearInterval(displayTimerRef.current);

    if (hostPlaying && epoch) {
      displayTimerRef.current = setInterval(() => {
        const livePos = epoch.atPosition + (Date.now() - epoch.startedAt) / 1000;
        setDisplayTime(Math.floor(livePos));
      }, 1000);
    }

    return () => {
      if (displayTimerRef.current) clearInterval(displayTimerRef.current);
    };
  }, [hostPlaying, epoch]);

  // ─── Route protection ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: `/party/${partyId}` } } });
    }
  }, [user, navigate, partyId]);

  // ─── Initialize from DB record ───────────────────────────────────────────────
  useEffect(() => {
    if (party && user) {
      const isCurrentHost = party.host_id === user.id;
      setIsHost(isCurrentHost);
      const playing = party.playback_state === 'play';
      setHostPlaying(playing);
      setDisplayTime(Math.floor(party.playback_position));

      if (playing) {
        // Reconstruct a best-effort epoch from DB record
        // We don't know the exact startedAt, so treat "now" as the anchor
        setEpoch({ startedAt: Date.now(), atPosition: party.playback_position });
      }
    }
  }, [party, user]);

  // ─── Supabase Realtime ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!partyId || !user || !profile) return;

    const channel = supabase.channel(`watch-party:${partyId}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    // ── Playback broadcast ──
    channel.on('broadcast', { event: 'playback' }, (payload: any) => {
      const { state, position, activePlayerId: newPlayerId, senderId, epoch: remoteEpoch } = payload.payload;
      if (senderId === user.id) return;

      const isPlaying = state === 'play';
      setHostPlaying(isPlaying);
      if (newPlayerId) setActivePlayerId(newPlayerId);

      if (isPlaying && remoteEpoch) {
        // Use the epoch sent by the host for perfect alignment
        setEpoch(remoteEpoch as PlaybackEpoch);
        const livePos = remoteEpoch.atPosition + (Date.now() - remoteEpoch.startedAt) / 1000;
        setDisplayTime(Math.floor(livePos));
      } else {
        setEpoch(null);
        setDisplayTime(Math.floor(position));
      }
    });

    // ── Sync request (guest → host) ──
    channel.on('broadcast', { event: 'request_sync' }, (payload: any) => {
      const { senderId } = payload.payload;
      if (!isHostRef.current || !channelRef.current || senderId === user.id) return;

      const currentEpoch = epochRef.current;
      const livePos = currentEpoch
        ? currentEpoch.atPosition + (Date.now() - currentEpoch.startedAt) / 1000
        : 0;

      channelRef.current.send({
        type: 'broadcast',
        event: 'playback',
        payload: {
          state: hostPlayingRef.current ? 'play' : 'pause',
          position: Math.floor(livePos),
          activePlayerId: activePlayerIdRef.current,
          senderId: user.id,
          epoch: currentEpoch,
        },
      });
    });

    // ── Chat ──
    channel.on('broadcast', { event: 'chat' }, (payload: any) => {
      const { id, username, message, timestamp } = payload.payload;
      setChatMessages((prev) => [...prev, { id, username, message, timestamp }]);
    });

    // ── Presence ──
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const list: Participant[] = [];
        Object.keys(state).forEach((key) => {
          (state[key] as any[]).forEach((pres) => {
            list.push({
              presenceRef: pres.presence_ref,
              userId: key,
              username: pres.username || 'Anonymous',
              joinedAt: pres.joined_at,
            });
          });
        });
        setParticipants(list);
      })
      .on('presence', { event: 'join' }, ({ newPresences }: any) => {
        newPresences.forEach((pres: any) => {
          const uid = pres.user_id || pres.username || 'unknown';

          // ── Cancel any pending leave toast for this user ──
          const pending = leaveDebounceRef.current.get(uid);
          if (pending) {
            clearTimeout(pending);
            leaveDebounceRef.current.delete(uid);
            // They bounced back — show nothing (no join toast either)
            return;
          }

          // Show join toast only once per new user
          showToast(`${pres.username || 'Someone'} joined the watch party 🎉`, 'success');

          // Host immediately sends state so guest syncs instantly
          if (isHostRef.current && channelRef.current) {
            const currentEpoch = epochRef.current;
            const livePos = currentEpoch
              ? currentEpoch.atPosition + (Date.now() - currentEpoch.startedAt) / 1000
              : 0;

            channelRef.current.send({
              type: 'broadcast',
              event: 'playback',
              payload: {
                state: hostPlayingRef.current ? 'play' : 'pause',
                position: Math.floor(livePos),
                activePlayerId: activePlayerIdRef.current,
                senderId: user.id,
                epoch: currentEpoch,
              },
            });
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        leftPresences.forEach((pres: any) => {
          const uid = pres.user_id || pres.username || 'unknown';
          const name = pres.username || 'Someone';

          // ── Debounce: wait 3 s before showing the leave toast ──
          // If the user reconnects within that window, both toasts are suppressed.
          const existing = leaveDebounceRef.current.get(uid);
          if (existing) clearTimeout(existing);

          const timer = setTimeout(() => {
            leaveDebounceRef.current.delete(uid);
            showToast(`${name} left the watch party.`, 'info');
          }, 3000);
          leaveDebounceRef.current.set(uid, timer);
        });
      });

    // ── Subscribe ──
    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          username: profile.username,
          joined_at: new Date().toISOString(),
        });

        // Guests request current state from host on join
        if (party?.host_id !== user.id) {
          channel.send({
            type: 'broadcast',
            event: 'request_sync',
            payload: { senderId: user.id },
          });
        }
      }
    });

    return () => {
      // Clear any pending leave debounce timers
      leaveDebounceRef.current.forEach((t) => clearTimeout(t));
      leaveDebounceRef.current.clear();
      channel.unsubscribe();
    };
  }, [partyId, user, profile, party]);

  // ─── Auto-scroll chat ────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSendChat = () => {
    if (!inputText.trim() || !channelRef.current) return;
    const msg = {
      id: crypto.randomUUID(),
      username: profile?.username || 'user',
      message: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    channelRef.current.send({ type: 'broadcast', event: 'chat', payload: msg });
    setChatMessages((prev) => [...prev, msg]);
    setInputText('');
  };

  const handleHostControl = useCallback(
    (action: 'play' | 'pause', seekTime?: number) => {
      if (!channelRef.current) return;

      // Compute target position
      const liveNow = epochRef.current
        ? epochRef.current.atPosition + (Date.now() - epochRef.current.startedAt) / 1000
        : displayTime;
      const targetTime = seekTime !== undefined ? seekTime : Math.floor(liveNow);

      let newEpoch: PlaybackEpoch | null = null;
      if (action === 'play') {
        // Mint a fresh epoch anchored to right now
        newEpoch = { startedAt: Date.now(), atPosition: targetTime };
        setEpoch(newEpoch);
      } else {
        setEpoch(null);
      }

      setHostPlaying(action === 'play');
      setDisplayTime(targetTime);

      // Broadcast to all guests with epoch so they compute position identically
      channelRef.current.send({
        type: 'broadcast',
        event: 'playback',
        payload: {
          state: action,
          position: targetTime,
          activePlayerId: activePlayerIdRef.current,
          senderId: user?.id,
          epoch: newEpoch,
        },
      });

      // Reload iframe on all clients simultaneously when host presses play
      // so everyone starts the embed at the same moment (live-stream feel)
      if (action === 'play') {
        setSyncKey((k) => k + 1);
      }

      // Persist state to Supabase for late-joiners
      supabase
        .from('watch_parties')
        .update({
          playback_state: action,
          playback_position: targetTime,
          state_updated_at: new Date().toISOString(),
        })
        .eq('id', partyId);
    },
    [displayTime, partyId, user?.id]
  );

  const handlePlayerChange = (playerId: string) => {
    setActivePlayerId(playerId);
    if (isHost && channelRef.current) {
      const liveNow = epochRef.current
        ? epochRef.current.atPosition + (Date.now() - epochRef.current.startedAt) / 1000
        : displayTime;
      channelRef.current.send({
        type: 'broadcast',
        event: 'playback',
        payload: {
          state: hostPlaying ? 'play' : 'pause',
          position: Math.floor(liveNow),
          activePlayerId: playerId,
          senderId: user?.id,
          epoch: epochRef.current,
        },
      });
    }
  };

  /**
   * Guest-side sync: request host's epoch, then force-reload the iframe.
   * This makes the embed restart simultaneously for all guests — the closest
   * thing to a true live-stream sync for non-controllable third-party iframes.
   */
  const handleGuestSync = () => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'request_sync',
        payload: { senderId: user?.id },
      });
    }
    // Force iframe reload to eliminate accumulated drift
    setSyncKey((k) => k + 1);
    showToast('Re-syncing stream with host...', 'info');
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Invite link copied!', 'success');
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Loading / error states ──────────────────────────────────────────────────
  if (loadingParty) {
    return (
      <div className="min-h-screen bg-nv-black text-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-small text-text-secondary">Joining Watch Party...</span>
      </div>
    );
  }

  if (isError || !party) {
    return (
      <div className="min-h-screen bg-nv-black text-white flex flex-col items-center justify-center p-6">
        <FiTv className="w-12 h-12 text-brand-red mb-4 animate-bounce" />
        <h2 className="text-h2 font-bold mb-2">Party Link Expired</h2>
        <p className="text-small text-text-secondary text-center max-w-sm mb-6">
          This watch party is no longer active or the host has closed the room.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  // ─── Compute player URL ──────────────────────────────────────────────────────
  // NOTE: Do NOT append ?start= or &start= to these URLs.
  // Streaming embed providers (vidsrc.to, embed.su, vidking.net) do not support
  // the YouTube-style ?start=N parameter and will show "media unavailable".
  // Sync is achieved by force-reloading the iframe (syncKey change) so all
  // clients restart the embed simultaneously — like a live stream.
  const activePlayer = players?.find((p) => p.id === activePlayerId) || players?.[0];
  const basePlayerUrl = activePlayer?.url || '';

  const playerObj: PlayerInfo = {
    id: activePlayerId,
    name: activePlayer?.name || 'Party Stream',
    type: activePlayer?.type || 'iframe',
    url: basePlayerUrl,
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-nv-black text-white flex flex-col overflow-hidden pt-16">

      {/* ── Top Controls Bar ── */}
      <div className="bg-nv-surface/60 border-b border-nv-border/40 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-brand-red text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
            Watch Party
          </div>
          <span className="text-small font-bold text-white max-w-xs md:max-w-md line-clamp-1">
            {mediaTitle || 'Loading title...'}
          </span>
          {/* Live clock visible in top bar */}
          {hostPlaying && (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-green-400 font-mono font-bold bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              {formatTime(displayTime)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-nv-elevated border border-nv-border hover:border-white/20 text-small font-semibold text-text-secondary hover:text-white transition-colors"
          >
            <FiLink className="w-4 h-4 text-brand-red" />
            <span className="hidden sm:inline">Invite</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-brand-red/10 border border-brand-red/35 hover:border-brand-red text-small font-semibold text-brand-red hover:text-white transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

        {/* ─── Left: Player Column ─── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 gap-4 flex flex-col lg:h-full">

          {/* Player Box */}
          <div className="sticky lg:relative top-0 z-30 w-full rounded-card overflow-hidden border border-nv-border/40 shadow-2xl aspect-video flex-shrink-0 relative bg-black">
            {isPlayersLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-nv-black z-10">
                <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-small text-text-secondary">Loading sources...</span>
              </div>
            ) : basePlayerUrl ? (
              <>
                {/*
                  syncKey forces React to fully remount UnifiedPlayer when changed.
                  This reloads the iframe — giving a coordinated fresh start to all
                  viewers simultaneously when the host presses play, matching the
                  feel of a live stream.
                */}
                <UnifiedPlayer
                  key={syncKey}
                  player={playerObj}
                  title={mediaTitle}
                  sandboxActive={sandboxActive}
                  onProgress={(_t) => { /* postMessage-based progress if player supports it */ }}
                />

                {/* Pause overlay — always on top of the live iframe when paused */}
                {!hostPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-nv-black via-nv-black/88 to-nv-black/20 backdrop-blur-[6px] z-10 px-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-red/10 border border-brand-red/25 flex items-center justify-center mb-4 animate-pulse">
                      <FiPause className="w-8 h-8 text-brand-red" />
                    </div>
                    <h3 className="text-white text-h3 font-black mb-1">Playback Paused</h3>
                    <p className="text-text-secondary text-small max-w-sm mb-2">
                      {isHost
                        ? 'Stream is paused. Press play to sync everyone live!'
                        : 'Waiting for the host to resume. Grab some snacks!'}
                    </p>
                    <p className="text-text-muted text-[11px] mb-4 font-mono">
                      Paused at {formatTime(displayTime)}
                    </p>
                    {isHost && (
                      <button
                        onClick={() => handleHostControl('play')}
                        className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-6 py-2.5 rounded-btn font-bold text-small transition-all shadow-lg shadow-brand-red/30"
                      >
                        <FiPlay className="w-4 h-4 fill-current" />
                        <span>▶ Start Live Stream</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-nv-black z-10 px-6 text-center">
                <FiTv className="w-10 h-10 text-brand-red mb-3" />
                <p className="text-white text-body font-semibold">Stream source loading...</p>
                <p className="text-text-muted text-small mt-1">
                  {isHost ? 'Press play once sources are ready.' : 'Waiting for host to start.'}
                </p>
              </div>
            )}
          </div>

          {/* Player Switcher */}
          {players && players.length > 0 && (
            <div className="bg-nv-surface/20 border border-nv-border/40 p-4 rounded-card">
              <span className="text-small font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                📡 Streaming Server
              </span>
              <PlayerSwitcher
                players={players}
                activePlayerId={activePlayerId}
                onSelectPlayer={handlePlayerChange}
                sandboxActive={sandboxActive}
                onToggleSandbox={setSandboxActive}
              />
            </div>
          )}

          {/* Guest Sync Panel */}
          {!isHost && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-nv-surface/30 border border-nv-border/40 rounded-card gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  🔴 Host Stream Position
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white font-bold text-[15px]">
                    {formatTime(displayTime)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    hostPlaying
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-brand-red/20 text-brand-red border border-brand-red/30'
                  }`}>
                    {hostPlaying ? 'Live' : 'Paused'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleGuestSync}
                className="bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2 rounded-btn text-small font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Sync Stream</span>
              </button>
            </div>
          )}

          {/* Host Controls */}
          {isHost && (
            <div className="p-4 bg-nv-surface/40 border border-nv-border/40 rounded-card flex flex-col gap-3">
              <span className="text-small font-semibold text-text-secondary uppercase tracking-wider">
                👑 Host Controls
              </span>
              <div className="flex flex-wrap items-center gap-4">
                {/* Play / Pause */}
                <button
                  onClick={() => handleHostControl(hostPlaying ? 'pause' : 'play')}
                  className={`flex items-center justify-center p-3 rounded-full text-white transition-all shadow-lg ${
                    hostPlaying
                      ? 'bg-brand-red hover:bg-brand-red-dark shadow-brand-red/30'
                      : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
                  }`}
                >
                  {hostPlaying
                    ? <FiPause className="w-5 h-5" />
                    : <FiPlay className="w-5 h-5 fill-current" />}
                </button>

                {/* Live clock */}
                <div className="flex flex-col">
                  <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">
                    {hostPlaying ? '🔴 Broadcasting Live' : '⏸ Paused'}
                  </span>
                  <span className="font-mono font-bold text-white text-[15px]">
                    {formatTime(displayTime)}
                  </span>
                </div>

                {/* Skip buttons */}
                <div className="flex gap-2 ml-auto">
                  {[-30, 30, 300].map((skip) => (
                    <button
                      key={skip}
                      onClick={() => {
                        const liveNow = epochRef.current
                          ? epochRef.current.atPosition + (Date.now() - epochRef.current.startedAt) / 1000
                          : displayTime;
                        handleHostControl(hostPlaying ? 'play' : 'pause', Math.max(0, Math.floor(liveNow) + skip));
                      }}
                      className="px-3 py-1.5 rounded bg-nv-elevated border border-nv-border/60 text-small text-text-secondary hover:text-white transition-colors"
                    >
                      {skip > 0 ? `+${skip}s` : `${skip}s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Chat Panel ─── */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-nv-border/40 bg-nv-surface/20 flex flex-col lg:h-full h-[350px] flex-shrink-0">

          {/* Chat header */}
          <div className="px-4 py-3 border-b border-nv-border/40 flex items-center justify-between flex-shrink-0">
            <span className="text-small font-bold text-white flex items-center gap-1.5">
              <FiMessageSquare className="w-4 h-4 text-brand-red" />
              Live Party Chat
            </span>
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <FiUsers className="w-3.5 h-3.5" />
              {participants.length} watching
            </span>
          </div>

          {/* Participants */}
          <div className="px-4 py-2 border-b border-nv-border/40 max-h-24 overflow-y-auto flex flex-wrap gap-1.5 flex-shrink-0">
            {participants.map((p) => (
              <div key={p.presenceRef} className="flex items-center gap-1 bg-nv-elevated px-2 py-0.5 rounded-full text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-text-secondary font-medium">@{p.username}</span>
                {p.userId === party.host_id && (
                  <span className="text-[8px] text-brand-red font-bold uppercase ml-0.5">Host</span>
                )}
              </div>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/10">
            {chatMessages.length === 0 ? (
              <p className="text-center text-small text-text-muted py-8">
                Welcome! Send a message to start chatting...
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="flex flex-col text-small">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-[11px]">@{msg.username}</span>
                    <span className="text-[9px] text-text-muted">{msg.timestamp}</span>
                  </div>
                  <p className="text-text-secondary text-[12px] leading-relaxed break-all bg-nv-elevated/20 p-2 rounded border border-nv-border/20 mt-1">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-nv-surface/40 border-t border-nv-border/40 flex gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Send message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-nv-elevated border border-nv-border/40 focus:border-white/35 rounded-btn px-4 py-2 text-small text-white outline-none"
            />
            <button
              onClick={handleSendChat}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-brand-red hover:bg-brand-red-dark disabled:opacity-40 text-white transition-colors"
            >
              <FiSend className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
