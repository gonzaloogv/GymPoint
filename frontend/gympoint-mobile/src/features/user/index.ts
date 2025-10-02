/**
 * features/user/index.ts
 * Barrel export para el módulo de Usuario
 */

// Screen principal
export { default as UserProfileScreen } from './screens/UserProfileScreen';

// Componentes individuales (por si necesitas usarlos por separado)
export { ProfileHeader } from './components/ProfileHeader';
export { PremiumAlert } from './components/PremiumAlert';
export { PremiumBadge } from './components/PremiumBadge';
export { StatsSection } from './components/StatsSection';
export { NotificationSettings } from './components/NotificationSettings';
export { LocationSettings } from './components/LocationSettings';
export { SettingsCard } from './components/SettingsCard';
export { MenuOptions } from './components/MenuOptions';
export { PremiumBenefitsCard } from './components/PremiumBenefitsCard';
export { LegalFooter } from './components/LegalFooter';

// Tipos
export type {
  UserProfile,
  UserStats,
  NotificationSettings as NotificationSettingsType,
  UserProfileScreenProps,
} from './types/UserTypes';

// Estilos (por si necesitas extenderlos)
export * from './styles/ProfileStyles';