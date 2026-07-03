import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilm, FiTv, FiUser } from 'react-icons/fi';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { MovieCard } from '@/components/ui/MovieCard';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorComponent } from '@/components/ui/ErrorComponent';
import { Footer } from '@/components/layout/Footer';
import { getProfileUrl, getFallbackPoster } from '@/utils/imageUtils';

type SearchType = 'multi' | 'movie' | 'tv' | 'person';

const TABS: { label: string; value: SearchType; icon: React.ElementType }[] = [
  { label: 'All', value: 'multi', icon: FiSearch },
  { label: 'Movies', value: 'movie', icon: FiFilm },
  { label: 'TV Shows', value: 'tv', icon: FiTv },
  { label: 'Actors', value: 'person', icon: FiUser },
];

export const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlQuery = new URLSearchParams(location.search).get('q') || '';

  const [query, setQuery] = useState(urlQuery);
  const [type, setType] = useState<SearchType>('multi');
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (urlQuery) setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, type]);

  const { data, isLoading, isError, error, refetch } = useSearch({
    q: debouncedQuery,
    type,
    page,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`, { replace: true });
    }
  };


  return (
    <motion.div className="page-wrapper pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, actors..."
              className="nv-input pl-12 text-body"
              autoFocus
            />
          </div>
        </form>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-nv-border pb-4">
          {TABS.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-btn text-ui font-medium transition-all duration-150 ${
                type === value
                  ? 'bg-brand-red text-white'
                  : 'text-text-secondary hover:text-white hover:bg-nv-surface'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Results */}
        {!debouncedQuery && (
          <div className="text-center py-20">
            <FiSearch className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-h3">Start typing to search</p>
          </div>
        )}

        {debouncedQuery && isLoading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {debouncedQuery && isError && (
          <ErrorComponent message={error?.message} onRetry={() => refetch()} />
        )}

        {debouncedQuery && !isLoading && !isError && (
          <>
            <div className="mb-6">
              <p className="text-text-muted text-ui">
                {data?.total_results?.toLocaleString() || 0} results for "{debouncedQuery}"
              </p>
            </div>

            {/* Person results */}
            {type === 'person' && data?.results && data.results.length > 0 && (
              <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {data.results.map((person) => (
                  <motion.button
                    key={person.id}
                    className="text-center group"
                    onClick={() => navigate(`/actor/${person.id}`)}
                    whileHover={{ y: -4 }}
                  >
                    <div className="w-full aspect-square rounded-full overflow-hidden bg-nv-surface mb-2 border-2 border-transparent group-hover:border-brand-red transition-colors duration-200">
                      <img
                        src={getProfileUrl(('profile_path' in person && person.profile_path as string) || null) || getFallbackPoster()}
                        alt={('name' in person && person.name) || ''}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getFallbackPoster(); }}
                      />
                    </div>
                    <p className="text-white text-ui font-medium line-clamp-1">
                      {('name' in person && person.name) || ('title' in person && person.title) || ''}
                    </p>
                    <p className="text-text-muted text-small">
                      {('known_for_department' in person && person.known_for_department) || 'Actor'}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Movie/TV results */}
            {type !== 'person' && (
              <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                {data?.results
                  ?.filter((r) => r.media_type !== 'person')
                  .map((item) => (
                    <MovieCard
                      key={`${item.media_type}-${item.id}`}
                      item={item}
                      mediaType={item.media_type === 'tv' ? 'tv' : 'movie'}
                    />
                  ))}
              </div>
            )}

            {data?.results?.length === 0 && (
              <div className="text-center py-20">
                <p className="text-text-secondary text-h3 mb-2">No results found</p>
                <p className="text-text-muted text-body">Try a different search term</p>
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={data?.total_pages || 1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
      <Footer />
    </motion.div>
  );
};
