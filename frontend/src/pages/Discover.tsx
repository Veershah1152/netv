import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import { useDiscover, useGenres } from '@/hooks/useDiscover';
import { MovieCard } from '@/components/ui/MovieCard';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorComponent } from '@/components/ui/ErrorComponent';
import { Footer } from '@/components/layout/Footer';
import { SORT_OPTIONS, LANGUAGE_OPTIONS, YEARS } from '@/utils/constants';
import { DiscoverParams } from '@/types/api.types';

export const Discover: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);

  const [filters, setFilters] = useState<DiscoverParams>({
    sort_by: 'popularity.desc',
    with_genres: urlParams.get('with_genres') || '',
    with_original_language: '',
    page: 1,
    type: 'movie',
  });

  const [voteGte, setVoteGte] = useState('');
  const [year, setYear] = useState('');

  const { data: genreData } = useGenres(filters.type);
  const { data, isLoading, isError, error, refetch } = useDiscover({
    ...filters,
    'vote_average.gte': voteGte ? parseFloat(voteGte) : undefined,
    primary_release_year: year ? parseInt(year) : undefined,
  });

  useEffect(() => {
    const genreParam = urlParams.get('with_genres');
    if (genreParam) setFilters((f) => ({ ...f, with_genres: genreParam }));
  }, [location.search]);

  const setFilter = (key: keyof DiscoverParams, value: string | number) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ sort_by: 'popularity.desc', with_genres: '', with_original_language: '', page: 1, type: 'movie' });
    setVoteGte('');
    setYear('');
    navigate('/discover');
  };

  return (
    <motion.div className="page-wrapper pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FiFilter className="w-6 h-6 text-brand-red" />
          <h1 className="text-h1 font-bold text-white">Discover</h1>
        </div>

        {/* Filters */}
        <div className="bg-nv-surface rounded-card p-6 mb-8 border border-nv-border">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Type */}
            <div>
              <label className="text-text-muted text-small uppercase tracking-wider mb-2 block">Type</label>
              <select className="nv-select w-full" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-text-muted text-small uppercase tracking-wider mb-2 block">Sort By</label>
              <select className="nv-select w-full" value={filters.sort_by} onChange={(e) => setFilter('sort_by', e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Genre */}
            <div>
              <label className="text-text-muted text-small uppercase tracking-wider mb-2 block">Genre</label>
              <select className="nv-select w-full" value={filters.with_genres} onChange={(e) => setFilter('with_genres', e.target.value)}>
                <option value="">All Genres</option>
                {genreData?.genres?.map((g) => <option key={g.id} value={g.id.toString()}>{g.name}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="text-text-muted text-small uppercase tracking-wider mb-2 block">Year</label>
              <select className="nv-select w-full" value={year} onChange={(e) => { setYear(e.target.value); setFilters((f) => ({ ...f, page: 1 })); }}>
                <option value="">All Years</option>
                {YEARS.slice(0, 40).map((y) => <option key={y} value={y.toString()}>{y}</option>)}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-text-muted text-small uppercase tracking-wider mb-2 block">Min Rating</label>
              <select className="nv-select w-full" value={voteGte} onChange={(e) => { setVoteGte(e.target.value); setFilters((f) => ({ ...f, page: 1 })); }}>
                <option value="">Any</option>
                {[9, 8, 7, 6, 5].map((r) => <option key={r} value={r.toString()}>{r}+ ★</option>)}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="text-text-muted text-small uppercase tracking-wider mb-2 block">Language</label>
              <select className="nv-select w-full" value={filters.with_original_language} onChange={(e) => setFilter('with_original_language', e.target.value)}>
                {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={clearFilters} className="text-text-secondary hover:text-white text-ui transition-colors duration-150">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results count */}
        {data && (
          <p className="text-text-muted text-ui mb-6">
            Found {data.total_results?.toLocaleString()} titles
          </p>
        )}

        {isLoading && <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}
        {isError && <ErrorComponent message={error?.message} onRetry={() => refetch()} />}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {data?.results?.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  mediaType={filters.type}
                />
              ))}
            </div>

            {data?.results?.length === 0 && (
              <div className="text-center py-20">
                <p className="text-text-secondary text-h3">No results match your filters</p>
              </div>
            )}

            <Pagination
              currentPage={filters.page || 1}
              totalPages={data?.total_pages || 1}
              onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </>
        )}
      </div>
      <Footer />
    </motion.div>
  );
};
