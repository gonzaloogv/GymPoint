// src/features/rewards/ui/RewardsScreen.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { SurfaceScreen } from '@shared/components/ui';
import { BackButton } from '@shared/components/ui/BackButton';

// 1. IMPORTACIONES DE DOMINIO Y HOOKS
import { User } from '@features/auth/domain/entities/User';
import { useRewards } from '@features/rewards/presentation/hooks/useRewards';
import { useTheme } from '@shared/hooks';

// 2. IMPORTACIONES DE COMPONENTES MODULARES
import {
  RewardsHeader,
  RewardsContent,
  LoadingState,
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    useInventoryItem,
  } = useRewards({ user, onUpdateUser });

  // Handlers
  const handleGoBack = () => navigation?.goBack?.();
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

      {/* Tabs */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => setActiveTab('available')}
          activeOpacity={0.78}
          className="flex-1 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
          style={{
            backgroundColor: activeTab === 'available'
              ? isDark ? '#4C51BF' : '#4338CA'
              : isDark ? 'rgba(75, 85, 99, 0.22)' : 'rgba(156, 163, 175, 0.16)',
          }}
        >
          <Ionicons
            name="gift-outline"
            size={18}
            color={activeTab === 'available' ? '#ffffff' : isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            className="text-sm font-bold uppercase"
            style={{
              color: activeTab === 'available'
                ? '#ffffff'
                : isDark ? '#9CA3AF' : '#6B7280',
              letterSpacing: 0.6,
            }}
          >
            Disponibles ({rewards.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('inventory')}
          activeOpacity={0.78}
          className="flex-1 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
          style={{
            backgroundColor: activeTab === 'inventory'
              ? isDark ? '#4C51BF' : '#4338CA'
              : isDark ? 'rgba(75, 85, 99, 0.22)' : 'rgba(156, 163, 175, 0.16)',
          }}
        >
          <Ionicons
            name="cube-outline"
            size={18}
            color={activeTab === 'inventory' ? '#ffffff' : isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            className="text-sm font-bold uppercase"
            style={{
              color: activeTab === 'inventory'
                ? '#ffffff'
                : isDark ? '#9CA3AF' : '#6B7280',
              letterSpacing: 0.6,
            }}
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
                <RewardInventoryCard
                  key={item.id}
                  item={item}
                  onUse={(item) => useInventoryItem(item.id)}
                />
              ))
            ) : (
              <View className="py-12 items-center">
                <Text
                  className="text-center text-base font-semibold"
                  style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                >
                  No tienes items en tu inventario
                </Text>
                <Text
                  className="text-center text-sm mt-2"
                  style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}
                >
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
