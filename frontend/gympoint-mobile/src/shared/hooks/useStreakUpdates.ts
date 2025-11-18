// src/shared/hooks/useStreakUpdates.ts
import { useEffect, useState, useCallback } from 'react';
import { useWebSocketContext } from '@shared/providers/WebSocketProvider';
import { WS_EVENTS, StreakUpdatedPayload, StreakMilestonePayload, StreakLostPayload } from '@shared/types/websocket.types';
import Toast from 'react-native-toast-message';

interface UseStreakUpdatesReturn {
  currentStreak: number;
  longestStreak: number;
  subscribe: () => void;
  unsubscribe: () => void;
  latestMilestone: StreakMilestonePayload | null;
}

/**
 * Hook para manejar actualizaciones de racha en tiempo real
 *
 * @deprecated Este hook se mantiene para compatibilidad con componentes existentes,
 * pero se recomienda usar `useRealtimeSync` directamente para sincronización global.
 *
 * `useRealtimeSync` centraliza todos los eventos WebSocket (streak, tokens, achievements, etc.)
 * y evita duplicación de listeners y lógica. Este hook seguirá funcionando, pero considere
 * migrar a `useRealtimeSync` en nuevos componentes.
 *
 * @param autoSubscribe - Suscribirse automáticamente al conectar (default: true)
 * @param showToasts - Mostrar toasts en actualizaciones (default: true)
 * @returns Estado de la racha y métodos de suscripción
 *
 * @example
 * // Forma antigua (deprecated):
 * const { currentStreak } = useStreakUpdates();
 *
 * // Forma recomendada (usar useRealtimeSync globalmente + leer desde store):
 * useRealtimeSync(); // En nivel superior de la app
 * const { user } = useHomeStore(); // Leer streak desde store
 * const currentStreak = user?.streak ?? 0;
 */
export function useStreakUpdates(autoSubscribe = true, showToasts = true): UseStreakUpdatesReturn {
  const { connected, on, off, subscribeToStreak, unsubscribeFromStreak } = useWebSocketContext();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [latestMilestone, setLatestMilestone] = useState<StreakMilestonePayload | null>(null);

  /**
   * Manejar actualización de racha
   */
  const handleStreakUpdated = useCallback(
    (data: StreakUpdatedPayload) => {
      console.log('[useStreakUpdates] Streak updated:', data);
      setCurrentStreak(data.currentStreak);
      setLongestStreak(data.longestStreak);

      // Mostrar toast si aumentó la racha
      if (showToasts && data.currentStreak > currentStreak) {
        Toast.show({
          type: 'success',
          text1: '🔥 Racha actualizada',
          text2: `${data.currentStreak} día${data.currentStreak !== 1 ? 's' : ''} consecutivo${data.currentStreak !== 1 ? 's' : ''}`,
          visibilityTime: 3000,
          position: 'top',
          topOffset: 60,
        });
      }
    },
    [currentStreak, showToasts],
  );

  /**
   * Manejar hito de racha alcanzado
   */
  const handleStreakMilestone = useCallback(
    (data: StreakMilestonePayload) => {
      console.log('[useStreakUpdates] Streak milestone:', data);
      setLatestMilestone(data);

      // Mostrar celebración
      if (showToasts) {
        Toast.show({
          type: 'success',
          text1: '🎉 ¡Hito alcanzado!',
          text2: data.message,
          visibilityTime: 5000,
          position: 'top',
          topOffset: 60,
        });
      }
    },
    [showToasts],
  );

  /**
   * Manejar pérdida de racha
   */
  const handleStreakLost = useCallback(
    (data: StreakLostPayload) => {
      console.log('[useStreakUpdates] Streak lost:', data);
      setCurrentStreak(0);

      // Mostrar notificación
      if (showToasts) {
        Toast.show({
          type: 'error',
          text1: '😢 Racha perdida',
          text2: `Tenías ${data.previousStreak} día${data.previousStreak !== 1 ? 's' : ''}. ¡Inténtalo de nuevo!`,
          visibilityTime: 4000,
          position: 'top',
          topOffset: 60,
        });
      }
    },
    [showToasts],
  );

  /**
   * Manejar confirmación de suscripción
   */
  const handleSubscribed = useCallback(() => {
    console.log('[useStreakUpdates] Subscribed to streak updates');
  }, []);

  /**
   * Suscribirse manualmente
   */
  const subscribe = useCallback(() => {
    if (connected) {
      subscribeToStreak();
    }
  }, [connected, subscribeToStreak]);

  /**
   * Desuscribirse manualmente
   */
  const unsubscribe = useCallback(() => {
    if (connected) {
      unsubscribeFromStreak();
    }
  }, [connected, unsubscribeFromStreak]);

  /**
   * Auto-suscribirse cuando se conecta
   */
  useEffect(() => {
    if (connected && autoSubscribe) {
      subscribe();
    }
  }, [connected, autoSubscribe, subscribe]);

  /**
   * Registrar listeners de eventos
   */
  useEffect(() => {
    if (!connected) return;

    on(WS_EVENTS.STREAK_UPDATED, handleStreakUpdated);
    on(WS_EVENTS.STREAK_MILESTONE, handleStreakMilestone);
    on(WS_EVENTS.STREAK_LOST, handleStreakLost);
    on(WS_EVENTS.STREAK_SUBSCRIBED, handleSubscribed);

    return () => {
      off(WS_EVENTS.STREAK_UPDATED, handleStreakUpdated);
      off(WS_EVENTS.STREAK_MILESTONE, handleStreakMilestone);
      off(WS_EVENTS.STREAK_LOST, handleStreakLost);
      off(WS_EVENTS.STREAK_SUBSCRIBED, handleSubscribed);
    };
  }, [connected, on, off, handleStreakUpdated, handleStreakMilestone, handleStreakLost, handleSubscribed]);

  return {
    currentStreak,
    longestStreak,
    subscribe,
    unsubscribe,
    latestMilestone,
  };
}
