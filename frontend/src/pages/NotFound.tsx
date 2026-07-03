import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-nv-black flex items-center justify-center px-8">
      <motion.div
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="text-[140px] font-black text-brand-red leading-none mb-4 select-none"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          404
        </motion.div>
        <h1 className="text-h1 font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-text-secondary text-body mb-10">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to something great.
        </p>
        <div className="flex items-center justify-center gap-4">
          <motion.button
            className="btn-play"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome className="w-5 h-5" />
            Go Home
          </motion.button>
          <motion.button
            className="btn-info"
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
