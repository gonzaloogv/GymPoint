// src/shared/hooks/useRealtimeSync.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { websocketService } from '@shared/services/websocket.service';
import { useWebSocketContext } from '@shared/providers';
import Toast from 'react-native-toast-message';
import { useAchievementsStore } from '@features/progress/presentation/state/achievements.store';
import { useRewardsStore } from '@features/rewards/presentation/state/rewards.store';
import { useGymsStore } from '@features/gyms/presentation/state/gyms.store';
import { useAuthStore } from '@features/auth/presentation/state/auth.store';

/**
 * Hook para sincronizar eventos de WebSocket con TanStack Query
 * Actualiza la caché de forma silenciosa sin causar re-renders innecesarios
 *
 * Este hook debe ser usado en el componente raíz autenticado de la app
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { connected } = useWebSocketContext();

  useEffect(() => {
    // Solo suscribir si hay conexión
    if (!connected) {
      console.log('[useRealtimeSync Mobile] WebSocket not connected, waiting...');
      return;
    }

    console.log('[useRealtimeSync Mobile] 🎧 WebSocket connected! Setting up realtime sync');

    // ========== USER TOKENS ==========

    const handleTokensUpdated = (data: {
      newBalance: number;
      previousBalance: number;
      delta: number;
      reason: string;
      timestamp: string;
    }) => {
      console.log('💰💰💰 [useRealtimeSync Mobile] TOKENS UPDATED EVENT RECEIVED! 💰💰💰');
      console.log('[useRealtimeSync Mobile] Previous:', data.previousBalance);
      console.log('[useRealtimeSync Mobile] New:', data.newBalance);
      console.log('[useRealtimeSync Mobile] Delta:', data.delta);
      console.log('[useRealtimeSync Mobile] Reason:', data.reason);

      // Actualizar TanStack Query cache (profile completo)
      queryClient.setQueryData(['user-profile'], (old: any) => {
        console.log('[useRealtimeSync Mobile] Updating user-profile cache. Old tokens:', old?.tokens);
        if (!old) return old;
        const updated = {
          ...old,
          tokens: data.newBalance, // Propiedad correcta: 'tokens' (no 'tokenBalance')
        };
        console.log('[useRealtimeSync Mobile] New tokens:', updated.tokens);
        return updated;
      });

      // También actualizar cualquier query de tokens específica
      queryClient.setQueryData(['user-tokens'], data.newBalance);

      // ⚡ IMPORTANTE: Actualizar el auth store para que la UI refleje los cambios
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.updateUser({
          ...authStore.user,
          tokens: data.newBalance,
        });
        console.log('[useRealtimeSync Mobile] ✅ Auth store updated with new tokens!');
      }

      console.log('[useRealtimeSync Mobile] ✅ Tokens cache updated successfully!');

      // Mostrar notificación si el delta es positivo
      if (data.delta > 0) {
        Toast.show({
          type: 'success',
          text1: '✨ Tokens recibidos',
          text2: `+${data.delta} tokens`,
          position: 'top',
          visibilityTime: 3000,
        });
      }
    };

    // ========== USER SUBSCRIPTION ==========

    const handleSubscriptionUpdated = (data: {
      previousSubscription: string;
      newSubscription: string;
      isPremium: boolean;
      premiumSince?: string;
      premiumExpires?: string;
      timestamp: string;
    }) => {
      console.log('👑👑👑 [useRealtimeSync Mobile] SUBSCRIPTION UPDATED EVENT RECEIVED! 👑👑👑');
      console.log('[useRealtimeSync Mobile] Previous:', data.previousSubscription);
      console.log('[useRealtimeSync Mobile] New:', data.newSubscription);
      console.log('[useRealtimeSync Mobile] Is Premium:', data.isPremium);

      // Actualizar TanStack Query cache
      queryClient.setQueryData(['user-profile'], (old: any) => {
        console.log('[useRealtimeSync Mobile] Updating user-profile cache. Old app_tier:', old?.app_tier);
        if (!old) return old;
        const updated = {
          ...old,
          app_tier: data.newSubscription, // Propiedad correcta: 'app_tier' (no 'subscriptionTier')
          premium_since: data.premiumSince, // Propiedad correcta: 'premium_since'
          premium_expires: data.premiumExpires, // Propiedad correcta: 'premium_expires'
        };
        console.log('[useRealtimeSync Mobile] New app_tier:', updated.app_tier);
        return updated;
      });

      // Invalidar queries que puedan depender del subscription tier
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      // ⚡ IMPORTANTE: Actualizar el auth store para que la UI refleje los cambios
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.updateUser({
          ...authStore.user,
          plan: data.isPremium ? 'Premium' : 'Free',
          role: data.isPremium ? 'PREMIUM' : 'USER',
        });
        console.log('[useRealtimeSync Mobile] ✅ Auth store updated with new plan:', data.isPremium ? 'Premium' : 'Free');
      }

      console.log('[useRealtimeSync Mobile] ✅ Subscription cache updated successfully!');

      // Notificación de cambio a premium
      if (data.isPremium && data.previousSubscription !== 'PREMIUM') {
        Toast.show({
          type: 'success',
          text1: '🎉 ¡Ahora eres Premium!',
          text2: 'Disfruta de todas las funciones',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    };

    // ========== USER PROFILE ==========

    const handleProfileUpdated = (data: {
      profile: any;
      timestamp: string;
    }) => {
      console.log('👤 [useRealtimeSync Mobile] PROFILE UPDATED EVENT RECEIVED!');
      console.log('[useRealtimeSync Mobile] Profile data:', data.profile);

      // Actualizar TanStack Query cache
      queryClient.setQueryData(['user-profile'], data.profile);
      console.log('[useRealtimeSync Mobile] ✅ Profile cache updated successfully!');
    };

    // ========== SUSCRIBIRSE A EVENTOS ==========

    console.log('[useRealtimeSync Mobile] 📤 Subscribing to user events...');
    websocketService.subscribeToTokens();
    websocketService.subscribeToProfile();

    console.log('[useRealtimeSync Mobile] 🎧 Registering event listeners...');
    websocketService.onTokensUpdated(handleTokensUpdated);
    websocketService.onSubscriptionUpdated(handleSubscriptionUpdated);
    websocketService.onProfileUpdated(handleProfileUpdated);
    console.log('[useRealtimeSync Mobile] ✅ All event listeners registered successfully!');

    // ========== EVENTOS BROADCAST (GIMNASIOS, LOGROS, RECOMPENSAS) ==========

    const handleGymsUpdated = (data: { action: string; gym?: any; gymId?: number; timestamp: string }) => {
      console.log('🏋️ [useRealtimeSync Mobile] GYMS UPDATED EVENT! Action:', data.action);

      // Activar recarga de gimnasios
      const gymsStore = useGymsStore.getState();
      gymsStore.triggerRefresh();
      console.log('[useRealtimeSync Mobile] ✅ Gyms refresh triggered!');

      // Mostrar notificación
      if (data.action === 'created') {
        Toast.show({
          type: 'info',
          text1: '🏋️ Nuevo gimnasio disponible',
          text2: data.gym?.name || 'Se agregó un nuevo gimnasio',
          position: 'top',
          visibilityTime: 3000,
        });
      } else if (data.action === 'updated') {
        Toast.show({
          type: 'info',
          text1: '🏋️ Gimnasio actualizado',
          text2: data.gym?.name || 'Se actualizó un gimnasio',
          position: 'top',
          visibilityTime: 2000,
        });
      } else if (data.action === 'deleted') {
        Toast.show({
          type: 'info',
          text1: '🏋️ Gimnasio eliminado',
          text2: 'Un gimnasio ya no está disponible',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    };

    const handleAchievementsUpdated = (data: { action: string; achievement?: any; timestamp: string }) => {
      console.log('🏆 [useRealtimeSync Mobile] ACHIEVEMENTS UPDATED EVENT! Action:', data.action);

      // Refrescar achievements store
      const achievementsStore = useAchievementsStore.getState();
      achievementsStore.fetchAchievements();

      if (data.action === 'created') {
        Toast.show({
          type: 'info',
          text1: '🏆 Nuevo logro disponible',
          text2: data.achievement?.name || 'Se agregó un nuevo logro',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    };

    const handleRewardsUpdated = (data: { action: string; reward?: any; timestamp: string }) => {
      console.log('🎁 [useRealtimeSync Mobile] REWARDS UPDATED EVENT! Action:', data.action);

      // Refrescar rewards store
      const rewardsStore = useRewardsStore.getState();
      rewardsStore.fetchRewards();
      rewardsStore.fetchInventory();

      if (data.action === 'created') {
        Toast.show({
          type: 'info',
          text1: '🎁 Nueva recompensa disponible',
          text2: data.reward?.name || 'Se agregó una nueva recompensa',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    };

    // Suscribirse a eventos broadcast
    console.log('[useRealtimeSync Mobile] 📡 Subscribing to broadcast events...');
    websocketService.on('data:gyms:updated', handleGymsUpdated);
    websocketService.on('data:achievements:updated', handleAchievementsUpdated);
    websocketService.on('data:rewards:updated', handleRewardsUpdated);

    // Cleanup: desuscribirse al desmontar
    return () => {
      console.log('[useRealtimeSync Mobile] 🧹 Cleaning up realtime sync...');
      websocketService.off('user:tokens:updated', handleTokensUpdated);
      websocketService.off('user:subscription:updated', handleSubscriptionUpdated);
      websocketService.off('user:profile:updated', handleProfileUpdated);
      websocketService.off('data:gyms:updated', handleGymsUpdated);
      websocketService.off('data:achievements:updated', handleAchievementsUpdated);
      websocketService.off('data:rewards:updated', handleRewardsUpdated);

      websocketService.unsubscribeFromTokens();
      websocketService.unsubscribeFromProfile();

      console.log('[useRealtimeSync Mobile] ✅ Cleaned up successfully');
    };
  }, [queryClient, connected]); // ⬅️ Agregar 'connected' como dependencia
}

/**
 * Hook para obtener el estado de conexión de WebSocket
 * Útil para mostrar indicadores de "En vivo"
 */
export function useWebSocketStatus() {
  const [isConnected, setIsConnected] = React.useState(websocketService.isConnected());

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };

    // Verificar cada segundo
    const interval = setInterval(checkConnection, 1000);

    // Verificar inmediatamente
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return isConnected;
}

// Importar React para useState
import React from 'react';
