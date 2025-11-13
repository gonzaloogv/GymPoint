export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  unit?: string;
  completed: boolean;
  challengeType?: string;
  date?: string;
}
