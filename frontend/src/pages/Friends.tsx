import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiUserPlus,
  FiMail, FiX, FiCheck, FiTrash2, FiPlay
} from 'react-icons/fi';
import {
  useFriendsList,
  useFriendRequests,
  useReceivedRecommendations,
  useFriendsSearch,
  useSendFriendRequestMutation,
  useRespondToRequestMutation,
  useRemoveFriendMutation,
  useMarkRecReadMutation
} from '@/hooks/useSocial';
import { useMovieDetails } from '@/hooks/useMovies';
import { useTvDetails } from '@/hooks/useTv';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { getPosterUrl, getFallbackPoster } from '@/utils/imageUtils';
import { Footer } from '@/components/layout/Footer';

// Helper component to resolve and display TMDB details inside recommendation cards
const RecommendationMedia: React.FC<{
  movieId: number;
  mediaType: 'movie' | 'tv';
}> = ({ movieId, mediaType }) => {
  const isMovie = mediaType === 'movie';
  const movieDetails = useMovieDetails(isMovie ? movieId : 0);
  const tvDetails = useTvDetails(!isMovie ? movieId : 0);

  const isLoading = isMovie ? movieDetails.isLoading : tvDetails.isLoading;
  const data = isMovie ? movieDetails.data : tvDetails.data;

  if (isLoading) {
    return <div className="w-16 h-24 bg-nv-elevated animate-pulse rounded" />;
  }

  const title = isMovie ? (data as any)?.title : (data as any)?.name;
  const poster = (data as any)?.poster_path;

  return (
    <div className="flex gap-3">
      <img
        src={getPosterUrl(poster || null, 'w92') || getFallbackPoster()}
        alt={title}
        className="w-12 h-18 object-cover rounded shadow-card"
      />
      <div className="flex flex-col justify-center">
        <span className="text-small font-bold text-white line-clamp-1">{title}</span>
        <span className="text-[10px] text-text-muted capitalize">{mediaType}</span>
      </div>
    </div>
  );
};

export const Friends: React.FC = () => {
  const { user } = useAuthStore();
  const { data: friends, refetch: refetchFriends } = useFriendsList();
  const { data: requests, refetch: refetchRequests } = useFriendRequests();
  const { data: recs, refetch: refetchRecs } = useReceivedRecommendations();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'recs'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading: searching } = useFriendsSearch(searchQuery);

  const sendRequest = useSendFriendRequestMutation();
  const respondRequest = useRespondToRequestMutation();
  const removeFriendMut = useRemoveFriendMutation();
  const markRead = useMarkRecReadMutation();

  // Route protection
  React.useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  const handleAddFriend = (receiverId: string) => {
    sendRequest.mutate(receiverId, {
      onSuccess: () => {
        showToast('Friend request sent!', 'success');
        setSearchQuery('');
      },
      onError: (err: any) => {
        showToast(err.message || 'Failed to send request', 'error');
      },
    });
  };

  const handleResponse = (requestId: string, status: 'accepted' | 'rejected') => {
    respondRequest.mutate(
      { requestId, status },
      {
        onSuccess: () => {
          showToast(status === 'accepted' ? 'Friend request accepted!' : 'Friend request declined', 'info');
          refetchFriends();
          refetchRequests();
        },
      }
    );
  };

  const handleRemoveFriend = (friendId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      removeFriendMut.mutate(friendId, {
        onSuccess: () => {
          showToast('Friend removed', 'info');
          refetchFriends();
        },
      });
    }
  };

  const handleMarkRead = (recId: string) => {
    markRead.mutate(recId, {
      onSuccess: () => {
        refetchRecs();
      },
    });
  };

  const incomingRequests = requests?.incoming || [];
  const outgoingRequests = requests?.outgoing || [];
  const unreadRecsCount = recs?.filter((r) => !r.is_read).length || 0;

  return (
    <div className="min-h-screen bg-nv-black text-white flex flex-col pt-24">
      <div className="max-w-4xl w-full mx-auto px-4 md:px-8 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <FiUsers className="w-8 h-8 text-brand-red" />
          <h1 className="text-h1 font-black">Social Hub</h1>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-nv-border mb-6">
          {[
            { id: 'friends', label: 'Friends', icon: FiUsers, count: friends?.length },
            { id: 'requests', label: 'Requests', icon: FiUserPlus, count: incomingRequests.length },
            { id: 'recs', label: 'Recommendations', icon: FiMail, count: unreadRecsCount },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-semibold text-small transition-all relative ${
                  isActive
                    ? 'border-brand-red text-white'
                    : 'border-transparent text-text-secondary hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="bg-brand-red text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="min-h-[400px]">
          {/* TAB 1: FRIENDS */}
          {activeTab === 'friends' && (
            <div className="space-y-6">
              {/* Add Friends Section */}
              <div className="p-4 bg-nv-surface/40 border border-nv-border/40 rounded-card backdrop-blur-sm">
                <h3 className="text-small font-bold text-white uppercase tracking-wider mb-3">Add Friend</h3>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-nv-elevated border border-nv-border/40 focus:border-white/35 rounded px-4 py-2 text-small outline-none"
                  />
                </div>

                {/* Live search results overlay */}
                <AnimatePresence>
                  {searchQuery.trim().length > 1 && (
                    <motion.div
                      className="mt-3 bg-nv-elevated border border-nv-border rounded-card overflow-hidden max-w-md shadow-modal"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      {searching ? (
                        <p className="text-center text-small text-text-muted py-4">Searching profiles...</p>
                      ) : searchResults?.length === 0 ? (
                        <p className="text-center text-small text-text-muted py-4">No profiles found.</p>
                      ) : (
                        searchResults?.map((profile) => (
                          <div
                            key={profile.id}
                            className="flex items-center justify-between px-4 py-2.5 border-b border-nv-border/40 last:border-none"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center font-bold text-small">
                                {profile.username[0].toUpperCase()}
                              </div>
                              <span className="text-small font-semibold text-white">{profile.username}</span>
                            </div>
                            <button
                              onClick={() => handleAddFriend(profile.id)}
                              className="bg-brand-red hover:bg-brand-red-dark text-white px-3 py-1 rounded-btn text-small font-bold flex items-center gap-1 transition-colors"
                            >
                              <FiUserPlus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Friends Listing Grid */}
              <div className="space-y-3">
                <h3 className="text-small font-bold text-text-secondary uppercase tracking-wider mb-2">My Friends</h3>
                {!friends || friends.length === 0 ? (
                  <div className="text-center py-12 bg-nv-surface/20 rounded border border-dashed border-nv-border/50 text-text-muted">
                    <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-small">You haven't added any friends yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-3.5 bg-nv-surface/40 border border-nv-border/30 rounded-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center font-bold">
                            {friend.username[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-white text-ui">{friend.username}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="p-2 text-text-muted hover:text-brand-red hover:bg-brand-red/10 rounded-full transition-all"
                          title="Remove Friend"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Incoming Requests */}
              <div className="space-y-3">
                <h3 className="text-small font-bold text-text-secondary uppercase tracking-wider">Incoming Requests</h3>
                {incomingRequests.length === 0 ? (
                  <p className="text-small text-text-muted py-2">No pending incoming requests.</p>
                ) : (
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 bg-nv-surface/30 border border-nv-border/20 rounded-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center font-bold">
                            {req.sender?.username[0].toUpperCase()}
                          </div>
                          <span className="text-small font-semibold text-white">{req.sender?.username}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResponse(req.id, 'accepted')}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"
                            title="Accept"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleResponse(req.id, 'rejected')}
                            className="bg-brand-red hover:bg-brand-red-dark text-white p-2 rounded-full transition-colors"
                            title="Decline"
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              <div className="space-y-3">
                <h3 className="text-small font-bold text-text-secondary uppercase tracking-wider">Sent Requests</h3>
                {outgoingRequests.length === 0 ? (
                  <p className="text-small text-text-muted py-2">No pending sent requests.</p>
                ) : (
                  <div className="space-y-2">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 bg-nv-surface/20 border border-nv-border/20 rounded-card opacity-80"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-nv-border text-text-secondary flex items-center justify-center font-bold">
                            {req.receiver?.username[0].toUpperCase()}
                          </div>
                          <span className="text-small font-semibold text-text-secondary">{req.receiver?.username}</span>
                        </div>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RECOMMENDATIONS */}
          {activeTab === 'recs' && (
            <div className="space-y-4">
              <h3 className="text-small font-bold text-text-secondary uppercase tracking-wider">Recommendations Box</h3>
              {!recs || recs.length === 0 ? (
                <div className="text-center py-12 bg-nv-surface/20 rounded border border-dashed border-nv-border/50 text-text-muted">
                  <FiMail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-small">Your recommendations inbox is empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recs.map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-4 bg-nv-surface/40 border rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        rec.is_read ? 'border-nv-border/30 opacity-70' : 'border-brand-red shadow-md shadow-brand-red/5'
                      }`}
                    >
                      <div className="flex-1 space-y-3">
                        {/* Sender details and message */}
                        <div className="flex flex-col gap-1">
                          <span className="text-small text-text-secondary">
                            From:{' '}
                            <strong className="text-white">@{rec.sender?.username || 'user'}</strong>
                          </span>
                          {rec.message && (
                            <p className="text-small italic text-text-secondary bg-nv-elevated/40 p-2.5 rounded border border-nv-border/30 max-w-lg">
                              "{rec.message}"
                            </p>
                          )}
                        </div>

                        {/* Resolved Title Metadata details */}
                        <RecommendationMedia
                          movieId={rec.movie_id}
                          mediaType={rec.media_type}
                        />
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex items-center gap-2.5 self-end md:self-auto flex-shrink-0">
                        {!rec.is_read && (
                          <button
                            onClick={() => handleMarkRead(rec.id)}
                            className="text-small px-3.5 py-2 rounded-btn border border-nv-border hover:border-white/20 text-text-secondary hover:text-white transition-colors"
                          >
                            Mark Read
                          </button>
                        )}
                        <Link
                          to={`/watch/${rec.media_type}/${rec.movie_id}`}
                          onClick={() => !rec.is_read && handleMarkRead(rec.id)}
                          className="flex items-center gap-1.5 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2 rounded-btn font-bold text-small transition-colors duration-150"
                        >
                          <FiPlay className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Now</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
