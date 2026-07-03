import React from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiTrash2, FiGlobe, FiInfo } from 'react-icons/fi';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LANGUAGE_OPTIONS } from '@/utils/constants';
import { storage } from '@/utils/storageUtils';
import { Footer } from '@/components/layout/Footer';

export const Settings: React.FC = () => {
  const { clearRecentlyViewed, favorites, watchProgress, language, setLanguage } = useAppStore();
  const { showToast } = useToast();

  const handleClearData = () => {
    clearRecentlyViewed();
    storage.remove('netveer-store');
    window.location.reload();
  };

  return (
    <motion.div className="page-wrapper pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-3xl mx-auto px-8 md:px-12 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FiSettings className="w-7 h-7 text-brand-red" />
          <h1 className="text-h1 font-bold text-white">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-nv-surface rounded-card p-6 border border-nv-border">
            <h2 className="text-h3 font-semibold text-white mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-body">Dark Mode</p>
                <p className="text-text-muted text-small">Toggle between dark and light theme</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Language */}
          <div className="bg-nv-surface rounded-card p-6 border border-nv-border">
            <h2 className="text-h3 font-semibold text-white mb-4 flex items-center gap-2">
              <FiGlobe className="w-5 h-5" /> Language
            </h2>
            <select className="nv-select" value={language} onChange={(e) => { setLanguage(e.target.value); showToast('Language updated', 'success'); }}>
              {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          {/* Storage Stats */}
          <div className="bg-nv-surface rounded-card p-6 border border-nv-border">
            <h2 className="text-h3 font-semibold text-white mb-4 flex items-center gap-2">
              <FiInfo className="w-5 h-5" /> Library Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Favorites', value: favorites.length },
                { label: 'Continue Watching', value: watchProgress.length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-nv-elevated rounded p-4">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-text-muted text-small">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Data */}
          <div className="bg-nv-surface rounded-card p-6 border border-nv-border">
            <h2 className="text-h3 font-semibold text-white mb-2 flex items-center gap-2">
              <FiTrash2 className="w-5 h-5 text-brand-red" /> Clear Data
            </h2>
            <p className="text-text-secondary text-body mb-4">
              Remove all favorites, watch history, and settings. This cannot be undone.
            </p>
            <button onClick={handleClearData} className="flex items-center gap-2 bg-brand-red/10 border border-brand-red text-brand-red px-5 py-2 rounded-btn hover:bg-brand-red hover:text-white transition-all duration-150 text-ui font-medium">
              <FiTrash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>

          {/* About */}
          <div className="bg-nv-surface rounded-card p-6 border border-nv-border">
            <h2 className="text-h3 font-semibold text-white mb-2">About NetVeer</h2>
            <p className="text-text-secondary text-body">
              NetVeer v1.0.0 — A streaming platform UI powered by The Movie Database (TMDB) API.
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
};
