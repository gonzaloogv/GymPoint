// src/features/home/ui/HomeScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Screen } from '@shared/components/ui';
import { useHome } from '../hooks/useHome';
import {
  HomeHeader,
  WeeklyProgressCard,
  QuickActions,
  LocationBanner,
  DailyChallengeCard,
} from './components';

type AppTabsParamList = {
  Inicio: undefined;
  'Mi Gimnasio': undefined;
  Mapa: undefined; // 👈 este es tu GymsScreen
  Rutinas: undefined; // 👈 agregamos Rutinas
  Recompensa: undefined;
  Usuario: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const {
    user,
    weeklyGoal,
    currentProgress,
    progressPct,
    dailyChallenge,
    perm,
    requestLocation,
  } =
    useHome();

  const goToGyms = () => navigation.navigate('Mapa');
  const goToRoutines = () => navigation.navigate('Rutinas');
  const goToProgress = () => navigation.navigate('Progreso' as any);

  const contentSpacing = {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: tabBarHeight + bottom + 8,
    rowGap: 16,
  };

  return (
    <Screen scroll contentContainerStyle={contentSpacing}>
      <HomeHeader userName={user.name} tokens={user.tokens} streak={user.streak} />

      <WeeklyProgressCard
        current={currentProgress}
        goal={weeklyGoal}
        progressPct={progressPct}
        streak={user.streak}
        onStats={goToProgress}
      />

      <QuickActions
        onFindGyms={goToGyms}
        onMyRoutines={goToRoutines} // 👈 ahora navega a Rutinas
      />

      <LocationBanner visible={perm !== 'granted'} onEnable={requestLocation} />
      <DailyChallengeCard challenge={dailyChallenge} />
    </Screen>
  );
}
