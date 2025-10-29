import { useState, useEffect, useCallback } from 'react';
import { SubscriptionRemote } from '../../data/subscription.remote';
import { SubscriptionMapper } from '../../data/mappers/subscription.mapper';
import { Subscription, SubscriptionUtils, SubscriptionWithStatus } from '../../domain/entities/Subscription';
import Toast from 'react-native-toast-message';

export interface UseSubscriptionsResult {
  subscriptions: SubscriptionWithStatus[];
  activeSubscriptions: SubscriptionWithStatus[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  canSubscribeToMore: boolean; // Límite de 2 gimnasios
  activeCount: number;
}

/**
 * Hook para manejar las suscripciones activas del usuario
 */
export function useSubscriptions(): UseSubscriptionsResult {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await SubscriptionRemote.getActiveSubscriptions();
      const domainSubscriptions = SubscriptionMapper.toDomainList(response.data);
      const subscriptionsWithStatus = domainSubscriptions.map(SubscriptionUtils.withStatus);

      setSubscriptions(subscriptionsWithStatus);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Error al cargar suscripciones';
      setError(errorMessage);
      console.error('Error fetching subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'ACTIVE');
  const activeCount = activeSubscriptions.length;
  const canSubscribeToMore = activeCount < 2; // Límite de 2 gimnasios

  return {
    subscriptions,
    activeSubscriptions,
    isLoading,
    error,
    refetch: fetchSubscriptions,
    canSubscribeToMore,
    activeCount,
  };
}
