import React, { useEffect } from 'react';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { websocketService, REALTIME_ENABLED } from '../../data/api/websocket.service';
import { emitRealtimeToast } from '../utils/realtimeToast';
import type { UserSubscriptionChangedData, AdminStatsUpdatedData } from '../../data/dto/WebSocketEvents';
import type { GymRequestPayload } from '@shared/types/websocket-events.types';

const adminStatsKey: QueryKey = ['admin', 'stats'];
type GymRequestStatus = 'pending' | 'approved' | 'rejected';
const gymRequestKey = (status?: GymRequestStatus) => ['gym-requests', status] as const;

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!REALTIME_ENABLED) return;

    const token = localStorage.getItem('admin_token');
    if (!token) return;

    websocketService.connect().catch((error) => {
      console.error('[useRealtimeSync] Failed to connect:', error);
    });

    const hasGymRequestCache = (status?: GymRequestStatus) =>
      Boolean(queryClient.getQueryState(gymRequestKey(status)));

    const updateGymRequestList = (
      status: GymRequestStatus | undefined,
      updater: (current: any[]) => any[],
    ) => {
      if (!hasGymRequestCache(status)) return;
      queryClient.setQueryData<any[]>(gymRequestKey(status), (old = []) => updater(old));
    };

    const updateAdminStats = (updater: (current: any) => any) => {
      if (!queryClient.getQueryState(adminStatsKey)) return;
      queryClient.setQueryData(adminStatsKey, updater);
    };

    const handleGymRequestCreated = (data: GymRequestPayload) => {
      updateGymRequestList('pending', (old) => [data.gymRequest, ...old]);
      updateGymRequestList(undefined, (old) => [data.gymRequest, ...old]);
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
      emitRealtimeToast({
        title: 'Nueva solicitud recibida',
        description: data.gymRequest?.name ?? 'Revisa la bandeja de solicitudes',
        variant: 'info',
      });
    };

    const handleGymRequestApproved = (data: GymRequestPayload) => {
      updateGymRequestList('pending', (old) =>
        old.filter((req) => req.id_gym_request !== data.requestId),
      );
      updateGymRequestList(undefined, (old) =>
        old.map((req) =>
          req.id_gym_request === data.requestId
            ? { ...req, status: 'approved', id_gym: data.gymId }
            : req,
        ),
      );
      updateGymRequestList('approved', (old) => {
        if (old.some((req) => req.id_gym_request === data.requestId)) {
          return old;
        }
        return [
          data.gymRequest ?? { id_gym_request: data.requestId, status: 'approved', id_gym: data.gymId },
          ...old,
        ];
      });
      queryClient.setQueryData<any[]>(['gyms'], (old) => {
        if (!old || !data.gym) return old;
        if (old.some((gym) => gym.id_gym === data.gymId)) return old;
        return [data.gym, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
    };

    const handleGymRequestRejected = (data: GymRequestPayload) => {
      updateGymRequestList('pending', (old) =>
        old.filter((req) => req.id_gym_request !== data.requestId),
      );
      updateGymRequestList(undefined, (old) =>
        old.map((req) =>
          req.id_gym_request === data.requestId
            ? { ...req, status: 'rejected', rejection_reason: data.reason }
            : req,
        ),
      );
      updateGymRequestList('rejected', (old) => {
        if (old.some((req) => req.id_gym_request === data.requestId)) {
          return old;
        }
        return [data.gymRequest ?? { id_gym_request: data.requestId, status: 'rejected' }, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
    };

    const handleUserSubscriptionChanged = (data: UserSubscriptionChangedData) => {
      const userQueries = queryClient.getQueriesData<{ data?: any[] }>({ queryKey: ['admin', 'users'] });
      userQueries.forEach(([key, cached]) => {
        if (!cached?.data) return;
        const updatedUsers = cached.data.map((user) =>
          user.id_user_profile === data.userId || user.id_account === data.accountId
            ? { ...user, subscription: data.newSubscription }
            : user,
        );
        queryClient.setQueryData(key, { ...cached, data: updatedUsers });
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      updateAdminStats((old: any) => {
        if (!old) return old;
        if (data.isPremium && data.previousSubscription !== 'PREMIUM') {
          return { ...old, premiumUsers: (old.premiumUsers || 0) + 1 };
        }
        if (!data.isPremium && data.previousSubscription === 'PREMIUM') {
          return { ...old, premiumUsers: Math.max((old.premiumUsers || 1) - 1, 0) };
        }
        return old;
      });
    };

    const handleStatsUpdated = (data: AdminStatsUpdatedData) => {
      updateAdminStats(() => data.stats);
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    };

    websocketService.onGymRequestCreated(handleGymRequestCreated);
    websocketService.onGymRequestApproved(handleGymRequestApproved);
    websocketService.onGymRequestRejected(handleGymRequestRejected);
    websocketService.onUserSubscriptionChanged(handleUserSubscriptionChanged);
    websocketService.onStatsUpdated(handleStatsUpdated);

    return () => {
      websocketService.off('gym:request:created', handleGymRequestCreated);
      websocketService.off('gym:request:approved', handleGymRequestApproved);
      websocketService.off('gym:request:rejected', handleGymRequestRejected);
      websocketService.off('user:subscription:changed', handleUserSubscriptionChanged);
      websocketService.off('admin:stats:updated', handleStatsUpdated);
    };
  }, [queryClient]);
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
