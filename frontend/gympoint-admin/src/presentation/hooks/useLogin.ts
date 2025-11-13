import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/data/api';
import { LoginCredentials, LoginResponse } from '@/domain';

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return data;
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: login,
  });
};
