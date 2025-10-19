import {
  AdminRepository,
  Stats,
  Activity,
  User,
  UserDetail,
  Transaction,
  PaginatedResponse,
  RewardStatsData,
  AdminProfile,
} from '@/domain';
import { apiClient } from '../api';
import {
  StatsDTO,
  ActivityDTO,
  UserDTO,
  UserDetailDTO,
  TransactionDTO,
  PaginatedResponseDTO,
  RewardStatsResponseDTO,
  AdminProfileDTO,
} from '../dto';
import {
  mapStatsDTOToStats,
  mapActivityDTOToActivity,
  mapUserDTOToUser,
  mapUserDetailDTOToUserDetail,
  mapTransactionDTOToTransaction,
  mapPaginatedResponseDTOToPaginatedResponse,
  mapRewardStatsResponseDTOToRewardStatsData,
  mapAdminProfileDTOToAdminProfile,
} from '../mappers';

export class AdminRepositoryImpl implements AdminRepository {
  async getAdminProfile(): Promise<AdminProfile> {
    const response = await apiClient.get<AdminProfileDTO>('/admin/me');
    return mapAdminProfileDTOToAdminProfile(response.data);
  }

  async getStats(): Promise<Stats> {
    const response = await apiClient.get<StatsDTO>('/admin/stats');
    return mapStatsDTOToStats(response.data);
  }

  async getActivity(days: number = 7): Promise<Activity> {
    const response = await apiClient.get<ActivityDTO>('/admin/activity', {
      params: { days },
    });
    return mapActivityDTOToActivity(response.data);
  }

  async listUsers(params?: any): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponseDTO<UserDTO>>('/admin/users', {
      params,
    });
    return mapPaginatedResponseDTOToPaginatedResponse(response.data, mapUserDTOToUser);
  }

  async searchUserByEmail(email: string): Promise<UserDetail> {
    const response = await apiClient.get<UserDetailDTO>('/admin/users/search', {
      params: { email },
    });
    return mapUserDetailDTOToUserDetail(response.data);
  }

  async deactivateUser(accountId: number): Promise<void> {
    await apiClient.post(`/admin/users/${accountId}/deactivate`);
  }

  async activateUser(accountId: number): Promise<void> {
    await apiClient.post(`/admin/users/${accountId}/activate`);
  }

  async grantTokens(userId: number, delta: number, reason?: string): Promise<void> {
    console.log('AdminRepositoryImpl.grantTokens called with:', { userId, delta, reason });
    console.log('Making POST request to:', `/admin/users/${userId}/tokens`);
    console.log('Request body:', { delta, reason });

    const response = await apiClient.post(`/admin/users/${userId}/tokens`, { delta, reason });
    console.log('Grant tokens response:', response.data);
    return response.data;
  }

  async updateSubscription(userId: number, subscription: 'FREE' | 'PREMIUM'): Promise<void> {
    await apiClient.put(`/admin/users/${userId}/subscription`, { subscription });
  }

  async getTransactions(params?: any): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponseDTO<TransactionDTO>>(
      '/admin/transactions',
      { params }
    );
    return mapPaginatedResponseDTOToPaginatedResponse(
      response.data,
      mapTransactionDTOToTransaction
    );
  }

  async getGlobalRewardStats(from: string, to: string): Promise<RewardStatsData> {
    const response = await apiClient.get<RewardStatsResponseDTO>('/admin/rewards/stats', {
      params: { from, to },
    });
    return mapRewardStatsResponseDTOToRewardStatsData(response.data);
  }

  async getGymRewardStats(gymId: number, from: string, to: string): Promise<RewardStatsData> {
    const response = await apiClient.get<RewardStatsResponseDTO>(
      `/admin/gyms/${gymId}/rewards/stats`,
      {
        params: { from, to },
      }
    );
    return mapRewardStatsResponseDTOToRewardStatsData(response.data);
  }
}
