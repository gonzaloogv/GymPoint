// src/features/rewards/ui/RewardsScreen.tsx

import React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Screen } from '@shared/components/ui';

// 1. IMPORTACIONES DE DOMINIO Y HOOKS
import { User } from '@features/auth/domain/entities/User';
import { useRewards } from '@features/rewards/presentation/hooks/useRewards';

// 2. IMPORTACIONES DE COMPONENTES MODULARES
import {
  RewardsHeader,
  RewardsTabs,
  RewardsContent,
  LoadingState,
  PremiumUpsell,
  TokensTips,
} from '@features/rewards/presentation/ui/components';

// --- INTERFAZ DE PROPS ---
interface RewardsScreenProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}
// ------------------------------------------------------------------------------------------------

const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, onUpdateUser }) => {

  // Estado de carga
  if (!user) {
    return <LoadingState />;
  }

  // Hook con toda la lógica de rewards
  const {
    activeTab,
    setActiveTab,
    rewards,
    generatedCodes,
    handleGenerate,
    handleCopy,
    handleToggleCode,
  } = useRewards({ user, onUpdateUser });

  // Handlers
  const handleViewRewards = () => setActiveTab('available');
  const handlePremiumPress = () => {
    // TODO: Navegar a la pantalla Premium o modal
  };

  return (
    <Screen scroll safeAreaTop contentContainerStyle={{ paddingBottom: 48, flexGrow: 1 }}>
      <View className="flex-1 px-4">
        {/* Header con título y tokens */}
        <RewardsHeader user={user} />

        {/* Banner Premium para usuarios Free */}
        {user.plan === 'Free' && <PremiumUpsell onPress={handlePremiumPress} />}

        {/* Sistema de pestañas */}
        <RewardsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Contenido de las pestañas */}
        <RewardsContent
          activeTab={activeTab}
          user={user}
          rewards={rewards}
          generatedCodes={generatedCodes}
          onGenerate={handleGenerate}
          onCopy={handleCopy}
          onToggleCode={handleToggleCode}
          onViewRewards={handleViewRewards}
        />

        {/* Banner de consejos */}
        <TokensTips />
      </View>
      <Toast />
    </Screen>
  );
};

export default RewardsScreen;
