export type LoginRequestDTO = { email: string; password: string };
export type LoginResponseDTO = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    roles: string[];
    name?: string;
    lastname?: string;
    subscription?: 'FREE' | 'PREMIUM';
    tokens?: number;
    id_user_profile?: number;
    department?: string;
    id_admin_profile?: number;
  };
};
export type MeResponseDTO = {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  gender: string;
  locality: string;
  birth_date: string | null;
  role: string;
  tokens: number;
};

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
