import { User } from '../entities/User';

export interface RegisterParams {
  name: string;
  lastname: string;
  email: string;
  password: string;
  // Onboarding 2 fases: campos opcionales (se completan en fase 2)
  gender?: 'M' | 'F' | 'O';
  locality?: string | null;
  birth_date?: string | null;
  frequency_goal?: number;
}

export interface CompleteOnboardingParams {
  frequencyGoal: number;
  birthDate: string;
  gender?: 'M' | 'F' | 'O';
}

export interface AuthRepository {
  login(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }>;
  loginWithGoogle(
    idToken: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string; needsOnboarding: boolean }>;
  me(): Promise<User>;
  logout(): Promise<void>;
  register(params: RegisterParams): Promise<{
    id: number;
    email: string;
    name: string;
    lastname: string;
    subscription: 'FREE' | 'PREMIUM';
  }>;
  completeOnboarding(params: CompleteOnboardingParams): Promise<User>;
}
