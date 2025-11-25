import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Reward, RewardType } from '@features/rewards/domain/entities';
import { CooldownTimer } from '../../components/CooldownTimer';

// Helper: Mapea reward type a nombre de Ionicon
const getRewardIconName = (rewardType?: RewardType | null): keyof typeof Ionicons.glyphMap => {
  switch (rewardType) {
    case 'pase_gratis':
      return 'barbell-outline';
    case 'descuento':
      return 'pricetag-outline';
    case 'producto':
      return 'cube-outline';
    case 'servicio':
      return 'sparkles-outline';
    case 'merchandising':
      return 'shirt-outline';
    case 'token_multiplier':
      return 'flame-outline';
    case 'streak_saver':
      return 'shield-checkmark-outline';
    default:
      return 'gift-outline';
  }
};

// Helper: Mapea reward type a color del icono
const getRewardIconColor = (rewardType?: RewardType | null): string => {
  switch (rewardType) {
    case 'pase_gratis':
      return '#8B5CF6'; // Purple
    case 'descuento':
      return '#EC4899'; // Pink
    case 'producto':
      return '#06B6D4'; // Cyan
    case 'servicio':
      return '#A855F7'; // Purple
    case 'merchandising':
      return '#F59E0B'; // Amber
    case 'token_multiplier':
      return '#F97316'; // Orange
    case 'streak_saver':
      return '#3B82F6'; // Blue
    default:
      return '#6366F1'; // Indigo
  }
};

type RewardCardProps = {
  reward: Reward;
  tokens: number;
  isPremium: boolean;
  onGenerate: (reward: Reward) => void;
};

export function RewardCard({
  reward,
  tokens,
  isPremium,
  onGenerate,
}: RewardCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isAffordable = tokens >= reward.cost;
  const meetsRequirements = !reward.requiresPremium || isPremium;
  const isClaimable = reward.canClaim !== false && isAffordable && meetsRequirements;
  const isDisabled = !isClaimable;

  // DEBUG LOG para recompensas premium
  if (reward.requiresPremium) {
    console.log('[RewardCard] 🎁 Premium reward:', {
      name: reward.name,
      requiresPremium: reward.requiresPremium,
      isPremiumProp: isPremium,
      meetsRequirements,
      canClaim: reward.canClaim,
      isAffordable,
      isClaimable,
      isDisabled,
    });
  }

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

  // Definir colores del borde según categoría y tema
  const getBorderColor = () => {
    if (reward.canClaim === false) {
      return isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)';
    }
    if (!meetsRequirements) {
      return isDark ? 'rgba(251, 146, 60, 0.4)' : 'rgba(251, 146, 60, 0.3)';
    }
    if (isAffordable) {
      return isDark ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.4)';
    }
    return isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  };

  const getButtonText = () => {
    // Si está en cooldown, calcular tiempo restante
    if (reward.canClaim === false && reward.cooldownEndsAt) {
      const now = new Date();
      const endsAt = new Date(reward.cooldownEndsAt);
      const diffInMs = endsAt.getTime() - now.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays >= 1) {
        return `Reclamar en ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
      } else if (diffInHours > 0) {
        return `Reclamar en ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
      } else {
        return 'Reclamar ahora';
      }
    }

    if (!meetsRequirements) return 'Requiere Premium';
    if (!isAffordable) return `Faltan ${reward.cost - tokens} tokens`;
    return 'Reclamar recompensa';
  };

  const handleClaim = () => {
    Alert.alert(
      'Confirmar canje',
      `¿Deseas canjear "${reward.title}" por ${reward.cost} tokens?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Canjear',
          onPress: () => onGenerate(reward),
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      className="rounded-[28px] px-5 py-[18px] border"
      style={[
        {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: getBorderColor(),
          opacity: isClaimable ? 1 : 0.75,
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row gap-3">
        {/* Icon */}
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.15)',
            borderColor: isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.35)',
          }}
        >
          <Ionicons
            name={getRewardIconName(reward.rewardType)}
            size={24}
            color={getRewardIconColor(reward.rewardType)}
          />
        </View>

        {/* Info */}
        <View className="flex-1 gap-2">
          {/* Header Row with Badges */}
          <View className="flex-row flex-wrap gap-2 mb-1">
            {/* Premium Badge */}
            {reward.requiresPremium && (
              <View
                className="rounded-2xl px-3 py-1.5 border"
                style={{
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.25)',
                }}
              >
                <Text className="text-[10px] font-bold" style={{ color: '#F59E0B', letterSpacing: 0.6 }}>
                  PREMIUM
                </Text>
              </View>
            )}

            {/* Stackable Badge */}
            {reward.isStackable && (
              <View
                className="rounded-2xl px-3 py-1.5 border"
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                  borderColor: isDark ? 'rgba(34, 197, 94, 0.35)' : 'rgba(34, 197, 94, 0.25)',
                }}
              >
                <Text className="text-[10px] font-bold" style={{ color: '#22C55E', letterSpacing: 0.6 }}>
                  {reward.currentStack || 0}/{reward.maxStack || 1}
                </Text>
              </View>
            )}
          </View>

          {/* Title and Description */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 gap-1">
              <Text
                className="text-lg font-bold"
                style={{ color: isDark ? '#F9FAFB' : '#111827' }}
              >
                {reward.title}
              </Text>
              <Text className="text-[13px] font-medium leading-[18px] text-[#78716C]">
                {reward.description}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="flash" size={14} color="#F59E0B" />
              <Text className="text-sm font-semibold text-[#F59E0B]">{reward.cost}</Text>
            </View>
          </View>

          {/* Effect Info */}
          {reward.rewardType === 'token_multiplier' && reward.effectValue && (
            <View
              className="rounded-2xl px-3 py-2 border flex-row items-center gap-2"
              style={{
                backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.1)',
                borderColor: isDark ? 'rgba(249, 115, 22, 0.35)' : 'rgba(249, 115, 22, 0.25)',
              }}
            >
              <Ionicons name="flame" size={16} color="#F97316" />
              <Text className="text-xs font-medium flex-1" style={{ color: isDark ? '#FB923C' : '#EA580C' }}>
                Multiplica tus tokens x{reward.effectValue} por {reward.durationDays || 7} días
              </Text>
            </View>
          )}

          {reward.rewardType === 'streak_saver' && (
            <View
              className="rounded-2xl px-3 py-2 border flex-row items-center gap-2"
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.25)',
              }}
            >
              <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
              <Text className="text-xs font-medium flex-1" style={{ color: isDark ? '#60A5FA' : '#2563EB' }}>
                Protege tu racha automáticamente cuando sea necesario
              </Text>
            </View>
          )}

          {/* Cooldown Timer */}
          {reward.cooldownEndsAt && reward.canClaim === false && (
            <CooldownTimer endsAt={reward.cooldownEndsAt} />
          )}

          {/* Button */}
          <TouchableOpacity
            onPress={handleClaim}
            disabled={isDisabled}
            activeOpacity={0.78}
            className="py-3.5 rounded-2xl items-center"
            style={{
              backgroundColor: isDisabled
                ? isDark
                  ? 'rgba(75, 85, 99, 0.22)'
                  : 'rgba(156, 163, 175, 0.16)'
                : isDark
                  ? '#4C51BF'
                  : '#4338CA',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            <Text
              className="text-sm font-bold uppercase"
              style={{
                color: isDisabled ? (isDark ? '#9CA3AF' : '#78716C') : '#ffffff',
                letterSpacing: 0.6,
              }}
            >
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
