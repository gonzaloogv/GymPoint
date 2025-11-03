import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '@shared/hooks';
import { TimerState } from '@features/routines/domain/entities/ExecutionSession';
import { formatTime } from '@shared/utils';

type Props = {
  timerState: TimerState;
  exerciseName?: string;
  onSkip?: () => void;
  onTimerComplete?: () => void;
};

/**
 * Componente de timer flotante (sticky)
 * Se renderiza en la parte inferior de la pantalla, siempre visible
 * Permite al usuario interactuar con otros ejercicios mientras mide el tiempo
 */
export function FloatingTimer({
  timerState,
  exerciseName = 'Descanso',
  onSkip,
  onTimerComplete,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const backgroundColor = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const accentColor = '#3b82f6'; // Azul
  const warningColor = '#f59e0b'; // Naranja
  const successColor = '#10b981'; // Verde

  // Estado local para countdown
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Inicializar segundos cuando state cambia a active
  useEffect(() => {
    if (timerState.type === 'active') {
      setSecondsLeft(timerState.seconds);
    }
  }, [timerState]);

  // Countdown timer
  useEffect(() => {
    if (timerState.type !== 'active' || secondsLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev: number) => {
        const newValue = prev - 1;

        // Cuando llega a 0, disparar callback
        if (newValue <= 0) {
          clearInterval(interval);
          onTimerComplete?.();
          return 0;
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState, secondsLeft, onTimerComplete]);

  // No renderizar si el timer está en idle
  if (timerState.type === 'idle') {
    return null;
  }

  // Estado: INITIAL - Mensaje de calentamiento (menos visible)
  if (timerState.type === 'initial') {
    return (
      <View
        className="border-t py-3 px-4 flex-row items-center justify-between"
        style={{
          backgroundColor,
          borderTopColor: borderColor,
        }}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <Text className="text-2xl">🔥</Text>
          <View className="flex-1">
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: secondaryTextColor }}
            >
              Preparación
            </Text>
            <Text
              className="text-sm font-medium"
              style={{ color: textColor }}
            >
              {timerState.message}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Estado: ACTIVE - Timer contando (principal)
  if (timerState.type === 'active') {
    const displayColor = secondsLeft <= 5 ? warningColor : accentColor;

    return (
      <View
        className="border-t py-3 px-4 flex-row items-center justify-between"
        style={{
          backgroundColor,
          borderTopColor: borderColor,
        }}
      >
        <View className="flex-1">
          <Text
            className="text-xs font-semibold uppercase"
            style={{ color: secondaryTextColor }}
          >
            Descanso - {exerciseName}
          </Text>
          <View className="flex-row items-baseline gap-2 mt-1">
            <Text
              className="text-5xl font-black"
              style={{ color: displayColor }}
            >
              {formatTime(secondsLeft)}
            </Text>
            <Text
              className="text-xs"
              style={{ color: secondaryTextColor }}
            >
              segundos
            </Text>
          </View>
        </View>

        {/* Botón Omitir */}
        <TouchableOpacity
          className="ml-4 px-4 py-2 rounded-lg border"
          style={{
            borderColor: accentColor,
          }}
          onPress={onSkip}
          activeOpacity={0.7}
        >
          <Text
            className="font-semibold text-sm"
            style={{ color: accentColor }}
          >
            Omitir
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Estado: COMPLETED - Mensaje motivacional
  if (timerState.type === 'completed') {
    return (
      <View
        className="border-t py-3 px-4 flex-row items-center justify-between"
        style={{
          backgroundColor,
          borderTopColor: borderColor,
        }}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <Text className="text-2xl">✅</Text>
          <View className="flex-1">
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: secondaryTextColor }}
            >
              Descanso completado
            </Text>
            <Text
              className="text-sm font-medium"
              style={{ color: successColor }}
            >
              {timerState.message}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
}
