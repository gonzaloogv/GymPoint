export interface Stats {
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

export interface Activity {
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
