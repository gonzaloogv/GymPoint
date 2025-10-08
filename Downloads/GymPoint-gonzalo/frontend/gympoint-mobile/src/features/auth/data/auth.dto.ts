export type LoginRequestDTO = { email: string; password: string };
export type LoginResponseDTO = {
  accessToken: string;
  refreshToken: string;
  user: {
    id_user: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'PREMIUM';
  };
};
export type MeResponseDTO = { user: LoginResponseDTO['user'] };
