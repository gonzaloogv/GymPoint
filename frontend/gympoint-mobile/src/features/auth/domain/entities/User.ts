export type Role = 'USER' | 'ADMIN' | 'PREMIUM';
export type AuthProvider = 'local' | 'google';

export interface User {
  id_user: number;
  name: string;
  email: string;
  emailVerified: boolean;
  authProvider: AuthProvider;
  profileCompleted: boolean;
  role: Role;
  tokens: number;
  plan: 'Free' | 'Premium';
}
