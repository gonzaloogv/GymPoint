import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminRepositoryImpl } from '@/data';
import { ListUsersParams, TransactionParams } from '@/domain';

const adminRepository = new AdminRepositoryImpl();

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => adminRepository.getAdminProfile(),
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminRepository.getStats(),
  });
};

export const useActivity = (days: number = 7) => {
  return useQuery({
    queryKey: ['admin', 'activity', days],
    queryFn: () => adminRepository.getActivity(days),
  });
};

export const useUsers = (params?: ListUsersParams) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminRepository.listUsers(params),
  });
};

export const useSearchUser = (email: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['admin', 'user', email],
    queryFn: () => adminRepository.searchUserByEmail(email),
    enabled: enabled && !!email,
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: number) => adminRepository.deactivateUser(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: number) => adminRepository.activateUser(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useGrantTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, delta, reason }: { userId: number; delta: number; reason?: string }) =>
      adminRepository.grantTokens(userId, delta, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      subscription,
    }: {
      userId: number;
      subscription: 'FREE' | 'PREMIUM';
    }) => adminRepository.updateSubscription(userId, subscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useTransactions = (params?: TransactionParams) => {
  return useQuery({
    queryKey: ['admin', 'transactions', params],
    queryFn: () => adminRepository.getTransactions(params),
  });
};

export const useGlobalRewardStats = (from: string, to: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['admin', 'rewards', 'global', from, to],
    queryFn: () => adminRepository.getGlobalRewardStats(from, to),
    enabled: enabled && !!from && !!to,
  });
};

export const useGymRewardStats = (
  gymId: number,
  from: string,
  to: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ['admin', 'rewards', 'gym', gymId, from, to],
    queryFn: () => adminRepository.getGymRewardStats(gymId, from, to),
    enabled: enabled && !!gymId && !!from && !!to,
  });
};
