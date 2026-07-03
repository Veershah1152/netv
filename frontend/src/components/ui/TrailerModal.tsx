import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlay, FiExternalLink } from 'react-icons/fi';
import { Video } from '@/types/common.types';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: Video[];
  title: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  videos,
  title,
}) => {
  const trailer = videos.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser') && v.official
  ) || videos.find((v) => v.site === 'YouTube');

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiPlay className="w-4 h-4 text-brand-red" />
                <h3 className="text-white font-semibold text-h3">{title}</h3>
              </div>
              <div className="flex items-center gap-3">
                {trailer && (
                  <a
                    href={`https://youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-white transition-colors duration-150"
                    title="Open on YouTube"
                  >
                    <FiExternalLink className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-nv-surface flex items-center justify-center text-white hover:bg-nv-elevated transition-colors duration-150"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {trailer ? (
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  className="absolute inset-0 w-full h-full rounded-card"
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                  title={trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video bg-nv-surface rounded-card flex items-center justify-center">
                <p className="text-text-secondary text-body">No trailer available</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
