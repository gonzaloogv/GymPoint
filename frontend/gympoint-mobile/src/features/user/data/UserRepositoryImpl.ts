import { UserRepository } from '../domain/repositories/UserRepository';
import { UserProfile } from '../domain/entities/UserProfile';
import { UserStats } from '../domain/entities/UserStats';
import { NotificationSettings } from '../domain/entities/NotificationSettings';
import { UserProfileDTO, UserStatsDTO } from './dto/UserProfileDTO';
import {
  mapUserProfileDTOToEntity,
  mapUserStatsDTOToEntity,
} from './mappers/userProfile.mapper';

export class UserRepositoryImpl implements UserRepository {
  private mockProfile: UserProfileDTO = {
    id_user: 1,
    name: 'María Gómez',
    email: 'maria@gympoint.com',
    role: 'USER',
    tokens: 150,
    plan: 'Free',
    streak: 7,
  };

  private mockStats: UserStatsDTO = {
    totalCheckIns: 42,
    longestStreak: 12,
    favoriteGym: 'PowerZone Centro',
    monthlyVisits: 15,
  };

  async getUserProfile(): Promise<UserProfile> {
    return mapUserProfileDTOToEntity(this.mockProfile);
  }

  async getUserStats(): Promise<UserStats> {
    return mapUserStatsDTOToEntity(this.mockStats);
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<void> {
    // Simular guardado
    console.log('Notification settings updated:', settings);
  }

  async updateLocationSettings(shareLocation: boolean): Promise<void> {
    // Simular guardado
    console.log('Location settings updated:', shareLocation);
  }

  async upgradeToPremium(): Promise<UserProfile> {
    // Simular upgrade
    this.mockProfile.plan = 'Premium';
    this.mockProfile.role = 'PREMIUM';
    return mapUserProfileDTOToEntity(this.mockProfile);
  }
}
