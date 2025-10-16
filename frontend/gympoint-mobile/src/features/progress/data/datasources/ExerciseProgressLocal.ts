import { ExerciseProgressDetail } from '@features/progress/domain/entities';

export class ExerciseProgressLocal {
  async getExerciseProgress(userId: string): Promise<ExerciseProgressDetail[]> {
    // Simulamos datos de ejemplo
    return [
      {
        exerciseId: '1',
        exerciseName: 'Sentadillas',
        category: 'strength',
        estimatedRM: 120,
        personalRecords: {
          maxWeight: 100,
          maxReps: 12,
          maxVolume: 2450,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        weeklyVolume: [
          { day: 'L', volume: 0 },
          { day: 'M', volume: 450 },
          { day: 'X', volume: 0 },
          { day: 'J', volume: 600 },
          { day: 'V', volume: 0 },
          { day: 'S', volume: 800 },
          { day: 'D', volume: 600 },
        ],
        totalVolume: 2450,
        bestSerie: {
          reps: 8,
          weight: 100,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        lastWorkoutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        exerciseId: '2',
        exerciseName: 'Press banca',
        category: 'strength',
        estimatedRM: 85,
        personalRecords: {
          maxWeight: 70,
          maxReps: 10,
          maxVolume: 1800,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        weeklyVolume: [
          { day: 'L', volume: 400 },
          { day: 'M', volume: 0 },
          { day: 'X', volume: 500 },
          { day: 'J', volume: 0 },
          { day: 'V', volume: 450 },
          { day: 'S', volume: 0 },
          { day: 'D', volume: 450 },
        ],
        totalVolume: 1800,
        bestSerie: {
          reps: 10,
          weight: 70,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        lastWorkoutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        exerciseId: '3',
        exerciseName: 'Peso muerto',
        category: 'strength',
        estimatedRM: 140,
        personalRecords: {
          maxWeight: 120,
          maxReps: 8,
          maxVolume: 1950,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        weeklyVolume: [
          { day: 'L', volume: 0 },
          { day: 'M', volume: 600 },
          { day: 'X', volume: 0 },
          { day: 'J', volume: 0 },
          { day: 'V', volume: 700 },
          { day: 'S', volume: 0 },
          { day: 'D', volume: 650 },
        ],
        totalVolume: 1950,
        bestSerie: {
          reps: 8,
          weight: 120,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        lastWorkoutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }
}
