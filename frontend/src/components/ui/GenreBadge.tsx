import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GenreBadgeProps {
  id?: number;
  name: string;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export const GenreBadge: React.FC<GenreBadgeProps> = ({
  id,
  name,
  onClick,
  className = '',
  interactive = true,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id && interactive) {
      navigate(`/discover?with_genres=${id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`genre-badge ${interactive ? 'cursor-pointer hover:text-white' : 'cursor-default'} ${className}`}
      type="button"
    >
      {name}
    </button>
  );
};
