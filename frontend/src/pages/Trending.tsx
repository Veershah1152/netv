import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';
import { useTrending } from '@/hooks/useTrending';
import { MovieCard } from '@/components/ui/MovieCard';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorComponent } from '@/components/ui/ErrorComponent';
import { Footer } from '@/components/layout/Footer';

export const Trending: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useTrending(page);

  return (
    <motion.div className="page-wrapper pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FiTrendingUp className="w-7 h-7 text-brand-red" />
          <h1 className="text-h1 font-bold text-white">Trending Now</h1>
        </div>

        {isLoading && <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}
        {isError && <ErrorComponent message={error?.message} onRetry={() => refetch()} />}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {data?.results?.map((item) => (
                <MovieCard key={`${item.media_type}-${item.id}`} item={item} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={data?.total_pages || 1} onPageChange={setPage} />
          </>
        )}
      </div>
      <Footer />
    </motion.div>
  );
};
