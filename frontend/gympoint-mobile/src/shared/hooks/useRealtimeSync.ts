// src/shared/hooks/useRealtimeSync.ts
import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { websocketService } from '@shared/services/websocket.service';
import { useWebSocketContext } from '@shared/providers/WebSocketProvider';
import { REALTIME_UI_ENABLED } from '@shared/config/env';
import { useHomeStore } from '@features/home/presentation/state/home.store';
import { useUserProfileStore } from '@features/user/presentation/state/userProfile.store';
import { useAuthStore } from '@features/auth/presentation/state/auth.store';
import { useTokensStore } from '@features/tokens/presentation/state/tokens.store';
import { useProgressStore } from '@features/progress/presentation/state/progress.store';
import { WS_EVENTS } from '@shared/types/websocket.types';
import type {
  AttendanceRecordedPayload,
  WeeklyProgressUpdatedPayload,
  AchievementUnlockedPayload,
  RewardEarnedPayload,
} from '@root/shared/types/websocket-events.types';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { connected } = useWebSocketContext();
  const lastAnnouncementId = React.useRef<string | null>(null);

  useEffect(() => {
    if (!REALTIME_UI_ENABLED || !connected) {
      return;
    }

    const handleTokensUpdated = (data: {
      newBalance: number;
      previousBalance: number;
      delta: number;
      reason: string;
      timestamp: string;
    }) => {
      console.log('[useRealtimeSync Mobile] 💰 Tokens updated event received:', {
        newBalance: data.newBalance,
        previousBalance: data.previousBalance,
        delta: data.delta,
        reason: data.reason,
      });

      queryClient.setQueryData(['user-profile'], (old: any) => (old ? { ...old, tokens: data.newBalance } : old));

      const homeStore = useHomeStore.getState();
      if (homeStore.user) {
        homeStore.patchUser({ tokens: data.newBalance });
        console.log('[useRealtimeSync Mobile] ✅ homeStore.user updated with tokens:', data.newBalance);
      } else {
        console.log('[useRealtimeSync Mobile] ⚠️ homeStore.user is null, skipping update');
      }

      const authStore = useAuthStore.getState();
      if (authStore.user) {
        const previousTokens = authStore.user.tokens;
        authStore.updateUser({ ...authStore.user, tokens: data.newBalance });
        console.log('[useRealtimeSync Mobile] ✅ authStore.user updated! Previous:', previousTokens, '→ New:', data.newBalance);
      } else {
        console.log('[useRealtimeSync Mobile] ⚠️ authStore.user is null, skipping update');
      }

      useUserProfileStore.setState((prev) => ({
        profile: prev.profile ? { ...prev.profile, tokens: data.newBalance } : prev.profile,
      }));

      const tokensStore = useTokensStore.getState();
      tokensStore.setBalanceValue(data.newBalance);
      tokensStore.updateTokenDelta(data.delta);
      tokensStore.invalidateHistory();

      // Invalidar queries de historial y ledger
      queryClient.invalidateQueries({ queryKey: ['token-history'] });
      queryClient.invalidateQueries({ queryKey: ['token-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['token-balance'] });

      if (data.delta > 0) {
        Toast.show({
          type: 'success',
          text1: 'Tokens recibidos',
          text2: `+${data.delta} tokens`,
          position: 'top',
          visibilityTime: 3000,
        });
      }
    };

    const handleSubscriptionUpdated = (data: {
      previousSubscription: string;
      newSubscription: string;
      isPremium: boolean;
      premiumSince?: string;
      premiumExpires?: string;
      timestamp: string;
    }) => {
      const nextPlan = data.isPremium ? 'Premium' : 'Free';

      const homeStore = useHomeStore.getState();
      if (homeStore.user) {
        homeStore.patchUser({ plan: nextPlan });
      }

      useUserProfileStore.setState((prev) => ({
        profile: prev.profile
          ? {
              ...prev.profile,
              plan: nextPlan,
              premium_since: data.premiumSince,
              premium_expires: data.premiumExpires,
            }
          : prev.profile,
      }));

      const profileStore = useUserProfileStore.getState();
      profileStore.setShowPremiumModal(true);

      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.updateUser({
          ...authStore.user,
          plan: nextPlan,
          role: data.isPremium ? 'PREMIUM' : 'USER',
        });
      }

      queryClient.setQueryData(['user-profile'], (old: any) =>
        old
          ? {
              ...old,
              app_tier: data.newSubscription,
              premium_since: data.premiumSince,
              premium_expires: data.premiumExpires,
            }
          : old,
      );

      Toast.show({
        type: 'success',
        text1: data.isPremium ? 'Has recibido Premium' : 'Plan actualizado',
        text2: data.isPremium ? 'Disfruta de los beneficios exclusivos' : 'Tu suscripción volvió a Free',
        position: 'top',
        visibilityTime: 4000,
      });
    };

    const handleProfileUpdated = (data: { profile: any; timestamp: string }) => {
      queryClient.setQueryData(['user-profile'], data.profile);
      useUserProfileStore.setState({ profile: data.profile });

      if (data.profile?.tokens !== undefined) {
        const homeStore = useHomeStore.getState();
        if (homeStore.user) {
          homeStore.patchUser({ tokens: data.profile.tokens });
        }
      }
    };

    const handleWeeklyProgressUpdated = (data: WeeklyProgressUpdatedPayload) => {
      const percentage = data.percentage ?? (data.goal ? Math.min(100, Math.round((data.current / data.goal) * 100)) : 0);
      const progress = {
        goal: data.goal ?? 0,
        current: data.current ?? 0,
        percentage,
      };

      const homeStore = useHomeStore.getState();
      homeStore.updateWeeklyProgress(progress);
      useProgressStore.getState().setWeeklyWorkouts(progress.current);
    };

    const handleAttendanceRecorded = (data: AttendanceRecordedPayload) => {
      const homeStore = useHomeStore.getState();
      if (homeStore.user) {
        homeStore.patchUser({
          tokens: data.newBalance ?? homeStore.user.tokens,
          streak: data.streak ?? homeStore.user.streak,
        });
      }

      const progressStore = useProgressStore.getState();
      progressStore.setCurrentStreak(data.streak ?? progressStore.currentStreak);

      if (data.tokensAwarded) {
        Toast.show({
          type: 'info',
          text1: 'Asistencia registrada',
          text2: `+${data.tokensAwarded} tokens por entrenar`,
          position: 'top',
          visibilityTime: 2500,
        });
      }
    };

    const handlePresenceUpdated = (data: { gymId: number; currentCount: number; timestamp: string }) => {
      console.log(`[useRealtimeSync] 👥 Presencia en gym ${data.gymId}: ${data.currentCount}`);

      // Actualizar dato en gym detail si está en caché
      queryClient.setQueryData(['gym-detail', data.gymId], (old: any) =>
        old ? { ...old, currentPresence: data.currentCount } : old
      );

      // Solo log; el hook useGymPresence maneja contadores finos localmente
      // NO invalidar queries pesadas de listas/mapas
    };

    /**
     * Handler de actualizaciones de reviews
     * Invalida queries granulares por gymId (NO listas/mapas globales)
     * NO muestra toasts (ya lo hace useReviewUpdates en GymDetail)
     */
    const handleReviewsUpdated = (data: {
      gymId: number;
      averageRating?: number;
      totalReviews?: number;
      timestamp?: string;
    }) => {
      console.log('[useRealtimeSync] 📝 Reviews updated:', data);

      // Solo invalidar queries específicas del gym afectado
      queryClient.invalidateQueries({ queryKey: ['gym-reviews', data.gymId] });
      queryClient.invalidateQueries({ queryKey: ['gym-rating-stats', data.gymId] });
      queryClient.invalidateQueries({ queryKey: ['gym-detail', data.gymId] });

      // NO invalidar listas/mapas completos (costoso)
      // NO mostrar toasts (ya lo hace useReviewUpdates en GymDetail)
    };

    /**
     * Handler de hito de racha alcanzado
     * Actualiza stores y muestra toast celebratorio
     */
    const handleStreakMilestone = (data: {
      milestone: number;
      currentStreak: number;
      message: string;
    }) => {
      console.log('[useRealtimeSync] 🎉 Streak milestone:', data);

      // Usar valor del backend, NO asumir
      const homeStore = useHomeStore.getState();
      if (homeStore.user) {
        homeStore.patchUser({ streak: data.currentStreak });
      }

      const progressStore = useProgressStore.getState();
      progressStore.setCurrentStreak(data.currentStreak);

      Toast.show({
        type: 'success',
        text1: '🎉 ¡Hito alcanzado!',
        text2: data.message || `${data.milestone} días consecutivos`,
        position: 'top',
        visibilityTime: 5000,
      });
    };

    /**
     * Handler de racha perdida
     * Resetea streak y muestra toast motivacional
     */
    const handleStreakLost = (data: {
      previousStreak: number;
      longestStreak: number;
      message: string;
      timestamp: string;
      currentStreak?: number;
    }) => {
      console.log('[useRealtimeSync] 😢 Streak lost:', data);

      // Resetear usando valor del backend (usualmente 0)
      const newStreak = data.currentStreak ?? 0;

      const homeStore = useHomeStore.getState();
      if (homeStore.user) {
        homeStore.patchUser({ streak: newStreak });
      }

      const progressStore = useProgressStore.getState();
      progressStore.setCurrentStreak(newStreak);

      Toast.show({
        type: 'error',
        text1: '😢 Racha perdida',
        text2: `Tenías ${data.previousStreak} días. ¡Empezá de nuevo!`,
        position: 'top',
        visibilityTime: 4000,
      });
    };

    /**
     * Handler de nueva asistencia
     * Invalida queries y reutiliza handleTokensUpdated si otorga tokens
     */
    const handleAssistanceNew = (data: {
      assistanceId: number;
      userId: number;
      gymId: number;
      tokensAwarded?: number;
      timestamp: string;
    }) => {
      console.log('[useRealtimeSync] 🏋️ New check-in:', data);

      // Invalidar asistencias
      queryClient.invalidateQueries({ queryKey: ['assistance'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });

      // Si otorga tokens, delegar a handler de tokens existente
      if (data.tokensAwarded) {
        const authStore = useAuthStore.getState();
        const tokensStore = useTokensStore.getState();

        // Fallback: authStore.user?.tokens -> tokensStore.balance?.available -> 0
        const currentBalance = authStore.user?.tokens ?? tokensStore.balance?.available ?? 0;

        handleTokensUpdated({
          newBalance: currentBalance + data.tokensAwarded,
          previousBalance: currentBalance,
          delta: data.tokensAwarded,
          reason: 'check-in',
          timestamp: data.timestamp || new Date().toISOString(),
        });
      }
    };

    /**
     * Handler de asistencia cancelada
     * Invalida queries y notifica al usuario
     */
    const handleAssistanceCancelled = (data: {
      assistanceId: number;
      reason?: string;
      timestamp: string;
    }) => {
      console.log('[useRealtimeSync] ❌ Assistance cancelled:', data);

      queryClient.invalidateQueries({ queryKey: ['assistance'] });

      Toast.show({
        type: 'error',
        text1: 'Check-in cancelado',
        text2: data.reason || 'Asistencia removida',
        position: 'top',
        visibilityTime: 3000,
      });
    };

    /**
     * Handler de anuncios del sistema
     * Muestra toast según prioridad con deduplicación
     */
    const handleSystemAnnouncement = (data: {
      id?: string;
      message: string;
      priority: 'LOW' | 'NORMAL' | 'HIGH';
      timestamp: string;
    }) => {
      console.log('[useRealtimeSync] 📢 System announcement:', data);

      // Deduplicación: evitar mostrar el mismo anuncio en reconexiones
      if (data.id && lastAnnouncementId.current === data.id) {
        console.log('[useRealtimeSync] ⚠️ Duplicate announcement ignored:', data.id);
        return;
      }
      lastAnnouncementId.current = data.id ?? null;

      const toastType = data.priority === 'HIGH' ? 'error' :
                        data.priority === 'NORMAL' ? 'info' : 'success';

      const visibilityTime = data.priority === 'HIGH' ? 8000 :
                             data.priority === 'NORMAL' ? 5000 : 3000;

      Toast.show({
        type: toastType,
        text1: '📢 Anuncio del sistema',
        text2: data.message,
        position: 'top',
        visibilityTime,
      });

      // Opcional: invalidar feed de anuncios si existe
      queryClient.invalidateQueries({ queryKey: ['system-announcements'] });
    };

    /**
     * Handler de nuevo desafío diario
     * Invalida queries de challenges y notifica
     */
    const handleDailyChallengeNew = (data: {
      challengeId: number;
      title: string;
      description: string;
      timestamp: string;
    }) => {
      console.log('[useRealtimeSync] 🎯 New daily challenge:', data);

      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['active-challenges'] });

      Toast.show({
        type: 'info',
        text1: '🎯 Nuevo desafío diario',
        text2: data.title,
        position: 'top',
        visibilityTime: 4000,
      });
    };

    /**
     * Handler de progreso de desafío
     * Actualiza progreso sin toast (solo invalidación)
     */
    const handleUserChallengeProgress = (data: {
      challengeId: number;
      currentProgress: number;
      targetValue: number;
      timestamp: string;
    }) => {
      console.log('[useRealtimeSync] 📊 Challenge progress:', data);

      // Solo invalidar ese desafío específico
      queryClient.invalidateQueries({ queryKey: ['challenge-progress', data.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
    };

    /**
     * Handler de desafío completado
     * Reutiliza handleTokensUpdated si hay recompensa
     */
    const handleUserChallengeCompleted = (data: {
      challengeId: number;
      currentProgress: number;
      targetValue: number;
      tokensAwarded?: number;
      timestamp: string;
    }) => {
      console.log('[useRealtimeSync] ✅ Challenge completed:', data);

      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });

      // Reusar handler de tokens si hay recompensa
      if (data.tokensAwarded) {
        const authStore = useAuthStore.getState();
        const tokensStore = useTokensStore.getState();

        // Fallback: authStore.user?.tokens -> tokensStore.balance?.available -> 0
        const currentBalance = authStore.user?.tokens ?? tokensStore.balance?.available ?? 0;

        handleTokensUpdated({
          newBalance: currentBalance + data.tokensAwarded,
          previousBalance: currentBalance,
          delta: data.tokensAwarded,
          reason: 'daily-challenge-completed',
          timestamp: data.timestamp || new Date().toISOString(),
        });
      }

      Toast.show({
        type: 'success',
        text1: '🏆 ¡Desafío completado!',
        text2: `Progreso: ${data.currentProgress}/${data.targetValue}`,
        position: 'top',
        visibilityTime: 5000,
      });
    };

    /**
     * Handler de logros desbloqueados
     * Invalida queries y muestra notificación
     */
    const handleAchievementUnlocked = (data: AchievementUnlockedPayload) => {
      console.log('[useRealtimeSync] 🏆 Achievement unlocked:', data);

      // Invalidar queries de logros
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['achievements-progress'] });

      // Notificar al usuario
      Toast.show({
        type: 'success',
        text1: '¡Logro desbloqueado!',
        text2: `${data.name} (+${data.points} puntos)`,
        position: 'top',
        visibilityTime: 4000,
      });
    };

    /**
     * Handler de recompensas obtenidas
     * Invalida queries de inventario y recompensas
     */
    const handleRewardEarned = (data: RewardEarnedPayload) => {
      console.log('[useRealtimeSync] 🎁 Reward earned:', data);

      // Invalidar queries de recompensas e inventario
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['available-rewards'] });

      // Notificar al usuario
      Toast.show({
        type: 'success',
        text1: '¡Recompensa obtenida!',
        text2: data.name,
        position: 'top',
        visibilityTime: 4000,
      });
    };

    /**
     * Handler de actualizaciones de gimnasios
     * Invalida queries de mapa, lista y detalle
     */
    const handleGymsUpdated = (data: {
      action: 'created' | 'updated' | 'deleted';
      gym?: any;
      gymId?: number;
      timestamp: string;
    }) => {
      console.log('[useRealtimeSync] 🏋️ Gyms updated:', data);

      // Invalidar queries de gimnasios
      queryClient.invalidateQueries({ queryKey: ['nearby-gyms'] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });

      // Si es un gym específico, invalidar su detalle
      if (data.gymId) {
        queryClient.invalidateQueries({ queryKey: ['gym', data.gymId] });
        queryClient.invalidateQueries({ queryKey: ['gym-detail', data.gymId] });
      }

      // Mostrar notificación solo si es relevante
      if (data.action === 'created' && data.gym) {
        Toast.show({
          type: 'info',
          text1: 'Nuevo gimnasio disponible',
          text2: data.gym.name || 'Revisa el mapa',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    };

    /**
     * Handler de actualizaciones de datos globales
     * (ejercicios, plantillas de rutinas)
     */
    const handleDataUpdated = (eventName: string) => (data: {
      action: 'created' | 'updated' | 'deleted';
      timestamp: string;
    }) => {
      console.log(`[useRealtimeSync] Data updated (${eventName}):`, data);

      // Invalidar queries según el tipo de datos
      if (eventName.includes('exercises')) {
        queryClient.invalidateQueries({ queryKey: ['exercises'] });
      } else if (eventName.includes('routine-templates')) {
        queryClient.invalidateQueries({ queryKey: ['routine-templates'] });
      } else if (eventName.includes('achievements')) {
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
      } else if (eventName.includes('rewards')) {
        queryClient.invalidateQueries({ queryKey: ['rewards'] });
      }
    };

    // Crear referencias estables para eventos de datos
    // IMPORTANTE: Guardar las funciones retornadas para usar las MISMAS referencias en on/off
    // Esto evita fugas de listeners (cada llamada a handleDataUpdated crea una función nueva)
    const handleExercisesUpdated = handleDataUpdated('exercises');
    const handleRoutineTemplatesUpdated = handleDataUpdated('routine-templates');
    const handleAchievementsDataUpdated = handleDataUpdated('achievements');
    const handleRewardsDataUpdated = handleDataUpdated('rewards');

    websocketService.subscribeToTokens();
    websocketService.subscribeToProfile();

    websocketService.on('user:tokens:updated', handleTokensUpdated);
    websocketService.on('user:subscription:updated', handleSubscriptionUpdated);
    websocketService.on('user:profile:updated', handleProfileUpdated);
    websocketService.on(WS_EVENTS.PROGRESS_WEEKLY_UPDATED, handleWeeklyProgressUpdated);
    websocketService.on(WS_EVENTS.ATTENDANCE_RECORDED, handleAttendanceRecorded);
    websocketService.on(WS_EVENTS.PRESENCE_UPDATED, handlePresenceUpdated);

    // Eventos de reviews
    websocketService.on(WS_EVENTS.REVIEW_NEW, handleReviewsUpdated);
    websocketService.on(WS_EVENTS.REVIEW_UPDATED, handleReviewsUpdated);
    websocketService.on(WS_EVENTS.GYM_RATING_UPDATED, handleReviewsUpdated);
    websocketService.on(WS_EVENTS.REVIEW_HELPFUL_UPDATED, handleReviewsUpdated);

    // Eventos de streak
    websocketService.on(WS_EVENTS.STREAK_MILESTONE, handleStreakMilestone);
    websocketService.on(WS_EVENTS.STREAK_LOST, handleStreakLost);

    // Eventos de asistencia
    websocketService.on(WS_EVENTS.ASSISTANCE_NEW, handleAssistanceNew);
    websocketService.on(WS_EVENTS.ASSISTANCE_CANCELLED, handleAssistanceCancelled);

    // Eventos del sistema
    websocketService.on(WS_EVENTS.SYSTEM_ANNOUNCEMENT, handleSystemAnnouncement);

    // Eventos de daily challenges
    websocketService.on(WS_EVENTS.DAILY_CHALLENGE_NEW, handleDailyChallengeNew);
    websocketService.on(WS_EVENTS.USER_CHALLENGE_PROGRESS, handleUserChallengeProgress);
    websocketService.on(WS_EVENTS.USER_CHALLENGE_COMPLETED, handleUserChallengeCompleted);

    // Nuevos eventos de gamificación
    websocketService.on(WS_EVENTS.ACHIEVEMENT_UNLOCKED, handleAchievementUnlocked);
    websocketService.on(WS_EVENTS.REWARD_EARNED, handleRewardEarned);

    // Eventos de gimnasios y datos globales
    websocketService.on('data:gyms:updated', handleGymsUpdated);
    websocketService.on('data:exercises:updated', handleExercisesUpdated);
    websocketService.on('data:routine-templates:updated', handleRoutineTemplatesUpdated);
    websocketService.on('data:achievements:updated', handleAchievementsDataUpdated);
    websocketService.on('data:rewards:updated', handleRewardsDataUpdated);

    return () => {
      websocketService.off('user:tokens:updated', handleTokensUpdated);
      websocketService.off('user:subscription:updated', handleSubscriptionUpdated);
      websocketService.off('user:profile:updated', handleProfileUpdated);
      websocketService.off(WS_EVENTS.PROGRESS_WEEKLY_UPDATED, handleWeeklyProgressUpdated);
      websocketService.off(WS_EVENTS.ATTENDANCE_RECORDED, handleAttendanceRecorded);
      websocketService.off(WS_EVENTS.PRESENCE_UPDATED, handlePresenceUpdated);

      // Cleanup eventos de reviews
      websocketService.off(WS_EVENTS.REVIEW_NEW, handleReviewsUpdated);
      websocketService.off(WS_EVENTS.REVIEW_UPDATED, handleReviewsUpdated);
      websocketService.off(WS_EVENTS.GYM_RATING_UPDATED, handleReviewsUpdated);
      websocketService.off(WS_EVENTS.REVIEW_HELPFUL_UPDATED, handleReviewsUpdated);

      // Cleanup eventos de streak
      websocketService.off(WS_EVENTS.STREAK_MILESTONE, handleStreakMilestone);
      websocketService.off(WS_EVENTS.STREAK_LOST, handleStreakLost);

      // Cleanup eventos de asistencia
      websocketService.off(WS_EVENTS.ASSISTANCE_NEW, handleAssistanceNew);
      websocketService.off(WS_EVENTS.ASSISTANCE_CANCELLED, handleAssistanceCancelled);

      // Cleanup eventos del sistema
      websocketService.off(WS_EVENTS.SYSTEM_ANNOUNCEMENT, handleSystemAnnouncement);

      // Cleanup eventos de daily challenges
      websocketService.off(WS_EVENTS.DAILY_CHALLENGE_NEW, handleDailyChallengeNew);
      websocketService.off(WS_EVENTS.USER_CHALLENGE_PROGRESS, handleUserChallengeProgress);
      websocketService.off(WS_EVENTS.USER_CHALLENGE_COMPLETED, handleUserChallengeCompleted);

      // Cleanup nuevos eventos
      websocketService.off(WS_EVENTS.ACHIEVEMENT_UNLOCKED, handleAchievementUnlocked);
      websocketService.off(WS_EVENTS.REWARD_EARNED, handleRewardEarned);
      websocketService.off('data:gyms:updated', handleGymsUpdated);
      websocketService.off('data:exercises:updated', handleExercisesUpdated);
      websocketService.off('data:routine-templates:updated', handleRoutineTemplatesUpdated);
      websocketService.off('data:achievements:updated', handleAchievementsDataUpdated);
      websocketService.off('data:rewards:updated', handleRewardsDataUpdated);

      websocketService.unsubscribeFromTokens();
      websocketService.unsubscribeFromProfile();
    };
  }, [connected, queryClient]);
}

export function useWebSocketStatus() {
  const [isConnected, setIsConnected] = React.useState(websocketService.isConnected());

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return isConnected;
}



