export interface ProgressMetric {
  id: string;
  type: 'weight' | 'bodyFat' | 'imc' | 'streak';
  value: number;
  unit: string;
  change: number;
  changeType: 'up' | 'down' | 'neutral';
  date: string;
}

export interface KPIMetric {
  icon: string;
  label: string;
  value: string | number;
  change: number;
  changeType: 'up' | 'down' | 'neutral';
}

export interface TokenData {
  available: number;
  earned: number;
  spent: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  earnedPoints: number;
}
