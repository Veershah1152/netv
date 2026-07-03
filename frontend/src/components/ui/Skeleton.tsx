import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const MovieCardSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-40 xs:w-48 md:w-52">
    <Skeleton className="w-full aspect-[2/3] rounded-card" />
    <Skeleton className="w-3/4 h-3 mt-2 rounded" />
    <Skeleton className="w-1/2 h-3 mt-1 rounded" />
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative w-full h-[80vh] bg-nv-surface animate-pulse">
    <div className="absolute bottom-16 left-12 space-y-4">
      <Skeleton className="w-96 h-12 rounded" />
      <Skeleton className="w-80 h-4 rounded" />
      <Skeleton className="w-64 h-4 rounded" />
      <div className="flex gap-4 mt-6">
        <Skeleton className="w-32 h-12 rounded-btn" />
        <Skeleton className="w-36 h-12 rounded-btn" />
      </div>
    </div>
  </div>
);

export const RowSkeleton: React.FC = () => (
  <div className="content-row">
    <Skeleton className="w-48 h-7 rounded mb-4" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const DetailPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-nv-black">
    <Skeleton className="w-full h-[60vh]" />
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-6">
      <Skeleton className="w-3/4 h-10 rounded" />
      <Skeleton className="w-full h-4 rounded" />
      <Skeleton className="w-full h-4 rounded" />
      <Skeleton className="w-2/3 h-4 rounded" />
    </div>
  </div>
);

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 20 }) => (
  <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <Skeleton className="w-full aspect-[2/3] rounded-card" />
        <Skeleton className="w-3/4 h-3 mt-2 rounded" />
      </div>
    ))}
  </div>
);

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = '' }) => (
  <AnimatePresence>
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);
