import { useState } from 'react';
import { SubscriptionRemote } from '../../data/subscription.remote';
import { SubscriptionPlan } from '../../domain/entities/Subscription';
import Toast from 'react-native-toast-message';

export interface SubscriptionDates {
  subscription_start?: string; // ISO date (YYYY-MM-DD)
  subscription_end?: string;   // ISO date (YYYY-MM-DD)
}

export interface UseSubscriptionActionsResult {
  subscribe: (gymId: number, plan: SubscriptionPlan, dates?: SubscriptionDates) => Promise<boolean>;
  unsubscribe: (gymId: number, gymName: string) => Promise<boolean>;
  isSubscribing: boolean;
  isUnsubscribing: boolean;
}

/**
 * Hook para manejar acciones de suscripción/cancelación
 */
export function useSubscriptionActions(): UseSubscriptionActionsResult {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  /**
   * Suscribirse a un gimnasio
   * @param dates - Opcional: fechas manuales para pago externo (efectivo/transferencia)
   */
  const subscribe = async (gymId: number, plan: SubscriptionPlan, dates?: SubscriptionDates): Promise<boolean> => {
    setIsSubscribing(true);

    try {
      const response = await SubscriptionRemote.subscribe({
        id_gym: gymId,
        plan,
        ...dates, // Incluye subscription_start y subscription_end si se proporcionan
      });

      Toast.show({
        type: 'success',
        text1: '¡Suscripción exitosa!',
        text2: response.message || 'Ya puedes entrenar en este gimnasio',
        position: 'top',
      });

      return true;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorCode = errorData?.error?.code;
      const errorMessage = errorData?.error?.message || errorData?.message || 'Error al suscribirse';

      // Mensajes personalizados según el código de error
      let displayMessage = errorMessage;

      if (errorCode === 'VALIDATION_ERROR' || errorCode === 'ALTA_FAILED') {
        // Error de validación (límite de 2 gimnasios, etc.)
        displayMessage = errorMessage;
      } else if (errorCode === 'CONFLICT') {
        displayMessage = 'Ya tienes una suscripción activa en este gimnasio';
      }

      Toast.show({
        type: 'error',
        text1: 'Error al suscribirse',
        text2: displayMessage,
        position: 'top',
        visibilityTime: 5000,
      });

      console.error('Subscribe error:', err);
      return false;
    } finally {
      setIsSubscribing(false);
    }
  };

  /**
   * Cancelar suscripción a un gimnasio
   */
  const unsubscribe = async (gymId: number, gymName: string): Promise<boolean> => {
    setIsUnsubscribing(true);

    try {
      await SubscriptionRemote.unsubscribe({ id_gym: gymId });

      Toast.show({
        type: 'success',
        text1: 'Suscripción cancelada',
        text2: `Tu suscripción a ${gymName} ha sido cancelada`,
        position: 'top',
      });

      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Error al cancelar suscripción';

      Toast.show({
        type: 'error',
        text1: 'Error al cancelar',
        text2: errorMessage,
        position: 'top',
      });

      console.error('Unsubscribe error:', err);
      return false;
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return {
    subscribe,
    unsubscribe,
    isSubscribing,
    isUnsubscribing,
  };
}
