import React, { useState } from 'react';

interface StarRatingProps {
  rating: number; // Current rating value (0-5)
  onRatingChange?: (newRating: number) => void; // Optional: for interactive mode
  totalStars?: number;
  size?: 'sm' | 'md' | 'lg'; // For controlling star size
  interactive?: boolean; // Determines if stars can be clicked to change rating
  className?: string;
  ariaLabel?: string;
}

const Star: React.FC<{
  filled: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  sizeClass: string;
  isInteractive: boolean;
}> = ({ filled, onClick, onMouseEnter, onMouseLeave, sizeClass, isInteractive }) => {
  return (
    <svg
      className={`${sizeClass} ${filled ? 'text-yellow-400' : 'text-gray-300'} ${isInteractive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" // Individual stars are decorative if part of a set
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  totalStars = 5,
  size = 'md',
  interactive = false,
  className = '',
  ariaLabel = "Classificação por estrelas"
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  let sizeClass = 'w-5 h-5'; // default md
  if (size === 'sm') sizeClass = 'w-4 h-4';
  if (size === 'lg') sizeClass = 'w-6 h-6';

  return (
    <div className={`flex items-center ${className}`} role="img" aria-label={`${ariaLabel}: ${rating} de ${totalStars} estrelas`}>
      {[...Array(totalStars)].map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= (hoverRating || rating);
        return (
          <Star
            key={starValue}
            filled={filled}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            sizeClass={sizeClass}
            isInteractive={interactive}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
