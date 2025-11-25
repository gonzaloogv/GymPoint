import { useState, useEffect, useCallback } from 'react';
import { SubscriptionRemote } from '../../data/subscription.remote';
import { SubscriptionMapper } from '../../data/mappers/subscription.mapper';
import { SubscriptionWithStatus, SubscriptionUtils } from '../../domain/entities/Subscription';
import { useSubscriptionActions, SubscriptionDates } from './useSubscriptionActions';

export interface GymSubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: SubscriptionWithStatus | null;
  trialAllowed: boolean;
  trialUsed: boolean;
  canSubscribe: boolean;
  canUseTrial: boolean;
  isLoading: boolean;
  activeSubscriptionCount: number;
  reachedLimit: boolean;
}

export interface UseGymSubscriptionStatusResult extends GymSubscriptionStatus {
  refetch: () => Promise<void>;
  subscribe: (plan: string, dates?: SubscriptionDates) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  isProcessing: boolean;
}

/**
 * Hook para manejar el estado de suscripción de un gimnasio específico
 */
export function useGymSubscriptionStatus(
  gymId: number,
  gymName: string,
  trialAllowed: boolean = false,
): UseGymSubscriptionStatusResult {
  const [status, setStatus] = useState<GymSubscriptionStatus>({
    hasActiveSubscription: false,
    subscription: null,
    trialAllowed,
    trialUsed: false,
    canSubscribe: true,
    canUseTrial: false,
    isLoading: true,
    activeSubscriptionCount: 0,
    reachedLimit: false,
  });

  const { subscribe: subscribeAction, unsubscribe: unsubscribeAction, isSubscribing, isUnsubscribing } =
    useSubscriptionActions();

  const fetchStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await SubscriptionRemote.getActiveSubscriptions();
      const subscriptions = SubscriptionMapper.toDomainList(response.data);
      const subscriptionsWithStatus = subscriptions.map(SubscriptionUtils.withStatus);

      // Buscar suscripción para este gimnasio
      const gymSubscription = subscriptionsWithStatus.find((sub) => sub.gymId === gymId);

      // Contar suscripciones activas
      const activeCount = subscriptionsWithStatus.filter((sub) => sub.status === 'ACTIVE').length;
      const reachedLimit = activeCount >= 2;

      // Determinar si puede usar trial
      const trialUsed = gymSubscription?.trialUsed || false;
      const canUseTrial = trialAllowed && !trialUsed && !gymSubscription?.isActive;

      const newStatus = {
        hasActiveSubscription: gymSubscription?.status === 'ACTIVE' || false,
        subscription: gymSubscription || null,
        trialAllowed,
        trialUsed,
        canSubscribe: !reachedLimit || gymSubscription?.status === 'ACTIVE',
        canUseTrial,
        isLoading: false,
        activeSubscriptionCount: activeCount,
        reachedLimit,
      };

      setStatus(newStatus);
    } catch (err) {
      console.error('❌ [useGymSubscriptionStatus] Error fetching subscription status:', err);
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [gymId, trialAllowed]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const subscribe = async (plan: string, dates?: SubscriptionDates): Promise<boolean> => {
    const success = await subscribeAction(gymId, plan as any, dates);
    if (success) {
      await fetchStatus();
    }
    return success;
  };

  const unsubscribe = async (): Promise<boolean> => {
    const success = await unsubscribeAction(gymId, gymName);
    if (success) {
      await fetchStatus();
    }
    return success;
  };

  return {
    ...status,
    refetch: fetchStatus,
    subscribe,
    unsubscribe,
    isProcessing: isSubscribing || isUnsubscribing,
  };
}
