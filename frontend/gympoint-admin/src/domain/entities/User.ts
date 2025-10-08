export interface User {
  id_user_profile: number;
  id_account: number;
  email: string;
  name: string;
  lastname: string;
  subscription: 'FREE' | 'PREMIUM';
  tokens: number;
  is_active: boolean;
  auth_provider: string;
  last_login: string | null;
  created_at: string;
}

export interface UserDetail {
  id_account: number;
  email: string;
  auth_provider: string;
  is_active: boolean;
  email_verified: boolean;
  last_login: string | null;
  roles: string[];
  profile: {
    id: number;
    name: string;
    lastname: string;
    type: 'admin' | 'user';
    subscription?: 'FREE' | 'PREMIUM';
    tokens?: number;
    department?: string;
  } | null;
}
