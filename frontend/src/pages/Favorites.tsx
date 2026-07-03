import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { MovieCard } from '@/components/ui/MovieCard';
import { Footer } from '@/components/layout/Footer';

export const Favorites: React.FC = () => {
  const { favorites } = useAppStore();
  const navigate = useNavigate();

  return (
    <motion.div className="page-wrapper pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FiHeart className="w-7 h-7 text-brand-red" />
            <h1 className="text-h1 font-bold text-white">My Favorites</h1>
            <span className="text-text-muted text-body">({favorites.length})</span>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <FiHeart className="w-16 h-16 text-nv-surface mx-auto mb-4" />
            <h2 className="text-h2 font-semibold text-white mb-2">No favorites yet</h2>
            <p className="text-text-secondary text-body mb-8">Start adding movies and shows you love.</p>
            <button onClick={() => navigate('/')} className="btn-primary">Browse Content</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {favorites.map((item) => (
              <MovieCard key={`${item.media_type}-${item.id}`} item={item} mediaType={item.media_type} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </motion.div>
  );
};
