export type LoginRequestDTO = { email: string; password: string };
export type LoginResponseDTO = {
  accessToken: string;
  refreshToken: string;
  user: {
    id_user: number;
    name: string;
    email: string;
    role: 'USER' | 'PREMIUM';
  };
};
export type MeResponseDTO = { user: LoginResponseDTO['user'] };

export type RegisterRequestDTO = {
  name: string;
  lastname: string;
  email: string;
  password: string;
  gender: string;
  locality: string;
  birth_date: string;
  frequency_goal: number;
};

export type RegisterResponseDTO = {
  id: number;
  email: string;
  name: string;
  lastname: string;
  subscription: 'FREE' | 'PREMIUM';
};
