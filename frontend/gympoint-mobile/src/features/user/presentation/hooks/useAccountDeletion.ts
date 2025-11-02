import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { api } from '@shared/http/apiClient';

interface DeletionRequest {
  id_account: number;
  reason?: string;
  status: 'PENDING' | 'CANCELLED' | 'COMPLETED';
  scheduled_deletion_date?: string;
  requested_at: string;
  cancelled_at?: string;
  completed_at?: string;
  metadata?: any;
  can_cancel: boolean;
}

interface DeletionStatusResponse {
  request: DeletionRequest | null;
  has_active_request: boolean;
}

interface DeletionResponse {
  message: string;
  request: DeletionRequest;
}

export function useAccountDeletion() {
  const [loading, setLoading] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener estado de la solicitud de eliminación
  const fetchDeletionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<DeletionStatusResponse>('/api/users/me/deletion-request');

      setDeletionRequest(response.data.request);
      setHasActiveRequest(response.data.has_active_request);
    } catch (err: any) {
      console.error('Error fetching deletion status:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al obtener el estado de eliminación';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Solicitar eliminación de cuenta
  const requestDeletion = useCallback(async (reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      const payload = reason ? { reason } : undefined;
      const response = await api.delete<DeletionResponse>('/api/users/me', {
        data: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setDeletionRequest(response.data.request);
      setHasActiveRequest(true);

      Alert.alert(
        'Solicitud registrada',
        response.data.message || 'Tu cuenta será eliminada después del período de gracia de 7 días.',
        [{ text: 'Entendido' }]
      );
    } catch (err: any) {
      console.error('Error requesting deletion:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al solicitar eliminación';
      setError(errorMessage);

      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancelar solicitud de eliminación
  const cancelDeletion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete<DeletionResponse>('/api/users/me/deletion-request');

      setDeletionRequest(response.data.request);
      setHasActiveRequest(false);

      Alert.alert(
        'Solicitud cancelada',
        response.data.message || 'Tu cuenta permanecerá activa.',
        [{ text: 'Genial' }]
      );
    } catch (err: any) {
      console.error('Error cancelling deletion:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al cancelar eliminación';
      setError(errorMessage);

      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estado al montar el componente
  useEffect(() => {
    fetchDeletionStatus();
  }, [fetchDeletionStatus]);

  return {
    loading,
    deletionRequest,
    hasActiveRequest,
    error,
    requestDeletion,
    cancelDeletion,
    refreshStatus: fetchDeletionStatus,
  };
}
