export type Role = 'USER' | 'ADMIN' | 'PREMIUM';
export interface User {
  id_user: number;
  name: string;
  email: string;
  emailVerified: boolean;
  role: Role;
  tokens: number;
  plan: 'Free' | 'Premium';
}
