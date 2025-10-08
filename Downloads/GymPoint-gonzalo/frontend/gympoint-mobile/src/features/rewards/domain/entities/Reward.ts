export interface Reward {
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
