import { UserProfile } from '../entities/UserProfile';
import { UserStats } from '../entities/UserStats';
import { NotificationSettings } from '../entities/NotificationSettings';

export interface UserRepository {
  getUserProfile(): Promise<UserProfile>;
  getUserStats(): Promise<UserStats>;
  updateNotificationSettings(settings: NotificationSettings): Promise<void>;
  updateLocationSettings(shareLocation: boolean): Promise<void>;
  upgradeToPremium(): Promise<UserProfile>;
}

