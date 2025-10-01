// src/features/home/ui/HomeScreen.tsx
import React from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Screen } from '@shared/components/ui/Screen';
import { sp } from '@shared/styles';
import { useHome } from '../../home/hooks/useHome';
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
  Recompensa: undefined;
  Usuario: undefined;
};

const Page = styled.View`
  padding: ${(p) => sp(p.theme, 2)}px;
  gap: ${(p) => sp(p.theme, 2)}px;
`;

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const { user, weeklyGoal, currentProgress, progressPct, perm, requestLocation } =
    useHome();

  const goToGyms = React.useCallback(() => {
    navigation.navigate('Mapa'); // ✅ directo al tab de Gyms
  }, [navigation]);

  return (
    <Screen
      scroll
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: tabBarHeight + insets.bottom + 8,
        rowGap: 16,
      }}
    >
      <Page>
        <HomeHeader userName={user.name} plan={user.plan} tokens={user.tokens} />

        <WeeklyProgressCard
          current={currentProgress}
          goal={weeklyGoal}
          progressPct={progressPct}
          streak={user.streak}
          onStats={() => {}}
        />

        <QuickActions
          onFindGyms={goToGyms} // 👈 se conecta acá
          onMyRoutines={() => {}}
        />

        <LocationBanner visible={perm !== 'granted'} onEnable={requestLocation} />
        <DailyChallengeCard />
        <PremiumUpsellBanner visible={user.plan === 'Free'} onPress={() => {}} />
      </Page>
    </Screen>
  );
}
