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
      console.log('[WebSocket Mobile] ✅ Connected successfully');
      this.reconnectAttempts = 0;
    });

    this.socket.on(WS_EVENTS.DISCONNECT, (reason: string) => {
      console.log('[WebSocket Mobile] Disconnected:', reason);
    });

    this.socket.on(WS_EVENTS.CONNECT_ERROR, (error: Error) => {
      console.error('[WebSocket Mobile] ❌ Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket Mobile] Max reconnection attempts reached');
      }
    });

    this.socket.on(WS_EVENTS.CONNECTION_SUCCESS, (data: any) => {
      console.log('[WebSocket Mobile] ✅ Connection success:', data);
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

  // ============================================================================
  // USER PROFILE METHODS
  // ============================================================================

  /**
   * Suscribirse a actualizaciones de perfil
   */
  subscribeToProfile() {
    console.log('[WebSocket Mobile] 📤 Subscribing to profile updates...');
    this.emit('user:subscribe:profile');

    // Escuchar confirmación
    this.on('user:subscribed:profile', (data: any) => {
      console.log('[WebSocket Mobile] ✅ Profile subscription confirmed:', data);
    });
  }

  /**
   * Desuscribirse de actualizaciones de perfil
   */
  unsubscribeFromProfile() {
    console.log('[WebSocket Mobile] 📤 Unsubscribing from profile updates...');
    this.emit('user:unsubscribe:profile');
  }

  /**
   * Suscribirse a actualizaciones de tokens
   */
  subscribeToTokens() {
    console.log('[WebSocket Mobile] 📤 Subscribing to token updates...');
    this.emit('user:subscribe:tokens');

    // Escuchar confirmación
    this.on('user:subscribed:tokens', (data: any) => {
      console.log('[WebSocket Mobile] ✅ Tokens subscription confirmed:', data);
    });
  }

  /**
   * Desuscribirse de actualizaciones de tokens
   */
  unsubscribeFromTokens() {
    console.log('[WebSocket Mobile] 📤 Unsubscribing from token updates...');
    this.emit('user:unsubscribe:tokens');
  }

  /**
   * Escuchar actualizaciones de tokens
   */
  onTokensUpdated(callback: (data: any) => void) {
    console.log('[WebSocket Mobile] 🎧 Listening for tokens updates...');
    this.on('user:tokens:updated', callback);
  }

  /**
   * Escuchar actualizaciones de suscripción
   */
  onSubscriptionUpdated(callback: (data: any) => void) {
    console.log('[WebSocket Mobile] 🎧 Listening for subscription updates...');
    this.on('user:subscription:updated', callback);
  }

  /**
   * Escuchar actualizaciones de perfil
   */
  onProfileUpdated(callback: (data: any) => void) {
    console.log('[WebSocket Mobile] 🎧 Listening for profile updates...');
    this.on('user:profile:updated', callback);
  }
}

// Exportar instancia singleton
export const websocketService = new WebSocketService();
