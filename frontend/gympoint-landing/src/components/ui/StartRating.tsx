import type React from 'react';
import type { StarRatingProps } from '../../types/ui/startRating.types';


export const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400' : 'fill-gray-300'}`}
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
};