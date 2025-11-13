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
} from '@root/shared/types/websocket-events.types';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { connected } = useWebSocketContext();

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

      useTokensStore.getState().setBalanceValue(data.newBalance);

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
      console.log('[useRealtimeSync] Presence updated:', data);
    };

    websocketService.subscribeToTokens();
    websocketService.subscribeToProfile();

    websocketService.on('user:tokens:updated', handleTokensUpdated);
    websocketService.on('user:subscription:updated', handleSubscriptionUpdated);
    websocketService.on('user:profile:updated', handleProfileUpdated);
    websocketService.on(WS_EVENTS.PROGRESS_WEEKLY_UPDATED, handleWeeklyProgressUpdated);
    websocketService.on(WS_EVENTS.ATTENDANCE_RECORDED, handleAttendanceRecorded);
    websocketService.on(WS_EVENTS.PRESENCE_UPDATED, handlePresenceUpdated);

    return () => {
      websocketService.off('user:tokens:updated', handleTokensUpdated);
      websocketService.off('user:subscription:updated', handleSubscriptionUpdated);
      websocketService.off('user:profile:updated', handleProfileUpdated);
      websocketService.off(WS_EVENTS.PROGRESS_WEEKLY_UPDATED, handleWeeklyProgressUpdated);
      websocketService.off(WS_EVENTS.ATTENDANCE_RECORDED, handleAttendanceRecorded);
      websocketService.off(WS_EVENTS.PRESENCE_UPDATED, handlePresenceUpdated);
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



