// src/shared/hooks/useGymPresence.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocketContext } from '@shared/providers/WebSocketProvider';
import {
  WS_EVENTS,
  PresenceUserEnteredPayload,
  PresenceUserLeftPayload,
  PresenceUpdatedPayload,
} from '@shared/types/websocket.types';

interface UseGymPresenceReturn {
  currentCount: number;
  isJoined: boolean;
  join: () => void;
  leave: () => void;
  checkin: () => void;
  checkout: () => void;
  recentActivity: Array<{ type: 'entered' | 'left'; userId: number; timestamp: string }>;
}

/**
 * Hook para manejar presencia en tiempo real de un gimnasio
 */
export function useGymPresence(gymId: number | null, autoJoin = false): UseGymPresenceReturn {
  const { connected, on, off, joinGym, leaveGym, checkin: wsCheckin, checkout: wsCheckout } = useWebSocketContext();

  const [currentCount, setCurrentCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [recentActivity, setRecentActivity] = useState<Array<{ type: 'entered' | 'left'; userId: number; timestamp: string }>>([]);

  const gymIdRef = useRef(gymId);

  /**
   * Actualizar ref cuando cambia gymId
   */
  useEffect(() => {
    gymIdRef.current = gymId;
  }, [gymId]);

  /**
   * Manejar usuario que entró al gimnasio
   */
  const handleUserEntered = useCallback(
    (data: PresenceUserEnteredPayload) => {
      if (data.gymId !== gymIdRef.current) return;

      console.log('[useGymPresence] User entered:', data);
      setCurrentCount((prev) => prev + 1);
      setRecentActivity((prev) => [
        { type: 'entered', userId: data.userId, timestamp: data.timestamp },
        ...prev.slice(0, 9), // Mantener últimas 10 actividades
      ]);
    },
    [],
  );

  /**
   * Manejar usuario que salió del gimnasio
   */
  const handleUserLeft = useCallback(
    (data: PresenceUserLeftPayload) => {
      if (data.gymId !== gymIdRef.current) return;

      console.log('[useGymPresence] User left:', data);
      setCurrentCount((prev) => Math.max(0, prev - 1));
      setRecentActivity((prev) => [
        { type: 'left', userId: data.userId, timestamp: data.timestamp },
        ...prev.slice(0, 9),
      ]);
    },
    [],
  );

  /**
   * Manejar actualización de presencia
   */
  const handlePresenceUpdated = useCallback(
    (data: PresenceUpdatedPayload) => {
      if (data.gymId !== gymIdRef.current) return;

      console.log('[useGymPresence] Presence updated:', data);
      setCurrentCount(data.currentCount);
    },
    [],
  );

  /**
   * Manejar confirmación de join
   */
  const handleJoinedGym = useCallback(
    (data: { success: boolean; gymId: number }) => {
      if (data.gymId !== gymIdRef.current) return;

      console.log('[useGymPresence] Joined gym:', data.gymId);
      setIsJoined(true);
    },
    [],
  );

  /**
   * Manejar confirmación de leave
   */
  const handleLeftGym = useCallback(
    (data: { success: boolean; gymId: number }) => {
      if (data.gymId !== gymIdRef.current) return;

      console.log('[useGymPresence] Left gym:', data.gymId);
      setIsJoined(false);
    },
    [],
  );

  /**
   * Unirse al room del gimnasio
   */
  const join = useCallback(() => {
    if (connected && gymIdRef.current) {
      joinGym(gymIdRef.current);
    }
  }, [connected, joinGym]);

  /**
   * Salir del room del gimnasio
   */
  const leave = useCallback(() => {
    if (connected && gymIdRef.current) {
      leaveGym(gymIdRef.current);
    }
  }, [connected, leaveGym]);

  /**
   * Check-in en el gimnasio
   */
  const checkinGym = useCallback(() => {
    if (connected && gymIdRef.current) {
      wsCheckin(gymIdRef.current);
    }
  }, [connected, wsCheckin]);

  /**
   * Check-out del gimnasio
   */
  const checkoutGym = useCallback(() => {
    if (connected && gymIdRef.current) {
      wsCheckout(gymIdRef.current);
    }
  }, [connected, wsCheckout]);

  /**
   * Auto-join cuando cambia el gymId o la conexión
   */
  useEffect(() => {
    if (connected && gymId && autoJoin) {
      join();
    }

    return () => {
      if (isJoined && gymId) {
        leave();
      }
    };
  }, [connected, gymId, autoJoin]);

  /**
   * Registrar listeners de eventos
   */
  useEffect(() => {
    if (!connected) return;

    on(WS_EVENTS.PRESENCE_USER_ENTERED, handleUserEntered);
    on(WS_EVENTS.PRESENCE_USER_LEFT, handleUserLeft);
    on(WS_EVENTS.PRESENCE_UPDATED, handlePresenceUpdated);
    on(WS_EVENTS.PRESENCE_JOINED_GYM, handleJoinedGym);
    on(WS_EVENTS.PRESENCE_LEFT_GYM, handleLeftGym);

    return () => {
      off(WS_EVENTS.PRESENCE_USER_ENTERED, handleUserEntered);
      off(WS_EVENTS.PRESENCE_USER_LEFT, handleUserLeft);
      off(WS_EVENTS.PRESENCE_UPDATED, handlePresenceUpdated);
      off(WS_EVENTS.PRESENCE_JOINED_GYM, handleJoinedGym);
      off(WS_EVENTS.PRESENCE_LEFT_GYM, handleLeftGym);
    };
  }, [connected, on, off, handleUserEntered, handleUserLeft, handlePresenceUpdated, handleJoinedGym, handleLeftGym]);

  return {
    currentCount,
    isJoined,
    join,
    leave,
    checkin: checkinGym,
    checkout: checkoutGym,
    recentActivity,
  };
}
