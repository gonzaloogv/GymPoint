import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Reward } from '@features/rewards/domain/entities';
import { CooldownTimer } from '../../components/CooldownTimer';


type RewardCardProps = {
  reward: Reward;
  tokens: number;
  isPremium: boolean;
  onGenerate: (reward: Reward) => void;
  getCategoryColor: (category: string) => string;
  getCategoryName: (category: string) => string;
};

export function RewardCard({
  reward,
  tokens,
  isPremium,
  onGenerate,
  getCategoryColor,
  getCategoryName,
}: RewardCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isAffordable = tokens >= reward.cost;
  const meetsRequirements = !reward.requiresPremium || isPremium;
  const isClaimable = reward.canClaim !== false && isAffordable && meetsRequirements;
  const isDisabled = !isClaimable;
  const categoryColor = getCategoryColor(reward.category);

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
    if (reward.reason) return reward.reason;
    if (!meetsRequirements) return 'Requiere Premium';
    if (!isAffordable) return `Faltan ${reward.cost - tokens} tokens`;
    return 'Reclamar recompensa';
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
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.22)' : '#E3F2FD',
          }}
        >
          <Text className="text-xl">{reward.icon}</Text>
        </View>

        {/* Info */}
        <View className="flex-1 gap-2">
          {/* Header Row with Badges */}
          <View className="flex-row flex-wrap gap-2 mb-1">
            {/* Premium Badge */}
            {reward.requiresPremium && (
              <View className="rounded-xl px-2 py-1 bg-amber-100 border border-amber-400">
                <Text className="text-[10px] font-bold text-amber-700">👑 PREMIUM</Text>
              </View>
            )}

            {/* Stackable Badge */}
            {reward.isStackable && (
              <View className="rounded-xl px-2 py-1 bg-green-100 border border-green-400">
                <Text className="text-[10px] font-bold text-green-700">
                  ACUMULABLE {reward.currentStack || 0}/{reward.maxStack || 1}
                </Text>
              </View>
            )}

            {/* Cooldown Badge */}
            {reward.cooldownDays && reward.cooldownDays > 0 && (
              <View className="rounded-xl px-2 py-1 bg-orange-100 border border-orange-400">
                <Text className="text-[10px] font-bold text-orange-700">
                  ⏰ {reward.cooldownDays} DÍAS
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
            <View className="rounded-lg px-3 py-2 bg-orange-50 border border-orange-200">
              <Text className="text-xs text-orange-800 font-medium">
                🔥 Multiplica tus tokens x{reward.effectValue} por {reward.durationDays || 7} días
              </Text>
            </View>
          )}

          {reward.rewardType === 'streak_saver' && (
            <View className="rounded-lg px-3 py-2 bg-blue-50 border border-blue-200">
              <Text className="text-xs text-blue-800 font-medium">
                🛟 Protege tu racha automáticamente cuando sea necesario
              </Text>
            </View>
          )}

          {/* Cooldown Timer */}
          {reward.cooldownEndsAt && reward.canClaim === false && (
            <CooldownTimer endsAt={reward.cooldownEndsAt} />
          )}

          {/* Category Badge and Valid Days */}
          <View className="flex-row justify-between items-center">
            <View
              className="rounded-2xl px-3 py-2 border"
              style={{
                backgroundColor: `${categoryColor}20`,
                borderColor: categoryColor,
              }}
            >
              <Text className="text-xs font-semibold uppercase" style={{ color: categoryColor, letterSpacing: 0.6 }}>
                {getCategoryName(reward.category)}
              </Text>
            </View>

            {reward.validDays > 0 && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={12} color="#64748B" />
                <Text className="text-xs text-[#64748B]">{reward.validDays} días</Text>
              </View>
            )}
          </View>

          {/* Terms */}
          {reward.terms && (
            <Text className="text-xs text-[#78716C] italic">{reward.terms}</Text>
          )}

          {/* Stock Info */}
          {!reward.isUnlimited && reward.stock !== null && reward.stock !== undefined && (
            <Text className="text-xs text-[#78716C]">
              Stock: {reward.stock > 0 ? reward.stock : 'Agotado'}
            </Text>
          )}

          {/* Button */}
          <TouchableOpacity
            onPress={() => onGenerate(reward)}
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
