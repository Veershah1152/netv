import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiSend, FiUsers, FiSearch } from 'react-icons/fi';
import { useFriendsList, useShareRecommendationMutation } from '@/hooks/useSocial';
import { useToast } from '@/components/ui/Toast';

interface RecommendToFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  mediaType: 'movie' | 'tv';
  title: string;
}

export const RecommendToFriendsModal: React.FC<RecommendToFriendsModalProps> = ({
  isOpen,
  onClose,
  movieId,
  mediaType,
  title,
}) => {
  const { data: friends, isLoading } = useFriendsList();
  const shareMutation = useShareRecommendationMutation();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const filteredFriends = friends?.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleShare = async () => {
    if (selectedFriends.length === 0) {
      showToast('Please select at least one friend', 'info');
      return;
    }

    setSending(true);
    shareMutation.mutate(
      {
        receiverIds: selectedFriends,
        movieId,
        mediaType,
        message: message.trim(),
      },
      {
        onSuccess: () => {
          showToast('Recommendation shared successfully!', 'success');
          setSelectedFriends([]);
          setMessage('');
          onClose();
        },
        onError: (err) => {
          showToast(err.message || 'Failed to share recommendation', 'error');
        },
        onSettled: () => {
          setSending(false);
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/85 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-nv-surface border border-nv-border p-6 rounded-card shadow-modal z-[51] text-white"
            initial={{ opacity: 0, scale: 0.95, y: '-40%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-40%' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-nv-border pb-3 mb-4">
              <h3 className="text-h3 font-bold flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-brand-red" />
                Recommend to Friends
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-small text-text-secondary leading-relaxed">
                Recommend <span className="font-semibold text-white">"{title}"</span> to your friends so they can add it to their watchlist.
              </p>

              {/* Search Bar */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-nv-elevated border border-nv-border/40 focus:border-white/35 rounded-btn pl-9 pr-4 py-2 text-small text-white outline-none"
                />
              </div>

              {/* Friends Selector list */}
              <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-1">
                {isLoading ? (
                  <p className="text-center text-text-muted text-small py-4">Loading friends...</p>
                ) : filteredFriends.length === 0 ? (
                  <p className="text-center text-text-muted text-small py-4">
                    {friends && friends.length > 0 ? 'No friends match your search.' : 'You haven\'t added any friends yet.'}
                  </p>
                ) : (
                  filteredFriends.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.id);
                    return (
                      <button
                        key={friend.id}
                        onClick={() => handleToggleFriend(friend.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-btn transition-colors text-small ${
                          isSelected ? 'bg-brand-red/10 text-white' : 'hover:bg-nv-elevated text-text-secondary hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center font-bold">
                            {friend.username[0].toUpperCase()}
                          </div>
                          <span>{friend.username}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-brand-red border-brand-red text-white' : 'border-nv-border bg-transparent'
                          }`}
                        >
                          {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Message block */}
              <div>
                <label className="block text-small text-text-secondary mb-1.5 font-semibold">
                  Add a short note (optional):
                </label>
                <textarea
                  placeholder="Tell them why they should watch this!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={150}
                  className="w-full h-20 bg-nv-elevated border border-nv-border/40 focus:border-white/30 rounded p-3 text-small text-white outline-none resize-none"
                />
                <span className="text-[10px] text-text-muted flex justify-end">
                  {message.length}/150
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-nv-border pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-btn border border-nv-border hover:border-white/20 text-small text-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={sending || selectedFriends.length === 0}
                className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark disabled:opacity-40 text-white px-5 py-2 rounded-btn font-semibold text-small transition-colors duration-150"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSend className="w-3.5 h-3.5" />
                    <span>Recommend</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
