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
  loginWithGoogle(idToken: string): Promise<{ user: User; accessToken: string; refreshToken: string }>;
  me(): Promise<User>;
  logout(): Promise<void>;
  register(params: RegisterParams): Promise<{
    id: number;
    email: string;
    name: string;
    lastname: string;
    subscription: 'FREE' | 'PREMIUM';
  }>;
}
