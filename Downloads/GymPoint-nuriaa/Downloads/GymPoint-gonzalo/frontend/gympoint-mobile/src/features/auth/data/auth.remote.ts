import { api } from '../../../shared/http/apiClient';
import { LoginRequestDTO, LoginResponseDTO, MeResponseDTO, RegisterRequestDTO, RegisterResponseDTO } from './auth.dto';

export const AuthRemote = {
  login: (payload: LoginRequestDTO) =>
    api.post<LoginResponseDTO>('/api/v1/auth/login', payload).then((r) => r.data),
  me: () => api.get<MeResponseDTO>('/api/v1/auth/me').then((r) => r.data),
  register: (payload: RegisterRequestDTO) =>
    api.post<RegisterResponseDTO>('/api/auth/register', payload).then((r) => r.data),
};
