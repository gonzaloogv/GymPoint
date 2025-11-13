import { UserProfile } from '../entities/UserProfile';
import { UserStats } from '../entities/UserStats';
import { NotificationSettings } from '../entities/NotificationSettings';
import { Frequency } from '../entities/Frequency';

export interface UserRepository {
  getUserProfile(): Promise<UserProfile>;
  getUserStats(): Promise<UserStats>;
  getNotificationSettings(): Promise<NotificationSettings>;
  updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings>;
  updateLocationSettings(shareLocation: boolean): Promise<void>;
  upgradeToPremium(): Promise<UserProfile>;
  getWeeklyFrequency(): Promise<Frequency>;
  updateWeeklyFrequency(goal: number): Promise<Frequency>;
}
