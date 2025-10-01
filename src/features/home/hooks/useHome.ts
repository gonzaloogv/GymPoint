import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';

type Perm = 'granted' | 'denied' | 'prompt';
type Plan = 'Free' | 'Premium';
type UserMock = { name: string; plan: Plan; tokens: number; streak: number };

const useHomeHook = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // ✅ MOCKS
  const [user, setUser] = useState<UserMock>({
    name: 'María Gómez',
    plan: 'Free',
    tokens: 150,
    streak: 7,
  });

  const weeklyGoal = 4;
  const currentProgress = 3;
  const progressPct = (currentProgress / weeklyGoal) * 100;

  // ✅ permisos ubicación (solo para banner, sin consumir API)
  const [perm, setPerm] = useState<Perm>('prompt');
  useEffect(() => {
    (async () => {
      const p = await Location.getForegroundPermissionsAsync();
      setPerm(p.status as Perm);
    })();
  }, []);
  const requestLocation = async () => {
    const r = await Location.requestForegroundPermissionsAsync();
    setPerm(r.status as Perm);
  };

  const contentPaddingBottom = useMemo(
    () => tabBarHeight + insets.bottom + 8,
    [tabBarHeight, insets.bottom]
  );

  return {
    theme,
    user,
    setUser,
    weeklyGoal,
    currentProgress,
    progressPct,
    perm,
    requestLocation,
    contentPaddingBottom,
  };
};

export default useHomeHook;
export { useHomeHook as useHome };
