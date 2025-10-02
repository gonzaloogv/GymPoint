import { User } from '../entities/User';
export interface AuthRepository {
  login(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }>;
  me(): Promise<User>;
  logout(): Promise<void>;
}
