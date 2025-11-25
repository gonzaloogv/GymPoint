import { useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useHomeStore } from '../state/home.store';
import { useAuthStore } from '@features/auth/presentation/state/auth.store';
import { useProgressStore } from '@features/progress/presentation/state/progress.store';

const useHomeHook = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // Obtener usuario desde authStore (fuente de verdad, actualizado por WebSocket)
  const authUser = useAuthStore((state) => state.user);

  // Obtener streak desde progressStore (actualizado por WebSocket en attendance events)
  const currentStreak = useProgressStore((state) => state.currentStreak);

  // Log para debug (remover después de probar)
  useEffect(() => {
    if (authUser) {
      console.log('[useHome] 🔄 User data updated from authStore:', {
        name: authUser.name,
        tokens: authUser.tokens,
        plan: authUser.plan,
        streak: currentStreak,
      });
    }
  }, [authUser?.tokens, authUser?.plan, currentStreak]);

  const {
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

  // Mapear authUser a formato HomeStats, combinando con streak de progressStore
  const user = authUser
    ? {
        name: authUser.name,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        plan: authUser.plan,
        tokens: authUser.tokens,
        streak: currentStreak,
      }
    : { name: '', email: '', emailVerified: true, plan: 'Free' as const, tokens: 0, streak: 0 };

  return {
    user,
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
