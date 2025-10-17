import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewRepositoryImpl } from '@/data';
import { ApproveReviewDTO } from '@/domain';

const reviewRepository = new ReviewRepositoryImpl();

export const useReviews = () => {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewRepository.getAllReviews(),
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: ['reviewStats'],
    queryFn: () => reviewRepository.getReviewStats(),
  });
};

export const useApproveReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApproveReviewDTO) => reviewRepository.approveReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewRepository.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
    },
  });
};


