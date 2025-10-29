import { useState, useEffect } from 'react';
import { AssistanceRemote } from '../../data/assistance.remote';

export interface TodayCheckInStatus {
  hasCheckedIn: boolean;
  assistanceDetails: {
    id_assistance: number;
    id_gym: number;
    entry_time: string;
    gym_name: string | null;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para verificar si el usuario ya hizo check-in hoy
 */
export function useTodayCheckInStatus(): TodayCheckInStatus {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [assistanceDetails, setAssistanceDetails] = useState<TodayCheckInStatus['assistanceDetails']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AssistanceRemote.getTodayStatus();

      setHasCheckedIn(response.has_checked_in_today);
      setAssistanceDetails(response.assistance);
    } catch (err: any) {
      console.error('❌ [useTodayCheckInStatus] Error al verificar estado:', err);
      setError(err.message || 'Error al verificar el estado del check-in');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    hasCheckedIn,
    assistanceDetails,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
