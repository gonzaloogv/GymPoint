import { useEffect } from 'react';
import { useAchievementsStore } from '../state/achievements.store';

export const useAchievements = () => {
  const { achievements, isLoading, error, fetchAchievements, syncAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    isLoading,
    error,
    refetch: fetchAchievements,
    sync: syncAchievements,
  };
};
