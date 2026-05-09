import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, max = 5, size = 18, className = '' }) => {
  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {[...Array(max)].map((_, i) => {
        const fullStar = i + 1 <= rating;
        const halfStar = !fullStar && i < rating;
        
        return (
          <span key={i} className="text-yellow-400">
            {fullStar ? (
              <Star size={size} fill="currentColor" />
            ) : halfStar ? (
              <StarHalf size={size} fill="currentColor" />
            ) : (
              <Star size={size} className="text-gray-300" />
            )}
          </span>
        );
      })}
      <span className="ml-1.5 text-sm font-medium text-gray-600">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default StarRating;
