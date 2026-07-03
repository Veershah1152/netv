import React, { useState, useEffect, useRef } from 'react';
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

  // Synced states
  const [hostTime, setHostTime] = useState(0);
  const [hostPlaying, setHostPlaying] = useState(false);
  const [localOffset, setLocalOffset] = useState<number | null>(null);

  const channelRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hostTimerIntervalRef = useRef<any>(null);

  // Route protection
  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: `/party/${partyId}` } } });
    }
  }, [user, navigate, partyId]);

  // Determine if host
  useEffect(() => {
    if (party && user) {
      setIsHost(party.host_id === user.id);
      setHostPlaying(party.playback_state === 'play');
      setHostTime(party.playback_position);
    }
  }, [party, user]);

  // Increment host time locally if host is playing
  useEffect(() => {
    if (hostPlaying) {
      hostTimerIntervalRef.current = setInterval(() => {
        setHostTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (hostTimerIntervalRef.current) clearInterval(hostTimerIntervalRef.current);
    }
    return () => {
      if (hostTimerIntervalRef.current) clearInterval(hostTimerIntervalRef.current);
    };
  }, [hostPlaying]);

  // Connect to Supabase Realtime Channels for broadcast and presence
  useEffect(() => {
    if (!partyId || !user || !profile) return;

    // 1. Initialize channel
    const channel = supabase.channel(`watch-party:${partyId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    // 2. Set up listener for Broadcast messages
    channel
      .on('broadcast', { event: 'playback' }, (payload: any) => {
        const { state, position, senderId } = payload.payload;
        if (senderId !== user.id) {
          setHostPlaying(state === 'play');
          setHostTime(position);
          showToast(`Host updated playback to ${state} at ${formatTime(position)}`, 'info');
        }
      })
      .on('broadcast', { event: 'chat' }, (payload: any) => {
        const { id, username, message, timestamp } = payload.payload;
        setChatMessages((prev) => [...prev, { id, username, message, timestamp }]);
      });

    // 3. Set up listener for Presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const formattedList: Participant[] = [];
        Object.keys(state).forEach((key) => {
          const presenceArray = state[key] as any[];
          presenceArray.forEach((pres) => {
            formattedList.push({
              presenceRef: pres.presence_ref,
              userId: key,
              username: pres.username || 'Anonymous User',
              joinedAt: pres.joined_at,
            });
          });
        });
        setParticipants(formattedList);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((pres: any) => {
          showToast(`${pres.username || 'Someone'} joined the watch party!`, 'success');
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((pres: any) => {
          showToast(`${pres.username || 'Someone'} left the watch party.`, 'info');
        });
      });

    // 4. Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          username: profile.username,
          joined_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [partyId, user, profile]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = () => {
    if (!inputText.trim() || !channelRef.current) return;

    const newMessage = {
      id: crypto.randomUUID(),
      username: profile?.username || 'user',
      message: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Broadcast message
    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: newMessage,
    });

    // Append to local state
    setChatMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  // Host broadcast controller
  const handleHostControl = (action: 'play' | 'pause', seekTime?: number) => {
    if (!channelRef.current) return;

    const targetTime = seekTime !== undefined ? seekTime : hostTime;

    if (action === 'play') setHostPlaying(true);
    if (action === 'pause') setHostPlaying(false);
    if (seekTime !== undefined) setHostTime(seekTime);

    channelRef.current.send({
      type: 'broadcast',
      event: 'playback',
      payload: {
        state: action,
        position: targetTime,
        senderId: user?.id,
      },
    });

    // Optionally save state back to watched database
    supabase
      .from('watch_parties')
      .update({
        playback_state: action,
        playback_position: targetTime,
        state_updated_at: new Date().toISOString(),
      })
      .eq('id', partyId);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Invite link copied to clipboard!', 'success');
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Define player URL with dynamic starting parameter if any
  const basePlayerUrl = party.media_type === 'movie'
    ? `${import.meta.env.VITE_PLAYER1_URL || 'https://vidsrc.to/embed'}/movie/${party.movie_id}`
    : `${import.meta.env.VITE_PLAYER1_URL || 'https://vidsrc.to/embed'}/tv/${party.movie_id}/${party.season || 1}/${party.episode || 1}`;

  // Re-sync player by appending start time
  const playerUrl = localOffset !== null ? `${basePlayerUrl}?start=${localOffset}` : basePlayerUrl;

  const playerObj: PlayerInfo = {
    id: 'party_stream',
    name: 'Party Stream',
    type: 'iframe',
    url: playerUrl,
  };

  return (
    <div className="min-h-screen bg-nv-black text-white flex flex-col pt-16">
      {/* Top Controls Bar */}
      <div className="bg-nv-surface/60 border-b border-nv-border/40 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="bg-brand-red text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
            Watch Party
          </div>
          <span className="text-small font-bold text-white max-w-xs md:max-w-md line-clamp-1">
            {mediaTitle || 'Loading title...'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-nv-elevated border border-nv-border hover:border-white/20 text-small font-semibold text-text-secondary hover:text-white transition-colors"
          >
            <FiLink className="w-4 h-4 text-brand-red" />
            <span className="hidden sm:inline">Invite Friend</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-brand-red/10 border border-brand-red/35 hover:border-brand-red text-small font-semibold text-brand-red hover:text-white transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave Party</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player on Left, Chat on Right */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Side: Cinema Theater Screen */}
        <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 min-w-0">
          <div className="relative aspect-video w-full rounded-card overflow-hidden border border-nv-border/40 shadow-2xl bg-black">
            <UnifiedPlayer
              player={playerObj}
              title={mediaTitle}
              sandboxActive={false} // Disable sandbox to ensure video streams load
            />
          </div>

          {/* Sync Notifications/Actions for Guest */}
          {!isHost && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-brand-red/10 border border-brand-red/20 rounded-card gap-3">
              <div className="flex items-center gap-2 text-small text-text-secondary">
                <FiRefreshCw className={`w-4 h-4 text-brand-red ${hostPlaying ? 'animate-spin' : ''}`} />
                <span>
                  Host playback state: <strong className="text-white">{hostPlaying ? 'Playing' : 'Paused'}</strong> at{' '}
                  <strong className="text-white">{formatTime(hostTime)}</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  setLocalOffset(Math.floor(hostTime));
                  showToast('Re-syncing your stream with the Host!', 'success');
                }}
                className="bg-brand-red hover:bg-brand-red-dark text-white px-4 py-1.5 rounded-btn text-small font-bold transition-all flex items-center gap-1.5"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Sync Stream</span>
              </button>
            </div>
          )}

          {/* Host Synchronizer controls */}
          {isHost && (
            <div className="p-4 bg-nv-surface/40 border border-nv-border/40 rounded-card flex flex-col gap-3">
              <span className="text-small font-semibold text-text-secondary uppercase tracking-wider">
                👑 Host Controls Panel
              </span>
              <div className="flex flex-wrap items-center gap-4">
                {/* Play / Pause */}
                <button
                  onClick={() => handleHostControl(hostPlaying ? 'pause' : 'play')}
                  className={`flex items-center justify-center p-3 rounded-full text-white transition-all ${
                    hostPlaying ? 'bg-brand-red hover:bg-brand-red-dark' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {hostPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5 fill-current" />}
                </button>

                {/* Status Indicator */}
                <div className="flex flex-col text-small">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Playback Status</span>
                  <span className="font-bold text-white">
                    {hostPlaying ? 'Broadcasting: Play' : 'Broadcasting: Paused'} — {formatTime(hostTime)}
                  </span>
                </div>

                {/* Seek Timeline jump buttons */}
                <div className="flex gap-2 ml-auto">
                  {[-30, 30, 300].map((skip) => (
                    <button
                      key={skip}
                      onClick={() => handleHostControl(hostPlaying ? 'play' : 'pause', Math.max(0, hostTime + skip))}
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

        {/* Right Side: Shared Realtime Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-nv-border/40 bg-nv-surface/20 flex flex-col h-[500px] lg:h-auto">
          {/* Header tabs */}
          <div className="px-4 py-3 border-b border-nv-border/40 flex items-center justify-between">
            <span className="text-small font-bold text-white flex items-center gap-1.5">
              <FiMessageSquare className="w-4 h-4 text-brand-red" />
              <span>Live Party Panel</span>
            </span>
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <FiUsers className="w-3.5 h-3.5" />
              <span>{participants.length} watching</span>
            </span>
          </div>

          {/* Participant listing subpanel */}
          <div className="px-4 py-2 border-b border-nv-border/40 max-h-24 overflow-y-auto scrollbar-hide flex flex-wrap gap-1.5">
            {participants.map((participant) => (
              <div
                key={participant.presenceRef}
                className="flex items-center gap-1 bg-nv-elevated px-2 py-0.5 rounded-full text-[10px]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-text-secondary font-medium">@{participant.username}</span>
                {participant.userId === party.host_id && (
                  <span className="text-[8px] text-brand-red font-bold uppercase ml-0.5">Host</span>
                )}
              </div>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0 scrollbar-hide bg-black/10">
            {chatMessages.length === 0 ? (
              <p className="text-center text-small text-text-muted py-8">
                Welcome to the Watch Together lobby! Start sending messages...
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="flex flex-col text-small">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-[11px] hover:underline cursor-pointer">
                      @{msg.username}
                    </span>
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

          {/* Chat text box input */}
          <div className="p-3 bg-nv-surface/40 border-t border-nv-border/40 flex gap-2">
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
