import React from 'react';
import { formatRating, getRatingColor } from '@/utils/formatUtils';

interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showStar?: boolean;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  size = 'md',
  showStar = true,
  className = '',
}) => {
  const colorClass = getRatingColor(rating);
  const sizeClasses = {
    sm: 'text-small',
    md: 'text-ui',
    lg: 'text-body',
  };

  return (
    <span className={`flex items-center gap-0.5 ${colorClass} ${sizeClasses[size]} font-semibold ${className}`}>
      {showStar && <span className="text-yellow-400">★</span>}
      {formatRating(rating)}
    </span>
  );
};

interface MatchScoreBadgeProps {
  rating: number;
  className?: string;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  rating,
  className = '',
}) => {
  const score = Math.round((rating / 10) * 100);
  return (
    <span className={`text-match font-semibold text-ui ${className}`}>
      {score}% Match
    </span>
  );
};

interface TopBadgeProps {
  rank: number;
  className?: string;
}

export const TopBadge: React.FC<TopBadgeProps> = ({ rank, className = '' }) => (
  <div className={`flex items-center gap-1 ${className}`}>
    <span className="text-brand-red text-small font-bold uppercase tracking-wider">#</span>
    <span className="text-white text-small font-bold">{rank} in Charts</span>
  </div>
);

interface NewBadgeProps {
  className?: string;
}

export const NewBadge: React.FC<NewBadgeProps> = ({ className = '' }) => (
  <span className={`bg-badge-new text-nv-black text-small font-bold px-1.5 py-0.5 rounded ${className}`}>
    NEW
  </span>
);
