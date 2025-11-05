import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '@shared/hooks';
import { TimerState } from '@features/routines/domain/entities/ExecutionSession';
import { formatTime } from '@shared/utils';

type Props = {
  state: TimerState;
  onTimerComplete?: () => void;
  onSkip?: () => void;
};

/**
 * Componente de temporizador de descanso con máquina de 4 estados
 * Estados:
 * 1. initial: "No olvides el calentamiento!"
 * 2. active: Contador regresivo (00:55)
 * 3. completed: Mensaje aleatorio motivacional
 * 4. idle: No mostrar nada
 */
export function RestTimer({ state, onTimerComplete, onSkip }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const accentColor = '#3b82f6'; // Azul
  const warningColor = '#f59e0b'; // Naranja

  // Estado local para countdown
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Inicializar segundos cuando state cambia a active
  useEffect(() => {
    if (state.type === 'active') {
      setSecondsLeft(state.seconds);
    }
  }, [state]);

  // Countdown timer
  useEffect(() => {
    if (state.type !== 'active' || secondsLeft <= 0) {
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
  }, [state, secondsLeft, onTimerComplete]);

  // Estado: IDLE - No mostrar nada
  if (state.type === 'idle') {
    return null;
  }

  // Estado: INITIAL - Mensaje de calentamiento
  if (state.type === 'initial') {
    return (
      <View className="py-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${warningColor}15` }}>
        <Text className="text-3xl mb-2">🔥</Text>
        <Text
          className="text-center font-semibold text-base"
          style={{ color: textColor }}
        >
          {state.message}
        </Text>
      </View>
    );
  }

  // Estado: ACTIVE - Timer contando
  if (state.type === 'active') {
    return (
      <View className="py-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
        <Text
          className="text-xs font-semibold uppercase mb-2"
          style={{ color: secondaryTextColor }}
        >
          Descanso - {state.exerciseName}
        </Text>

        {/* Timer circular display */}
        <View className="items-center justify-center mb-4">
          <Text
            className="text-6xl font-black"
            style={{ color: accentColor }}
          >
            {formatTime(secondsLeft)}
          </Text>
        </View>

        {/* Botón Omitir */}
        <TouchableOpacity
          className="px-6 py-2 rounded-lg border"
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
  if (state.type === 'completed') {
    return (
      <View className="py-6 items-center justify-center rounded-lg" style={{ backgroundColor: `#10b98115` }}>
        <Text className="text-3xl mb-2">✅</Text>
        <Text
          className="text-center font-bold text-base"
          style={{ color: '#10b981' }}
        >
          {state.message}
        </Text>
      </View>
    );
  }

  return null;
}
