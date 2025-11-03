/**
 * NotificationSettings Entity - Domain Layer
 * Representa la configuración de notificaciones del usuario
 * Alineado con backend: user_notification_settings table
 */
export interface NotificationSettings {
  // Metadata
  id: number;
  userId: number;

  // Notification type toggles
  remindersEnabled: boolean;
  achievementsEnabled: boolean;
  rewardsEnabled: boolean;
  gymUpdatesEnabled: boolean;
  paymentEnabled: boolean;
  socialEnabled: boolean;
  systemEnabled: boolean;
  challengeEnabled: boolean;

  // Global toggles
  pushEnabled: boolean;
  emailEnabled: boolean;

  // Quiet hours (24h format: "HH:MM:SS" or null)
  quietHoursStart: string | null;
  quietHoursEnd: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
