import { 
  Stats, 
  Activity, 
  User, 
  UserDetail, 
  Transaction, 
  PaginatedResponse, 
  RewardStatsData,
  AdminProfile 
} from '@/domain';import {
  UserDTO,
  UserDetailDTO,
  StatsDTO,
  ActivityDTO,
  TransactionDTO,
  PaginatedResponseDTO,
  RewardStatsResponseDTO,
  AdminProfileDTO,
} from '../dto';

export const mapAdminProfileDTOToAdminProfile = (dto: AdminProfileDTO): AdminProfile => dto;

export const mapUserDTOToUser = (dto: UserDTO): User => dto;

export const mapUserDetailDTOToUserDetail = (dto: UserDetailDTO): UserDetail => dto;

export const mapStatsDTOToStats = (dto: StatsDTO): Stats => dto;

export const mapActivityDTOToActivity = (dto: ActivityDTO): Activity => dto;

export const mapTransactionDTOToTransaction = (dto: TransactionDTO): Transaction => dto;

export const mapPaginatedResponseDTOToPaginatedResponse = <T, D>(
  dto: PaginatedResponseDTO<D>,
  mapper: (item: D) => T
): PaginatedResponse<T> => {
  const items = dto.data || dto.users || dto.transactions || [];
  return {
    data: items.map(mapper),
    pagination: dto.pagination,
  };
};

export const mapRewardStatsResponseDTOToRewardStatsData = (
  dto: RewardStatsResponseDTO
): RewardStatsData => dto.data;
