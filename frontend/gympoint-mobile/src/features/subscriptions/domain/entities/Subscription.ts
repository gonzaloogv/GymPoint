/**
 * Subscription Domain Entity
 * Entidad de dominio para suscripciones de usuario a gimnasios
 */

export type SubscriptionPlan = 'MENSUAL' | 'SEMANAL' | 'ANUAL';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'TRIAL_USED' | 'INACTIVE';

export interface GymBasicInfo {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  profileImageUrl: string | null;
  trialAllowed: boolean;
}

export interface Subscription {
  id: number;
  userProfileId: number;
  gymId: number;
  plan: SubscriptionPlan;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  isActive: boolean;
  trialUsed: boolean;
  trialDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  gym?: GymBasicInfo;
}

export interface SubscriptionWithStatus extends Subscription {
  status: SubscriptionStatus;
  daysRemaining: number;
  isExpiringSoon: boolean; // < 7 días
}

/**
 * Utilidades para trabajar con suscripciones
 */
export const SubscriptionUtils = {
  /**
   * Calcular días restantes hasta el vencimiento
   */
  getDaysRemaining: (subscription: Subscription): number => {
    const now = new Date();
    const end = subscription.subscriptionEnd;
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  /**
   * Determinar el estado de la suscripción
   */
  getStatus: (subscription: Subscription): SubscriptionStatus => {
    if (!subscription.isActive) {
      return subscription.trialUsed ? 'TRIAL_USED' : 'INACTIVE';
    }

    const daysRemaining = SubscriptionUtils.getDaysRemaining(subscription);
    if (daysRemaining < 0) {
      return 'EXPIRED';
    }

    return 'ACTIVE';
  },

  /**
   * Verificar si la suscripción está por vencer
   */
  isExpiringSoon: (subscription: Subscription): boolean => {
    const daysRemaining = SubscriptionUtils.getDaysRemaining(subscription);
    return daysRemaining >= 0 && daysRemaining <= 7;
  },

  /**
   * Agregar información de estado a una suscripción
   */
  withStatus: (subscription: Subscription): SubscriptionWithStatus => ({
    ...subscription,
    status: SubscriptionUtils.getStatus(subscription),
    daysRemaining: SubscriptionUtils.getDaysRemaining(subscription),
    isExpiringSoon: SubscriptionUtils.isExpiringSoon(subscription),
  }),

  /**
   * Obtener texto descriptivo del plan
   */
  getPlanText: (plan: SubscriptionPlan): string => {
    const planMap: Record<SubscriptionPlan, string> = {
      MENSUAL: 'Mensual',
      SEMANAL: 'Semanal',
      ANUAL: 'Anual',
    };
    return planMap[plan];
  },

  /**
   * Obtener texto descriptivo del estado
   */
  getStatusText: (status: SubscriptionStatus): string => {
    const statusMap: Record<SubscriptionStatus, string> = {
      ACTIVE: 'Activa',
      EXPIRED: 'Vencida',
      TRIAL_USED: 'Prueba usada',
      INACTIVE: 'Inactiva',
    };
    return statusMap[status];
  },

  /**
   * Obtener color para el estado
   */
  getStatusColor: (status: SubscriptionStatus): string => {
    const colorMap: Record<SubscriptionStatus, string> = {
      ACTIVE: '#10b981', // green-500
      EXPIRED: '#ef4444', // red-500
      TRIAL_USED: '#f59e0b', // amber-500
      INACTIVE: '#6b7280', // gray-500
    };
    return colorMap[status];
  },
};
