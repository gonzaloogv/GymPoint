/**
 * features/user/index.ts
 * Barrel export para el módulo de Usuario
 */

// Screens
export { default as UserProfileScreen } from './presentation/ui/screens/UserProfileScreen';
export { NotificationSettingsScreen } from './presentation/ui/screens/NotificationSettingsScreen';

// Hooks
export { useNotificationSettings } from './presentation/hooks/useNotificationSettings';

// Componentes individuales (por si necesitas usarlos por separado)
export { ProfileHeader } from './presentation/ui/components/ProfileHeader';
export { PremiumAlert } from './presentation/ui/components/PremiumAlert';
export { PremiumBadge } from './presentation/ui/components/PremiumBadge';
export { StatsSection } from './presentation/ui/components/StatsSection';
export { NotificationSettings } from './presentation/ui/components/NotificationSettings';
export { LocationSettings } from './presentation/ui/components/LocationSettings';
export { SettingsCard } from './presentation/ui/components/SettingsCard';
export { MenuOptions } from './presentation/ui/components/MenuOptions';
export { PremiumBenefitsCard } from './presentation/ui/components/PremiumBenefitsCard';
export { LegalFooter } from './presentation/ui/components/LegalFooter';

// Tipos
export type {
  UserProfile,
  UserStats,
  NotificationSettings as NotificationSettingsType,
  UserProfileScreenProps,
} from './types/userTypes';

// Estilos (por si necesitas extenderlos)
export * from './presentation/ui/styles/ProfileStyles';
