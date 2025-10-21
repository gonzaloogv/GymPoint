export type LoginRequestDTO = { email: string; password: string };
export type LoginResponseDTO = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    id_user_profile?: number;
    email: string;
    name?: string;
    lastname?: string;
    subscription?: 'FREE' | 'PREMIUM';
    tokens?: number;
    roles?: string[];
  };
};
export type MeResponseDTO = {
  id: number;
  email: string;
  id_user_profile: number;
  name?: string;
  lastname?: string;
  subscription?: 'FREE' | 'PREMIUM';
  tokens?: number;
};

export type RegisterRequestDTO = {
  name: string;
  lastname: string;
  email: string;
  password: string;
  gender: string;
  locality: string;
  birth_date?: string | null;
  frequency_goal: number;
};

export type RegisterResponseDTO = {
  id: number;
  email: string;
  name: string;
  lastname: string;
  subscription: 'FREE' | 'PREMIUM';
};
