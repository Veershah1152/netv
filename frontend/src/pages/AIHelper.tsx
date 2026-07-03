import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiSearch } from 'react-icons/fi';
import client from '@/api/client';
import { useToast } from '@/components/ui/Toast';
import { MovieCard } from '@/components/ui/MovieCard';
import { Footer } from '@/components/layout/Footer';
import { getPosterUrl, getFallbackPoster } from '@/utils/imageUtils';

interface RecommendedItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  popularity: number;
}

interface MatchResponse {
  type: 'title_match' | 'semantic_match';
  matchedItem?: {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
  };
  results: RecommendedItem[];
}

const PROMPT_SUGGESTIONS = [
  { label: 'Dark Sci-Fi Space', query: 'dark sci-fi space movies' },
  { label: 'Laugh Out Loud Comedy', query: 'funny laugh out loud comedy' },
  { label: 'Spooky Horror', query: 'scary spooky horror' },
  { label: 'Action Packed Thriller', query: 'action thriller war western' },
];

export const AIHelper: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendedItem[]>([]);
  const [matchedItem, setMatchedItem] = useState<MatchResponse['matchedItem'] | null>(null);
  const [matchType, setMatchType] = useState<'title_match' | 'semantic_match' | null>(null);
  const { showToast } = useToast();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMatchedItem(null);
    setMatchType(null);

    try {
      const response = await client.post<MatchResponse>('/ai/recommend', {
        query: searchQuery,
      });

      setResults(response.data.results || []);
      setMatchType(response.data.type);
      if (response.data.type === 'title_match') {
        setMatchedItem(response.data.matchedItem || null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestQuery: string) => {
    setQuery(suggestQuery);
    handleSearch(suggestQuery);
  };

  return (
    <div className="min-h-screen bg-nv-black text-white flex flex-col pt-24 justify-between">
      <div className="max-w-6xl w-full mx-auto px-4 md:px-8 flex-1">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-small font-bold mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <FiCpu className="w-4 h-4 animate-spin-slow" />
            <span>Futuristic Recommendation Helper</span>
          </motion.div>
          <h1 className="text-h1 font-black mb-3">AI Movie Recommendation</h1>
          <p className="text-body text-text-secondary">
            Type any movie/series name you love, or describe your mood (e.g., "action in space") to instantly get matching suggestions.
          </p>
        </div>

        {/* Input Controls Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative flex items-center bg-nv-surface border border-nv-border/60 rounded-card p-1.5 focus-within:border-brand-red/60 transition-all duration-300">
            <FiSearch className="w-5 h-5 text-text-muted ml-4" />
            <input
              type="text"
              placeholder="Enter movie name or genre prompt (e.g. Inception)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-white text-body"
            />
            <button
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="bg-brand-red hover:bg-brand-red-dark disabled:opacity-40 text-white font-bold px-6 py-3 rounded-btn text-small transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Quick Suggestions Badges */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {PROMPT_SUGGESTIONS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleSuggestionClick(item.query)}
                className="px-3 py-1.5 rounded-full bg-nv-elevated/40 border border-nv-border hover:border-brand-red/40 hover:text-white transition-all text-small text-text-secondary"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Search Match Overlay */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-small text-text-secondary">AI is thinking and fetching recommendations...</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              className="space-y-8 mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* If it matched a specific movie/show */}
              {matchType === 'title_match' && matchedItem && (
                <div className="p-6 bg-nv-surface/40 border border-nv-border/40 rounded-card flex flex-col md:flex-row gap-6 items-center md:items-start max-w-4xl mx-auto shadow-2xl backdrop-blur-md">
                  <img
                    src={getPosterUrl(matchedItem.poster_path, 'w185') || getFallbackPoster()}
                    alt={matchedItem.title}
                    className="w-28 h-40 object-cover rounded shadow-card"
                  />
                  <div className="space-y-3 text-center md:text-left">
                    <span className="bg-brand-red text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Matched Source
                    </span>
                    <h2 className="text-h2 font-bold text-white">{matchedItem.title}</h2>
                    <p className="text-small text-text-secondary leading-relaxed line-clamp-3">
                      {matchedItem.overview}
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendation Grid Title */}
              <div className="border-b border-nv-border/40 pb-3 flex items-center justify-between">
                <span className="font-bold text-h2 text-white">
                  {matchType === 'title_match'
                    ? 'Recommended Titles (Based on your query)'
                    : 'Prompt Recommendations Results'}
                </span>
                <span className="text-small text-text-muted">({results.length} found)</span>
              </div>

              {/* Recommendation Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {results.map((item) => (
                  <MovieCard
                    key={item.id}
                    item={item as any}
                    mediaType={item.media_type || (matchedItem?.media_type as any) || 'movie'}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            query.trim() && !loading && (
              <motion.div
                className="text-center py-20 text-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No recommendations found. Try a different movie title or prompt keywords.
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};
