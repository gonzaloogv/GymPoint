import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { SurfaceScreen } from '@shared/components/ui';
import { SCREEN_CONTENT_STYLE } from '@shared/styles/layouts';
import { useHome } from '../hooks/useHome';
import { EmailVerificationBanner } from '@features/auth/presentation/ui/components';
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
  Mapa: undefined;
  Rutinas: undefined;
  Recompensa: undefined;
  Usuario: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();

  const { user, weeklyGoal, currentProgress, progressPct, dailyChallenge, perm, requestLocation } =
    useHome();

  const goToGyms = () => navigation.navigate('Mapa');
  const goToRoutines = () => navigation.navigate('Rutinas');

  return (
    <SurfaceScreen scroll contentContainerStyle={SCREEN_CONTENT_STYLE}>
      <HomeHeader userName={user.name} plan={user.plan} tokens={user.tokens} streak={user.streak} />

      {/* Banner de verificación de email (solo si no está verificado) */}
      {!user.emailVerified && user.email && <EmailVerificationBanner email={user.email} />}

      <WeeklyProgressCard
        current={currentProgress}
        goal={weeklyGoal}
        progressPct={progressPct}
        streak={user.streak}
        onStats={() => {}}
      />

      <QuickActions
        onFindGyms={goToGyms}
        onMyRoutines={goToRoutines}
      />

      <LocationBanner visible={perm !== 'granted'} onEnable={requestLocation} />
      <DailyChallengeCard challenge={dailyChallenge} />
    </SurfaceScreen>
  );
}
