export interface GeneratedCode {
  id: string;
  rewardId: string;
  code: string;
  title: string;
  generatedAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

