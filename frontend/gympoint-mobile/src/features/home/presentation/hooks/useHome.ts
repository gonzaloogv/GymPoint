import { useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useHomeStore } from '../state/home.store';

const useHomeHook = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const {
    user,
    weeklyProgress,
    dailyChallenge,
    locationPermission,
    fetchHomeData,
    checkLocationPermission,
    requestLocationPermission,
    setUser,
  } = useHomeStore();

  useEffect(() => {
    fetchHomeData();
    checkLocationPermission();
  }, []);

  const progressPct = weeklyProgress
    ? (weeklyProgress.current / weeklyProgress.goal) * 100
    : 0;

  const contentPaddingBottom = useMemo(
    () => tabBarHeight + insets.bottom + 8,
    [tabBarHeight, insets.bottom],
  );

  return {
    user: user || { name: '', plan: 'Free' as const, tokens: 0, streak: 0 },
    setUser,
    weeklyGoal: weeklyProgress?.goal || 0,
    currentProgress: weeklyProgress?.current || 0,
    progressPct,
    dailyChallenge,
    perm: locationPermission,
    requestLocation: requestLocationPermission,
    contentPaddingBottom,
  };
};

export default useHomeHook;
export { useHomeHook as useHome };
