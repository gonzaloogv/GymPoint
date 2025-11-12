import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Avatar, TokenPill } from '@shared/components/ui';
import { createScreenPalette } from '@shared/theme/palettes';
import StreakIcon from '@assets/icons/streak.svg';

type Props = {
  userName: string;
  plan: 'Free' | 'Premium';
  tokens: number;
  streak?: number;
  onBellPress?: () => void;
};

/**
 * HomeHeader - Encabezado principal de la pantalla de inicio
 *
 * Cambios en esta refactorización (FASE 2):
 * - Usa createScreenPalette(isDark) para colores centralizados
 * - Título: 30px → 32px (consistency con otras pantallas)
 * - letterSpacing: -0.01em → -0.4px (consistency con otras pantallas)
 * - Elimina hardcoded colors: #F9FAFB, #111827, etc.
 */
export default function HomeHeader({ userName, plan, tokens, streak = 0 }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const palette = createScreenPalette(isDark);

  const parts = (userName || '').trim().split(/\s+/);
  const firstName = parts[0] ?? userName ?? 'Usuario';

  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-1 flex-row items-center">
        <Avatar userName={userName} />
        <View className="ml-3">
          {/* Título principal: Ahora 32px en lugar de 30px, letterSpacing estandarizado */}
          <Text
            className="font-extrabold"
            style={{
              fontSize: 32,
              letterSpacing: -0.4,
              color: palette.title,
            }}
          >
            Hola, {firstName}
          </Text>
          {/* Subtítulo: Plan (Free/Premium) */}
          <Text
            className="mt-1 uppercase text-[11px] tracking-[3px]"
            style={{ color: palette.subtitle }}
          >
            Plan {plan}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 ml-3">
        <TokenPill value={tokens} />
        {/* Streak badge - Usa paleta para colores consistentes */}
        <View
          className="flex-row items-center px-3 py-1.5 rounded-full border"
          style={{
            backgroundColor: palette.streakIconBg,
            borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
            shadowColor: 'rgba(79, 70, 229, 0.45)',
            shadowOpacity: 0.16,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 14,
            elevation: 5,
          }}
        >
          <StreakIcon width={20} height={20} accessibilityLabel="racha" />
          <Text className="ml-1 font-semibold" style={{ color: isDark ? '#C7D2FE' : '#4338CA' }}>
            {streak}
          </Text>
        </View>
      </View>
    </View>
  );
}
