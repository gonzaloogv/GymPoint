import { UserRepository } from '../domain/repositories/UserRepository';
import { UserProfile } from '../domain/entities/UserProfile';
import { UserStats } from '../domain/entities/UserStats';
import { NotificationSettings } from '../domain/entities/NotificationSettings';
import { UserRemote } from './user.remote';

export class UserRepositoryImpl implements UserRepository {
  async getUserProfile(): Promise<UserProfile> {
    try {
      const [userProfile, streak] = await Promise.all([
        UserRemote.getUserProfile(),
        UserRemote.getStreak().catch(() => ({ value: 0, last_value: 0 })),
      ]);

      const plan = userProfile.subscription === 'PREMIUM' ? 'Premium' : 'Free';

      return {
        id_user: userProfile.id_user,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role as 'USER' | 'PREMIUM',
        tokens: userProfile.tokens,
        plan,
        streak: streak.value,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const streak = await UserRemote.getStreak().catch(() => ({
        value: 0,
        last_value: 0,
      }));

      // TODO: Implementar endpoints para estas estadísticas
      return {
        totalCheckIns: 0, // TODO: GET /api/assistances/me/count
        longestStreak: streak.last_value,
        favoriteGym: '-', // TODO: GET /api/assistances/me/favorite-gym
        monthlyVisits: 0, // TODO: GET /api/assistances/me/monthly-count
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalCheckIns: 0,
        longestStreak: 0,
        favoriteGym: '-',
        monthlyVisits: 0,
      };
    }
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
    // TODO: Implementar endpoint real cuando exista
    // PUT /api/users/me/subscription { subscription: 'PREMIUM' }
    console.warn('upgradeToPremium not implemented - mock response');

    // Por ahora retornamos el perfil actual sin cambios
    return this.getUserProfile();
  }
}
