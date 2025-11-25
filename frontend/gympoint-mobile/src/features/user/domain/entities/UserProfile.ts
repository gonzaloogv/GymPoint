export type Role = 'USER' | 'ADMIN' | 'PREMIUM';

export interface UserProfile {
  id_user: number;
  name: string;
  email: string;
  role: Role;
  tokens: number;
  plan: 'Free' | 'Premium';
  streak?: number;
  avatar?: string;
}
