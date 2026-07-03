import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiTrendingUp, FiStar, FiCalendar, FiFilm,
  FiTv, FiCompass, FiHeart, FiClock, FiEye, FiSettings, FiX
} from 'react-icons/fi';

const SIDEBAR_LINKS = [
  { icon: FiHome, label: 'Home', path: '/' },
  { icon: FiTrendingUp, label: 'Trending', path: '/trending' },
  { icon: FiStar, label: 'Popular', path: '/popular' },
  { icon: FiStar, label: 'Top Rated', path: '/top-rated' },
  { icon: FiCalendar, label: 'Upcoming', path: '/upcoming' },
  { icon: FiFilm, label: 'Movies', path: '/movies' },
  { icon: FiTv, label: 'TV Shows', path: '/tv' },
  { icon: FiCompass, label: 'Discover', path: '/discover' },
  { icon: FiHeart, label: 'Favorites', path: '/favorites' },
  { icon: FiClock, label: 'Continue Watching', path: '/continue-watching' },
  { icon: FiEye, label: 'Recently Viewed', path: '/recently-viewed' },
  { icon: FiSettings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-nv-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-nv-elevated border-r border-nv-border flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-nv-border">
              <span className="text-xl font-black text-brand-red tracking-widest">NETVEER</span>
              <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {SIDEBAR_LINKS.map(({ icon: Icon, label, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-5 py-3 transition-all duration-150 ${
                    location.pathname === path
                      ? 'text-white bg-brand-red/10 border-r-2 border-brand-red'
                      : 'text-text-secondary hover:text-white hover:bg-nv-surface'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-ui">{label}</span>
                </Link>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
