import {
  AdminRepository,
  Stats,
  Activity,
  User,
  UserDetail,
  Transaction,
  PaginatedResponse,
  RewardStatsData,
  AdminProfile 
} from '@/domain';
import {
  mockAdminProfile,
  mockStats,
  mockActivity,
  mockUsersPaginated,
  mockUserDetail,
  mockTransactionsPaginated,
  mockRewardStats 
} from '../mock';

// Dummy interfaces to fix type errors
interface ListUsersParams {
  search?: string;
  subscription?: 'FREE' | 'PREMIUM';
  page?: number;
  limit?: number;
}
interface TransactionParams {
  page?: number;
  limit?: number;
}
export class AdminRepositoryMock implements AdminRepository {
  async getAdminProfile(): Promise<AdminProfile> {
    // Simular delay de red
    await this.delay(300);
    return mockAdminProfile;
  }

  async getStats(): Promise<Stats> {
    await this.delay(300);
    return mockStats;
  }

  async getActivity(days: number = 7): Promise<Activity> {
    await this.delay(300);
    return mockActivity;
  }

  async listUsers(params?: ListUsersParams): Promise<PaginatedResponse<User>> {
    await this.delay(300);

    let users = [...mockUsersPaginated.data!];

    // Filtrar por búsqueda
    if (params?.search) {
      const search = params.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.lastname.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    // Filtrar por suscripción
    if (params?.subscription) {
      users = users.filter((u) => u.subscription === params.subscription);
    }

    return {
      data: users,
      pagination: {
        total: users.length,
        page: params?.page || 1,
        limit: params?.limit || 20,
        total_pages: Math.ceil(users.length / (params?.limit || 20)),
      },
    };
  }

  async searchUserByEmail(email: string): Promise<UserDetail> {
    await this.delay(300);
    return mockUserDetail;
  }

  async deactivateUser(accountId: number): Promise<void> {
    await this.delay(300);
    console.log('Mock: Deactivating user', accountId);
  }

  async activateUser(accountId: number): Promise<void> {
    await this.delay(300);
    console.log('Mock: Activating user', accountId);
  }

  async grantTokens(userId: number, delta: number, reason?: string): Promise<void> {
    await this.delay(300);
    console.log('Mock: Granting tokens', { userId, delta, reason });
  }

  async updateSubscription(userId: number, subscription: 'FREE' | 'PREMIUM'): Promise<void> {
    await this.delay(300);
    console.log('Mock: Updating subscription', { userId, subscription });
  }

  async getTransactions(params?: TransactionParams): Promise<PaginatedResponse<Transaction>> {
    await this.delay(300);
    return mockTransactionsPaginated;
  }

  async getGlobalRewardStats(from: string, to: string): Promise<RewardStatsData> {
    console.log('MOCK: getGlobalRewardStats', { from, to });
    return mockRewardStats;
  }

  async getGymRewardStats(gymId: number, from: string, to: string): Promise<RewardStatsData> {
    console.log('MOCK: getGymRewardStats', { gymId, from, to });
    return mockRewardStats;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
