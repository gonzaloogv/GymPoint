export interface AdminProfileDTO {
  id_admin_profile: number;
  id_account: number;
  email: string;
  name: string;
  lastname: string;
  department: string | null;
  notes: string | null;
  created_at: string;
}

export interface UserDTO {
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

export interface UserDetailDTO {
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

export interface StatsDTO {
  users: {
    total: number;
    by_subscription: Array<{
      subscription: string;
      count: string;
    }>;
    recent_registrations: number;
  };
  admins: {
    total: number;
  };
  roles: Array<{
    role_name: string;
    count: string;
  }>;
  tokens: {
    total_in_circulation: number;
  };
  timestamp: string;
}

export interface ActivityDTO {
  new_users: Array<{
    id_user_profile: number;
    email: string;
    name: string;
    created_at: string;
  }>;
  recent_logins: Array<{
    email: string;
    name: string;
    last_login: string;
  }>;
}

export interface TransactionDTO {
  id_ledger: number;
  id_user_profile: number;
  user: {
    name: string;
    email: string;
  } | null;
  delta: number;
  reason: string;
  ref_type: string | null;
  ref_id: number | null;
  balance_after: number;
  created_at: string;
}

export interface PaginatedResponseDTO<T> {
  data?: T[];
  users?: T[];
  transactions?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface GymRewardStatsDTO {
  id_gym: number;
  gym_name: string;
  claims: number;
  redeemed: number;
  pending: number;
  tokens_spent: number;
}

export interface RewardStatsResponseDTO {
  message: string;
  data: {
    period: {
      from: string;
      to: string;
    };
    gyms: GymRewardStatsDTO[];
    summary: {
      total_gyms: number;
      total_claims: number;
      total_redeemed: number;
      total_tokens_spent: number;
    };
  };
}
