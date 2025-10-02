// src/features/home/ui/HomeScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeLayout } from '@shared/components/ui';
import { useHome } from '../hooks/useHome';
import {
  HomeHeader,
  WeeklyProgressCard,
  QuickActions,
  LocationBanner,
  DailyChallengeCard,
  PremiumUpsellBanner,
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

  const { user, weeklyGoal, currentProgress, progressPct, perm, requestLocation } =
    useHome();

  const goToGyms = () => navigation.navigate('Mapa');
  const goToRoutines = () => navigation.navigate('Rutinas');

  return (
    <HomeLayout>
      <HomeHeader userName={user.name} plan={user.plan} tokens={user.tokens} />

      <WeeklyProgressCard
        current={currentProgress}
        goal={weeklyGoal}
        progressPct={progressPct}
        streak={user.streak}
        onStats={() => {}}
      />

      <QuickActions
        onFindGyms={goToGyms}
        onMyRoutines={goToRoutines} // 👈 ahora navega a Rutinas
      />

      <LocationBanner visible={perm !== 'granted'} onEnable={requestLocation} />
      <DailyChallengeCard />
      <PremiumUpsellBanner visible={user.plan === 'Free'} onPress={() => {}} />
    </HomeLayout>
  );
}
