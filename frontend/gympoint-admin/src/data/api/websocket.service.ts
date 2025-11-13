import { io, Socket } from 'socket.io-client';

const rawRealtimeFlag = (import.meta.env.VITE_REALTIME_UI ?? 'on').toString().toLowerCase();
const fallbackBaseUrl =
  import.meta.env.VITE_REALTIME_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  window.location.origin.replace(/\/$/, '');
const parsedTransports =
  (import.meta.env.VITE_REALTIME_TRANSPORT as string | undefined)
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
const transportList = parsedTransports && parsedTransports.length > 0 ? parsedTransports : ['websocket', 'polling'];

export const REALTIME_ENABLED = rawRealtimeFlag !== 'off';

/**
 * WebSocket Service (Singleton) para Admin Panel
 * Maneja conexión WebSocket con autenticación JWT
 */
class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Conectar al servidor WebSocket con autenticación JWT
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!REALTIME_ENABLED) {
        console.info('[WebSocket Admin] REALTIME_UI=off. Skipping WebSocket connection.');
        this.isConnecting = false;
        resolve();
        return;
      }

      if (this.socket?.connected) {
        console.log('[WebSocket Admin] Already connected');
        resolve();
        return;
      }

      if (this.isConnecting) {
        console.log('[WebSocket Admin] Connection already in progress');
        resolve();
        return;
      }

      this.isConnecting = true;

      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('[WebSocket Admin] No token found');
        this.isConnecting = false;
        reject(new Error('No authentication token found'));
        return;
      }

      const baseURL = fallbackBaseUrl;

      this.socket = io(baseURL, {
        auth: { token },
        transports: transportList.length ? transportList : ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connection:success', (data) => {
        console.log('[WebSocket Admin] Connected successfully:', data);
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        // Auto-suscribirse a eventos de administración
        this.subscribeToAdminEvents();

        resolve();
      });

      this.socket.on('admin:auth:error', (error) => {
        console.error('❌❌❌ [WebSocket Admin] ADMIN AUTH ERROR! ❌❌❌');
        console.error('[WebSocket Admin] Error:', error);
        console.error('[WebSocket Admin] Your user does NOT have ADMIN role!');
        console.error('[WebSocket Admin] Roles:', error.roles);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WebSocket Admin] Connection error:', error.message);
        this.isConnecting = false;
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[WebSocket Admin] Max reconnection attempts reached');
          reject(error);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocket Admin] Disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('error', (error) => {
        console.error('[WebSocket Admin] Socket error:', error);
      });

      // Timeout de 10 segundos para la conexión inicial
      setTimeout(() => {
        if (this.isConnecting) {
          this.isConnecting = false;
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Auto-suscribirse a eventos de administración
   */
  private subscribeToAdminEvents(): void {
    if (!this.socket?.connected) return;

    // Escuchar confirmaciones de suscripción
    this.socket.on('admin:subscribed:gym-requests', (data) => {
      console.log('[WebSocket Admin] ✅ Gym requests subscription confirmed:', data);
    });

    this.socket.on('admin:subscribed:user-management', (data) => {
      console.log('[WebSocket Admin] ✅ User management subscription confirmed:', data);
    });

    this.socket.on('admin:subscribed:stats', (data) => {
      console.log('[WebSocket Admin] ✅ Stats subscription confirmed:', data);
    });

    // Suscribirse a solicitudes de gimnasios
    this.socket.emit('admin:subscribe:gym-requests');
    console.log('[WebSocket Admin] 📤 Emitted admin:subscribe:gym-requests');

    // Suscribirse a gestión de usuarios
    this.socket.emit('admin:subscribe:user-management');
    console.log('[WebSocket Admin] 📤 Emitted admin:subscribe:user-management');

    // Suscribirse a estadísticas
    this.socket.emit('admin:subscribe:stats');
    console.log('[WebSocket Admin] 📤 Emitted admin:subscribe:stats');
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[WebSocket Admin] Disconnected manually');
    }
  }

  /**
   * Suscribirse a un evento específico
   */
  on<T = any>(event: string, handler: (data: T) => void): void {
    if (!this.socket) {
      console.warn('[WebSocket Admin] Socket not initialized');
      return;
    }
    this.socket.on(event, handler);
  }

  /**
   * Desuscribirse de un evento
   */
  off(event: string, handler?: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('[WebSocket Admin] Socket not initialized');
      return;
    }
    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Emitir un evento al servidor
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket Admin] Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtener el socket (para casos especiales)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  // ========== Métodos de conveniencia para eventos específicos ==========

  /**
   * Escuchar nuevas solicitudes de gimnasios
   */
  onGymRequestCreated(handler: (data: any) => void): void {
    this.on('gym:request:created', handler);
  }

  /**
   * Escuchar solicitudes aprobadas
   */
  onGymRequestApproved(handler: (data: any) => void): void {
    this.on('gym:request:approved', handler);
  }

  /**
   * Escuchar solicitudes rechazadas
   */
  onGymRequestRejected(handler: (data: any) => void): void {
    this.on('gym:request:rejected', handler);
  }

  /**
   * Escuchar cambios de suscripción de usuarios
   */
  onUserSubscriptionChanged(handler: (data: any) => void): void {
    this.on('user:subscription:changed', handler);
  }

  /**
   * Escuchar actualización de estadísticas
   */
  onStatsUpdated(handler: (data: any) => void): void {
    this.on('admin:stats:updated', handler);
  }
}

export const websocketService = WebSocketService.getInstance();
