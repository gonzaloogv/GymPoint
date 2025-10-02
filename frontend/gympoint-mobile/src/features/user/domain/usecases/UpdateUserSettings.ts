import { UserRepository } from '../repositories/UserRepository';
import { NotificationSettings } from '../entities/NotificationSettings';

export class UpdateUserSettings {
  constructor(private repository: UserRepository) {}

  async updateNotifications(settings: NotificationSettings): Promise<void> {
    return this.repository.updateNotificationSettings(settings);
  }

  async updateLocation(shareLocation: boolean): Promise<void> {
    return this.repository.updateLocationSettings(shareLocation);
  }
}

