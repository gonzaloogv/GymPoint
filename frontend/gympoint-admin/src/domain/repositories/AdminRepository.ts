import { Stats, Activity, User, UserDetail, Transaction, PaginatedResponse, RewardStatsData, AdminProfile } from '../entities';


export interface ListUsersParams {
  page?: number;
  limit?: number;
  subscription?: 'FREE' | 'PREMIUM';
  search?: string;
  status?: 'active' | 'revoked';
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface TransactionParams {
  user_id?: number;
  limit?: number;
  page?: number;
}

export interface AdminRepository {
  // Admin Profile
  getAdminProfile(): Promise<AdminProfile>;

  // Stats
  getStats(): Promise<Stats>;
  getActivity(days?: number): Promise<Activity>;

  // Users
  listUsers(params?: ListUsersParams): Promise<PaginatedResponse<User>>;
  searchUserByEmail(email: string): Promise<UserDetail>;
  deactivateUser(accountId: number): Promise<void>;
  activateUser(accountId: number): Promise<void>;
  grantTokens(userId: number, delta: number, reason?: string): Promise<void>;
  updateSubscription(userId: number, subscription: 'FREE' | 'PREMIUM'): Promise<void>;

  // Transactions
  getTransactions(params?: TransactionParams): Promise<PaginatedResponse<Transaction>>;

  // Rewards
  getGlobalRewardStats(from: string, to: string): Promise<RewardStatsData>;
  getGymRewardStats(gymId: number, from: string, to: string): Promise<RewardStatsData>;
}
