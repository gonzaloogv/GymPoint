// src/shared/hooks/useWebSocketNotifications.ts
import { useEffect, useState, useCallback } from 'react';
import { useWebSocketContext } from '@shared/providers/WebSocketProvider';
import { WS_EVENTS, NotificationPayload, UnreadCountPayload } from '@shared/types/websocket.types';
import Toast from 'react-native-toast-message';

interface UseWebSocketNotificationsReturn {
  unreadCount: number;
  subscribe: () => void;
  unsubscribe: () => void;
  markAsRead: (notificationId: number) => void;
  latestNotification: NotificationPayload | null;
}

/**
 * Hook para manejar notificaciones en tiempo real vía WebSocket
 */
export function useWebSocketNotifications(
  autoSubscribe = true,
  showToast = true,
): UseWebSocketNotificationsReturn {
  const { connected, on, off, subscribeToNotifications, unsubscribeFromNotifications, markNotificationAsRead } =
    useWebSocketContext();

  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<NotificationPayload | null>(null);

  /**
   * Manejar nueva notificación
   */
  const handleNewNotification = useCallback(
    (notification: NotificationPayload) => {
      console.log('[useWebSocketNotifications] New notification:', notification);
      setLatestNotification(notification);

      // Mostrar toast si está habilitado
      if (showToast) {
        Toast.show({
          type: getToastType(notification.type),
          text1: notification.title,
          text2: notification.message,
          visibilityTime: 4000,
          position: 'top',
          topOffset: 60,
        });
      }

      // Incrementar contador si no está leída
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    },
    [showToast],
  );

  /**
   * Manejar actualización de contador
   */
  const handleUnreadCount = useCallback((data: UnreadCountPayload) => {
    console.log('[useWebSocketNotifications] Unread count:', data.count);
    setUnreadCount(data.count);
  }, []);

  /**
   * Manejar confirmación de suscripción
   */
  const handleSubscribed = useCallback(() => {
    console.log('[useWebSocketNotifications] Subscribed to notifications');
  }, []);

  /**
   * Manejar confirmación de lectura
   */
  const handleReadSuccess = useCallback((data: { notificationId: number }) => {
    console.log('[useWebSocketNotifications] Notification marked as read:', data.notificationId);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Suscribirse manualmente
   */
  const subscribe = useCallback(() => {
    if (connected) {
      subscribeToNotifications();
    }
  }, [connected, subscribeToNotifications]);

  /**
   * Desuscribirse manualmente
   */
  const unsubscribe = useCallback(() => {
    if (connected) {
      unsubscribeFromNotifications();
    }
  }, [connected, unsubscribeFromNotifications]);

  /**
   * Marcar como leída
   */
  const markAsRead = useCallback(
    (notificationId: number) => {
      if (connected) {
        markNotificationAsRead(notificationId);
      }
    },
    [connected, markNotificationAsRead],
  );

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

    on(WS_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    on(WS_EVENTS.NOTIFICATIONS_UNREAD_COUNT, handleUnreadCount);
    on(WS_EVENTS.NOTIFICATIONS_SUBSCRIBED, handleSubscribed);
    on(WS_EVENTS.NOTIFICATIONS_READ_SUCCESS, handleReadSuccess);

    return () => {
      off(WS_EVENTS.NOTIFICATION_NEW, handleNewNotification);
      off(WS_EVENTS.NOTIFICATIONS_UNREAD_COUNT, handleUnreadCount);
      off(WS_EVENTS.NOTIFICATIONS_SUBSCRIBED, handleSubscribed);
      off(WS_EVENTS.NOTIFICATIONS_READ_SUCCESS, handleReadSuccess);
    };
  }, [connected, on, off, handleNewNotification, handleUnreadCount, handleSubscribed, handleReadSuccess]);

  return {
    unreadCount,
    subscribe,
    unsubscribe,
    markAsRead,
    latestNotification,
  };
}

/**
 * Obtener tipo de toast según tipo de notificación
 */
function getToastType(notificationType: NotificationPayload['type']): 'success' | 'error' | 'info' {
  switch (notificationType) {
    case 'ACHIEVEMENT':
    case 'REWARD':
      return 'success';
    case 'PAYMENT':
    case 'SYSTEM':
      return 'info';
    default:
      return 'info';
  }
}
