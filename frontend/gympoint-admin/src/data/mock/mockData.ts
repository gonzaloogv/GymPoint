import {
  AdminProfile,
  Stats,
  Activity,
  User,
  UserDetail,
  Transaction,
  PaginatedResponse,
  RewardStatsData,
} from '@/domain';

export const mockAdminProfile: AdminProfile = {
  id_admin_profile: 1,
  id_account: 1,
  email: 'admin@gympoint.com',
  name: 'Admin',
  lastname: 'GymPoint',
  department: 'System Administrator',
  notes: 'Main system administrator',
  created_at: new Date().toISOString(),
};

export const mockStats: Stats = {
  users: {
    total: 150,
    by_subscription: [
      { subscription: 'FREE', count: '100' },
      { subscription: 'PREMIUM', count: '50' },
    ],
    recent_registrations: 25,
  },
  admins: {
    total: 3,
  },
  roles: [
    { role_name: 'USER', count: '150' },
    { role_name: 'ADMIN', count: '3' },
  ],
  tokens: {
    total_in_circulation: 12500,
  },
  timestamp: new Date().toISOString(),
};

export const mockActivity: Activity = {
  new_users: [
    {
      id_user_profile: 1,
      email: 'user1@example.com',
      name: 'John Doe',
      created_at: new Date().toISOString(),
    },
    {
      id_user_profile: 2,
      email: 'user2@example.com',
      name: 'Jane Smith',
      created_at: new Date().toISOString(),
    },
  ],
  recent_logins: [
    {
      email: 'user1@example.com',
      name: 'John Doe',
      last_login: new Date().toISOString(),
    },
    {
      email: 'admin@gympoint.com',
      name: 'Admin GymPoint (Admin)',
      last_login: new Date().toISOString(),
    },
  ],
};

export const mockUsers: User[] = [
  {
    id_user_profile: 1,
    id_account: 10,
    email: 'john.doe@example.com',
    name: 'John',
    lastname: 'Doe',
    subscription: 'PREMIUM',
    tokens: 500,
    is_active: true,
    auth_provider: 'google',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id_user_profile: 2,
    id_account: 11,
    email: 'jane.smith@example.com',
    name: 'Jane',
    lastname: 'Smith',
    subscription: 'FREE',
    tokens: 100,
    is_active: true,
    auth_provider: 'email',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id_user_profile: 3,
    id_account: 12,
    email: 'bob.wilson@example.com',
    name: 'Bob',
    lastname: 'Wilson',
    subscription: 'PREMIUM',
    tokens: 750,
    is_active: false,
    auth_provider: 'google',
    last_login: null,
    created_at: new Date().toISOString(),
  },
];

export const mockUsersPaginated: PaginatedResponse<User> = {
  data: mockUsers,
  pagination: {
    total: 3,
    page: 1,
    limit: 20,
    total_pages: 1,
  },
};

export const mockUserDetail: UserDetail = {
  id_account: 10,
  email: 'john.doe@example.com',
  auth_provider: 'google',
  is_active: true,
  email_verified: true,
  last_login: new Date().toISOString(),
  roles: ['USER'],
  profile: {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    type: 'user',
    subscription: 'PREMIUM',
    tokens: 500,
  },
};

export const mockTransactions: Transaction[] = [
  {
    id_ledger: 1,
    id_user_profile: 1,
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    delta: 100,
    reason: 'Reward redemption',
    ref_type: 'REWARD',
    ref_id: 1,
    balance_after: 500,
    created_at: new Date().toISOString(),
  },
  {
    id_ledger: 2,
    id_user_profile: 2,
    user: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
    },
    delta: -50,
    reason: 'Purchase',
    ref_type: 'PURCHASE',
    ref_id: 2,
    balance_after: 100,
    created_at: new Date().toISOString(),
  },
];

export const mockTransactionsPaginated: PaginatedResponse<Transaction> = {
  data: mockTransactions,
  pagination: {
    total: 2,
    page: 1,
    limit: 50,
    total_pages: 1,
  },
};

export const mockRewardStats: RewardStatsData = {
  period: {
    from: new Date().toISOString(),
    to: new Date().toISOString(),
  },
  gyms: [
    {
      id_gym: 1,
      gym_name: 'Gym Alpha',
      claims: 50,
      redeemed: 35,
      pending: 15,
      tokens_spent: 3500,
    },
    {
      id_gym: 2,
      gym_name: 'Gym Beta',
      claims: 30,
      redeemed: 25,
      pending: 5,
      tokens_spent: 2500,
    },
  ],
  summary: {
    total_gyms: 2,
    total_claims: 80,
    total_redeemed: 60,
    total_tokens_spent: 6000,
  },
};
