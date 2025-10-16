export interface PersonalRecord {
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
  date: string;
}

export interface WeeklyVolume {
  day: string;
  volume: number;
}

export interface BestSerie {
  reps: number;
  weight: number;
  date: string;
}

export interface ExerciseProgressDetail {
  exerciseId: string;
  exerciseName: string;
  category: 'strength' | 'cardio' | 'flexibility';
  estimatedRM: number;
  personalRecords: PersonalRecord;
  weeklyVolume: WeeklyVolume[];
  totalVolume: number;
  bestSerie: BestSerie;
  lastWorkoutDate: string;
}
