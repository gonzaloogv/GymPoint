// src/shared/hooks/useCheckInUpdates.ts
import { useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from '@shared/providers/WebSocketProvider';
import { WS_EVENTS, AssistanceNewPayload } from '@shared/types/websocket.types';

interface CheckInUpdatesCallbacks {
  onCheckIn?: (data: AssistanceNewPayload) => void;
  onStreakUpdated?: (data: { currentStreak: number; longestStreak: number }) => void;
  onStreakMilestone?: (data: { milestone: number; currentStreak: number; message: string }) => void;
}

/**
 * Hook para escuchar actualizaciones de check-ins y rachas en tiempo real
 * Se activa automáticamente cuando el usuario hace check-in
 */
export function useCheckInUpdates(callbacks: CheckInUpdatesCallbacks) {
  const { connected, on, off } = useWebSocketContext();

  // Usar refs para callbacks
  const onCheckInRef = useRef(callbacks.onCheckIn);
  const onStreakUpdatedRef = useRef(callbacks.onStreakUpdated);
  const onStreakMilestoneRef = useRef(callbacks.onStreakMilestone);

  // Actualizar refs
  useEffect(() => {
    onCheckInRef.current = callbacks.onCheckIn;
    onStreakUpdatedRef.current = callbacks.onStreakUpdated;
    onStreakMilestoneRef.current = callbacks.onStreakMilestone;
  }, [callbacks.onCheckIn, callbacks.onStreakUpdated, callbacks.onStreakMilestone]);

  /**
   * Handler para nuevo check-in (puede ser de otro usuario en el mismo gym)
   */
  const handleNewCheckIn = useCallback((data: AssistanceNewPayload) => {
    console.log('[useCheckInUpdates] New check-in:', data);
    onCheckInRef.current?.(data);
  }, []);

  /**
   * Handler para racha actualizada
   */
  const handleStreakUpdated = useCallback(
    (data: { currentStreak: number; longestStreak: number; lastAssistanceDate?: string; timestamp: string }) => {
      console.log('[useCheckInUpdates] Streak updated:', data);
      onStreakUpdatedRef.current?.({
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
      });
    },
    [],
  );

  /**
   * Handler para hito de racha alcanzado
   */
  const handleStreakMilestone = useCallback(
    (data: { milestone: number; currentStreak: number; message: string }) => {
      console.log('[useCheckInUpdates] Streak milestone:', data);
      onStreakMilestoneRef.current?.(data);
    },
    [],
  );

  /**
   * Registrar listeners
   */
  useEffect(() => {
    if (!connected) return;

    on(WS_EVENTS.ASSISTANCE_NEW, handleNewCheckIn);
    on(WS_EVENTS.STREAK_UPDATED, handleStreakUpdated);
    on(WS_EVENTS.STREAK_MILESTONE, handleStreakMilestone);

    return () => {
      off(WS_EVENTS.ASSISTANCE_NEW, handleNewCheckIn);
      off(WS_EVENTS.STREAK_UPDATED, handleStreakUpdated);
      off(WS_EVENTS.STREAK_MILESTONE, handleStreakMilestone);
    };
  }, [connected, on, off, handleNewCheckIn, handleStreakUpdated, handleStreakMilestone]);

  return { connected };
}
