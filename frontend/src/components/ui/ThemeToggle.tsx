import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useAppStore } from '@/store/useAppStore';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-12 h-6 rounded-full bg-nv-surface border border-nv-border flex items-center p-1"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-brand-red flex items-center justify-center"
        animate={{ x: isDark ? 0 : 22 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {isDark ? (
          <FiMoon className="w-2.5 h-2.5 text-white" />
        ) : (
          <FiSun className="w-2.5 h-2.5 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
};
