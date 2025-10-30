// src/shared/services/websocket.service.ts
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@shared/config/env';
import { tokenStorage } from './api';
import { WS_EVENTS } from '@shared/types/websocket.types';

/**
 * WebSocket Service
 * Gestiona la conexión WebSocket con el backend
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // ms

  /**
   * Inicializa la conexión WebSocket
   */
  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return this.socket;
    }

    try {
      // Obtener token de autenticación
      const token = await tokenStorage.getAccess();

      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('[WebSocket] Connecting to:', API_BASE_URL);

      // Crear conexión Socket.IO
      this.socket = io(API_BASE_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
      });

      this.setupEventHandlers();

      return this.socket;
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      throw error;
    }
  }

  /**
   * Configura los event handlers básicos
   */
  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on(WS_EVENTS.CONNECT, () => {
      console.log('[WebSocket] Connected successfully');
      this.reconnectAttempts = 0;
    });

    this.socket.on(WS_EVENTS.DISCONNECT, (reason: string) => {
      console.log('[WebSocket] Disconnected:', reason);
    });

    this.socket.on(WS_EVENTS.CONNECT_ERROR, (error: Error) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
      }
    });

    this.socket.on(WS_EVENTS.CONNECTION_SUCCESS, (data: any) => {
      console.log('[WebSocket] Connection success:', data);
    });
  }

  /**
   * Desconecta el socket
   */
  disconnect() {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Reconecta el socket
   */
  async reconnect() {
    this.disconnect();
    await this.connect();
  }

  /**
   * Obtiene la instancia del socket
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Emite un evento
   */
  emit(event: string, data?: any) {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot emit, not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Escucha un evento
   */
  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot listen, not connected');
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Deja de escuchar un evento
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // ============================================================================
  // NOTIFICATION METHODS
  // ============================================================================

  /**
   * Suscribirse a notificaciones
   */
  subscribeToNotifications() {
    this.emit(WS_EVENTS.NOTIFICATIONS_SUBSCRIBE);
  }

  /**
   * Desuscribirse de notificaciones
   */
  unsubscribeFromNotifications() {
    this.emit(WS_EVENTS.NOTIFICATIONS_UNSUBSCRIBE);
  }

  /**
   * Marcar notificación como leída
   */
  markNotificationAsRead(notificationId: number) {
    this.emit(WS_EVENTS.NOTIFICATIONS_MARK_READ, { notificationId });
  }

  /**
   * Obtener contador de no leídas
   */
  getUnreadCount() {
    this.emit(WS_EVENTS.NOTIFICATIONS_GET_UNREAD_COUNT);
  }

  // ============================================================================
  // PRESENCE METHODS
  // ============================================================================

  /**
   * Unirse a room de gimnasio para ver presencia
   */
  joinGym(gymId: number) {
    this.emit(WS_EVENTS.PRESENCE_JOIN_GYM, { gymId });
  }

  /**
   * Salir de room de gimnasio
   */
  leaveGym(gymId: number) {
    this.emit(WS_EVENTS.PRESENCE_LEAVE_GYM, { gymId });
  }

  /**
   * Check-in en gimnasio
   */
  checkin(gymId: number) {
    this.emit(WS_EVENTS.PRESENCE_CHECKIN, { gymId });
  }

  /**
   * Check-out de gimnasio
   */
  checkout(gymId: number) {
    this.emit(WS_EVENTS.PRESENCE_CHECKOUT, { gymId });
  }

  /**
   * Obtener conteo de presencia
   */
  getPresenceCount(gymId: number) {
    this.emit(WS_EVENTS.PRESENCE_GET_COUNT, { gymId });
  }

  // ============================================================================
  // STREAK METHODS
  // ============================================================================

  /**
   * Suscribirse a actualizaciones de racha
   */
  subscribeToStreak() {
    this.emit(WS_EVENTS.STREAK_SUBSCRIBE);
  }

  /**
   * Desuscribirse de actualizaciones de racha
   */
  unsubscribeFromStreak() {
    this.emit(WS_EVENTS.STREAK_UNSUBSCRIBE);
  }

  // ============================================================================
  // ASSISTANCE METHODS
  // ============================================================================

  /**
   * Suscribirse a asistencias de un gimnasio
   */
  subscribeToGymAssistance(gymId: number) {
    this.emit(WS_EVENTS.ASSISTANCE_SUBSCRIBE_GYM, { gymId });
  }

  /**
   * Desuscribirse de asistencias de un gimnasio
   */
  unsubscribeFromGymAssistance(gymId: number) {
    this.emit(WS_EVENTS.ASSISTANCE_UNSUBSCRIBE_GYM, { gymId });
  }
}

// Exportar instancia singleton
export const websocketService = new WebSocketService();
