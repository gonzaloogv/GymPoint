// src/features/rewards/ui/RewardsScreen.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { SurfaceScreen } from '@shared/components/ui';
import { BackButton } from '@shared/components/ui/BackButton';

// 1. IMPORTACIONES DE DOMINIO Y HOOKS
import { User } from '@features/auth/domain/entities/User';
import { useRewards } from '@features/rewards/presentation/hooks/useRewards';

// 2. IMPORTACIONES DE COMPONENTES MODULARES
import {
  RewardsHeader,
  RewardsContent,
  LoadingState,
  PremiumUpsell,
  TokensTips,
} from '@features/rewards/presentation/ui/components';

// 3. IMPORTACIONES DE NUEVOS COMPONENTES
import { ActiveEffectsBanner } from '../../components/ActiveEffectsBanner';
import { RewardInventoryCard } from '../../components/RewardInventoryCard';

// --- INTERFAZ DE PROPS ---
interface RewardsScreenProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  navigation?: any;
}
// ------------------------------------------------------------------------------------------------

const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, onUpdateUser, navigation }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'inventory'>('available');

  // Estado de carga
  if (!user) {
    return <LoadingState />;
  }

  // Hook con toda la lógica de rewards
  const {
    rewards,
    inventory,
    activeEffects,
    handleGenerate,
  } = useRewards({ user, onUpdateUser });

  // Handlers
  const handleGoBack = () => navigation?.goBack?.();
  const handlePremiumPress = () => {
    // TODO: Navegar a la pantalla Premium o modal
  };

  const handleViewHistory = () => {
    navigation?.navigate('TokenHistory');
  };

  const isPremium = user?.plan === 'Premium';

  // DEBUG: Log para verificar estado actual
  console.log('[RewardsScreen] 🔍 Estado actual:', {
    plan: user.plan,
    isPremium,
    tokens: user.tokens,
    rewardsCount: rewards.length,
    inventoryCount: inventory.length,
    inventory: inventory.map(i => ({ id: i.id, type: i.itemType, qty: i.quantity })),
  });

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

      {/* Banner de Efectos Activos */}
      <ActiveEffectsBanner />

      {/* Banner Premium para usuarios Free */}
      {user.plan === 'Free' && <PremiumUpsell onPress={handlePremiumPress} />}

      {/* Tabs */}
      <View className="flex-row gap-2 px-4">
        <TouchableOpacity
          onPress={() => setActiveTab('available')}
          className={`flex-1 py-3 rounded-xl items-center ${
            activeTab === 'available' ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'available' ? 'text-white' : 'text-gray-700'
            }`}
          >
            Disponibles ({rewards.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('inventory')}
          className={`flex-1 py-3 rounded-xl items-center ${
            activeTab === 'inventory' ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'inventory' ? 'text-white' : 'text-gray-700'
            }`}
          >
            Mi Inventario ({inventory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido según tab activo */}
      {activeTab === 'available' ? (
        <>
          {/* Contenido de recompensas disponibles */}
          <RewardsContent
            user={user}
            rewards={rewards}
            onGenerate={handleGenerate}
            isPremium={isPremium}
          />

          {/* Banner de consejos */}
          <TokensTips />
        </>
      ) : (
        <>
          {/* Contenido del inventario */}
          <View className="gap-2">
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <RewardInventoryCard key={item.id} item={item} />
              ))
            ) : (
              <View className="py-12 items-center">
                <Text className="text-gray-500 text-center text-base">
                  No tienes items en tu inventario
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-2">
                  Canjea recompensas acumulables para verlas aquí
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      <Toast />
    </SurfaceScreen>
  );
};

export default RewardsScreen;
