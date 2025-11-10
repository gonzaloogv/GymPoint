// src/features/rewards/ui/RewardsScreen.tsx

import React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SurfaceScreen } from '@shared/components/ui';
import { BackButton } from '@shared/components/ui/BackButton';

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
  navigation?: any;
}
// ------------------------------------------------------------------------------------------------

const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, onUpdateUser, navigation }) => {

  // Estado de carga
  if (!user) {
    return <LoadingState />;
  }

  // Hook con toda la lógica de rewards
  const {
    // activeTab, // COMENTADO: Sin tabs por ahora
    // setActiveTab, // COMENTADO: Sin tabs por ahora
    rewards,
    // generatedCodes, // COMENTADO: Sistema sin códigos por ahora
    handleGenerate,
    // handleCopy, // COMENTADO: Sistema sin códigos por ahora
    // handleToggleCode, // COMENTADO: Sistema sin códigos por ahora
  } = useRewards({ user, onUpdateUser });

  // Handlers
  const handleGoBack = () => navigation?.goBack?.();
  // const handleViewRewards = () => setActiveTab('available'); // COMENTADO: Sistema sin códigos por ahora
  const handlePremiumPress = () => {
    // TODO: Navegar a la pantalla Premium o modal
  };

  const handleViewHistory = () => {
    navigation?.navigate('TokenHistory');
  };

  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 140,
        gap: 24,
      }}
    >
      {/* Header con título y tokens */}
      <View className="gap-4">
        {navigation && <BackButton onPress={handleGoBack} />}
        <RewardsHeader user={user} onViewHistory={handleViewHistory} />
      </View>

      {/* Banner Premium para usuarios Free */}
      {user.plan === 'Free' && <PremiumUpsell onPress={handlePremiumPress} />}

      {/* Título de sección - antes eran tabs */}
      <RewardsTabs />

      {/* Contenido de recompensas disponibles */}
      <RewardsContent
        user={user}
        rewards={rewards}
        onGenerate={handleGenerate}
      />

      {/* Banner de consejos */}
      <TokensTips />

      <Toast />
    </SurfaceScreen>
  );
};

export default RewardsScreen;
