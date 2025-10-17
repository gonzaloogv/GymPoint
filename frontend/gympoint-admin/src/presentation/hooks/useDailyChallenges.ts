import { useQuery } from '@tanstack/react-query';
import { DailyChallengeRepositoryImpl } from '@/data';

const dailyChallengeRepository = new DailyChallengeRepositoryImpl();

export const useDailyChallenges = () => {
  return useQuery({
    queryKey: ['dailyChallenges'],
    queryFn: () => dailyChallengeRepository.getAllChallenges(),
  });
};

export const useChallengeStats = () => {
  return useQuery({
    queryKey: ['challengeStats'],
    queryFn: () => dailyChallengeRepository.getChallengeStats(),
  });
};


