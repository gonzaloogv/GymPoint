import { User } from '../entities/User';

export interface RegisterParams {
  name: string;
  lastname: string;
  email: string;
  password: string;
  gender: string;
  locality: string;
  birth_date?: string | null;
  frequency_goal: number;
}

export interface AuthRepository {
  login(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }>;
  me(): Promise<User>;
  logout(): Promise<void>;
  register(params: RegisterParams): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }>;
}
