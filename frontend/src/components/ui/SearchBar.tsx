import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/hooks/useSearch';
import { getPosterUrl, getFallbackPoster } from '@/utils/imageUtils';

interface SearchBarProps {
  isExpanded?: boolean;
  onClose?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isExpanded = false,
  onClose,
  placeholder = 'Search movies, shows, actors...',
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useSearch({
    q: debouncedQuery,
    type: 'multi',
    page: 1,
  });

  useEffect(() => {
    if (isExpanded && inputRef.current) inputRef.current.focus();
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
      setQuery('');
      onClose?.();
    }
  };

  const handleResultClick = (item: { id: number; media_type?: string; title?: string; name?: string }) => {
    const type = item.media_type === 'tv' ? 'tv' : item.media_type === 'person' ? 'actor' : 'movie';
    navigate(`/${type}/${item.id}`);
    setQuery('');
    setShowResults(false);
    onClose?.();
  };

  const results = data?.results?.slice(0, 6) || [];

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSearch} className="flex items-center">
        <motion.div
          className="flex items-center gap-2 bg-nv-black/80 border border-nv-border rounded px-3 py-2 backdrop-blur-sm"
          initial={false}
          animate={{ width: isExpanded ? 280 : 160 }}
          transition={{ duration: 0.2 }}
        >
          <FiSearch className="w-4 h-4 text-text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="bg-transparent text-white text-ui placeholder-text-muted focus:outline-none w-full min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setShowResults(false); }}
              className="text-text-muted hover:text-white transition-colors duration-150"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </form>

      <AnimatePresence>
        {showResults && debouncedQuery && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-80 bg-nv-elevated rounded-card shadow-modal border border-nv-border overflow-hidden z-50"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {isLoading ? (
              <div className="p-4 text-text-secondary text-ui text-center">Searching...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-text-secondary text-ui text-center">No results found</div>
            ) : (
              <div>
                {results.map((item) => {
                  const title = ('title' in item && item.title) || ('name' in item && item.name) || '';
                  const poster = item.poster_path || ('profile_path' in item && item.profile_path as string) || null;
                  const type = item.media_type || 'movie';
                  return (
                    <button
                      key={`${type}-${item.id}`}
                      onClick={() => handleResultClick(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-nv-surface transition-colors duration-150 text-left"
                    >
                      <img
                        src={getPosterUrl(poster, 'w92') || getFallbackPoster()}
                        alt={title}
                        className="w-10 h-14 object-cover rounded flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = getFallbackPoster(); }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-ui font-medium line-clamp-1">{title}</p>
                        <p className="text-text-muted text-small capitalize">{type}</p>
                      </div>
                    </button>
                  );
                })}
                <button
                  onClick={(e) => { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(debouncedQuery)}`); setShowResults(false); }}
                  className="w-full text-center py-3 text-brand-red text-ui font-medium hover:bg-nv-surface border-t border-nv-border transition-colors duration-150"
                >
                  See all results for "{debouncedQuery}"
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
