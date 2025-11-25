import { useQuery } from '@tanstack/react-query';
import { StreakRepositoryImpl } from '@/data';

const streakRepository = new StreakRepositoryImpl();

export const useStreaks = () => {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: () => streakRepository.getAllStreaks(),
  });
};

export const useUserStreak = (id_user: number) => {
  return useQuery({
    queryKey: ['userStreak', id_user],
    queryFn: () => streakRepository.getUserStreak(id_user),
    enabled: !!id_user,
  });
};

export const useStreakStats = () => {
  return useQuery({
    queryKey: ['streakStats'],
    queryFn: () => streakRepository.getStreakStats(),
  });
};


