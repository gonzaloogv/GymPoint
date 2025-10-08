export interface GymRewardStats {
  id_gym: number;
  gym_name: string;
  claims: number;
  redeemed: number;
  pending: number;
  tokens_spent: number;
}

export interface RewardStatsData {
  period: {
    from: string;
    to: string;
  };
  gyms: GymRewardStats[];
  summary: {
    total_gyms: number;
    total_claims: number;
    total_redeemed: number;
    total_tokens_spent: number;
  };
}
