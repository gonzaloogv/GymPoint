export interface StreakData {
  currentStreak: number;
  icon: string;
  change: number;
}

export interface WeeklyData {
  workoutsThisWeek: number;
  icon: string;
  change: number;
}

export interface PhysicalProgress {
  weight?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    arms?: number;
    legs?: number;
  };
  bodyComposition?: {
    bodyFat?: number;
    muscleMass?: number;
  };
  photos?: string[];
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  personalRecords: {
    maxWeight: number;
    maxReps: number;
    maxVolume: number;
  };
  improvements: {
    type: string;
    value: number;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'workout' | 'streak' | 'personal_record' | 'challenge';
}

export interface TrendData {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  data: number[];
}

export interface Progress {
  streak: StreakData;
  weekly: WeeklyData;
  physicalProgress: PhysicalProgress;
  exerciseProgress: ExerciseProgress[];
  achievements: Achievement[];
  trends: TrendData[];
}
