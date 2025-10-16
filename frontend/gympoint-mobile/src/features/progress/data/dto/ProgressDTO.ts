export interface ProgressDTO {
  streak: {
    currentStreak: number;
    icon: string;
    change: number;
  };
  weekly: {
    workoutsThisWeek: number;
    icon: string;
    change: number;
  };
  physicalProgress: {
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
  };
  exerciseProgress: Array<{
    exerciseId: string;
    exerciseName: string;
    personalRecords: {
      maxWeight: number;
      maxReps: number;
      maxVolume: number;
    };
    improvements: Array<{
      type: string;
      value: number;
    }>;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    category: 'workout' | 'streak' | 'personal_record' | 'challenge';
  }>;
  trends: Array<{
    label: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    data: number[];
  }>;
}
