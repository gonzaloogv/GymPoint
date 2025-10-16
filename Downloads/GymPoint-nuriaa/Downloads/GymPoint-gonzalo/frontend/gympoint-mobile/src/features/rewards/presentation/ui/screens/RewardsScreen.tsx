// src/features/rewards/ui/RewardsScreen.tsx

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// 1. IMPORTACIONES DE DOMINIO Y HOOKS
import { User } from '@features/auth/domain/entities/User';
import { useRewards } from '@features/rewards/presentation/hooks/useRewards';

// 2. IMPORTACIONES DE COMPONENTES MODULARES
import {
  RewardsHeader,
  RewardsTabs,
  RewardsContent,
  LoadingState,
} from '@features/rewards/presentation/ui/components';

// 3. IMPORTACIONES DE ESTILOS MODULARES
import {
  ScrollContainer,
  Container,
} from '@features/rewards/presentation/ui/styles/layout';

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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      edges={['top', 'left', 'right']}
    >
      <ScrollContainer
        contentContainerStyle={{
          paddingBottom: 50,
          paddingHorizontal: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Container>
          {/* Header con título y barra de progreso */}
          <RewardsHeader user={user} />

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
        </Container>
      </ScrollContainer>
      <Toast />
    </SafeAreaView>
  );
};

export default RewardsScreen;
