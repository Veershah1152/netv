import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { getPosterUrl, getFallbackPoster } from '@/utils/imageUtils';
import { Footer } from '@/components/layout/Footer';
import { formatDate } from '@/utils/formatUtils';

export const RecentlyViewed: React.FC = () => {
  const { recentlyViewed, clearRecentlyViewed } = useAppStore();
  const navigate = useNavigate();

  return (
    <motion.div className="page-wrapper pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FiEye className="w-7 h-7 text-brand-red" />
            <h1 className="text-h1 font-bold text-white">Recently Viewed</h1>
            <span className="text-text-muted text-body">({recentlyViewed.length})</span>
          </div>
          {recentlyViewed.length > 0 && (
            <button onClick={clearRecentlyViewed} className="flex items-center gap-2 text-text-secondary hover:text-white text-ui transition-colors duration-150">
              <FiTrash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {recentlyViewed.length === 0 ? (
          <div className="text-center py-24">
            <FiEye className="w-16 h-16 text-nv-surface mx-auto mb-4" />
            <h2 className="text-h2 font-semibold text-white mb-2">No history yet</h2>
            <p className="text-text-secondary text-body mb-8">Items you view will appear here.</p>
            <button onClick={() => navigate('/')} className="btn-primary">Start Browsing</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentlyViewed.map((item) => (
              <motion.div
                key={`${item.media_type}-${item.id}`}
                className="cursor-pointer group"
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/${item.media_type === 'person' ? 'actor' : item.media_type}/${item.id}`)}
              >
                <div className="aspect-[2/3] rounded-card overflow-hidden bg-nv-surface">
                  <img src={getPosterUrl(item.poster_path) || getFallbackPoster()} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = getFallbackPoster(); }} />
                </div>
                <p className="text-white text-small font-medium mt-2 line-clamp-1">{item.title}</p>
                <p className="text-text-muted text-small">{formatDate(item.viewedAt)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </motion.div>
  );
};
