import React from 'react';
import { Review, ApproveReviewDTO } from '@/domain';
import { ReviewCard } from '../ui/ReviewCard';
import { UseMutationResult } from '@tanstack/react-query';

interface ReviewsGridProps {
  reviews: Review[];
  onApprove: (id: number, isApproved: boolean) => void;
  onDelete: (id: number) => void;
  approveReviewMutation: UseMutationResult<Review, Error, ApproveReviewDTO, unknown>;
  deleteReviewMutation: UseMutationResult<void, Error, number, unknown>;
}

export const ReviewsGrid: React.FC<ReviewsGridProps> = ({
  reviews,
  onApprove,
  onDelete,
  approveReviewMutation,
  deleteReviewMutation,
}) => {
  if (reviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-text-muted">
        <p>No se encontraron reviews con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id_review}
          review={review}
          onApprove={onApprove}
          onDelete={onDelete}
          isProcessing={
            (approveReviewMutation.isPending && approveReviewMutation.variables?.id_review === review.id_review) ||
            (deleteReviewMutation.isPending && deleteReviewMutation.variables === review.id_review)
          }
        />
      ))}
    </div>
  );
};
