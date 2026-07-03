import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { getPosterUrl, getFallbackPoster } from '@/utils/imageUtils';
import { Footer } from '@/components/layout/Footer';

export const ContinueWatching: React.FC = () => {
  const { watchProgress, removeFromContinueWatching } = useAppStore();
  const navigate = useNavigate();

  return (
    <motion.div className="page-wrapper pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FiClock className="w-7 h-7 text-brand-red" />
          <h1 className="text-h1 font-bold text-white">Continue Watching</h1>
          <span className="text-text-muted text-body">({watchProgress.length})</span>
        </div>

        {watchProgress.length === 0 ? (
          <div className="text-center py-24">
            <FiClock className="w-16 h-16 text-nv-surface mx-auto mb-4" />
            <h2 className="text-h2 font-semibold text-white mb-2">Nothing to continue</h2>
            <p className="text-text-secondary text-body mb-8">Start watching something to see it here.</p>
            <button onClick={() => navigate('/')} className="btn-primary">Browse Content</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchProgress.map((item) => {
              const progressPct = Math.round((item.progress / item.duration) * 100);
              return (
                <motion.div key={`${item.media_type}-${item.id}`} className="relative group cursor-pointer" whileHover={{ y: -4 }} onClick={() => navigate(`/${item.media_type}/${item.id}`)}>
                  <div className="aspect-[2/3] rounded-card overflow-hidden bg-nv-surface relative">
                    <img src={getPosterUrl(item.poster_path) || getFallbackPoster()} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = getFallbackPoster(); }} />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-nv-elevated">
                      <div className="h-full bg-brand-red" style={{ width: `${progressPct}%` }} />
                    </div>
                    <button
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-nv-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-brand-red"
                      onClick={(e) => { e.stopPropagation(); removeFromContinueWatching(item.id, item.media_type); }}
                    >
                      <FiX className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <p className="text-white text-small font-medium mt-2 line-clamp-1">{item.title}</p>
                  <p className="text-text-muted text-small">{progressPct}% watched</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </motion.div>
  );
};
