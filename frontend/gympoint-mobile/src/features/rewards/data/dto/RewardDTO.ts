export interface RewardDTO {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'gym' | 'lifestyle' | 'premium';
  icon: string;
  terms?: string;
  validDays: number;
  available: boolean;
}

export interface GeneratedCodeDTO {
  id: string;
  rewardId: string;
  code: string;
  title: string;
  generatedAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

