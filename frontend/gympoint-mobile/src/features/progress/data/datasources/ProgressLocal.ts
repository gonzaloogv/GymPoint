import { ProgressDTO } from '../dto/ProgressDTO';

export class ProgressLocal {
  async getProgress(userId: string): Promise<ProgressDTO> {
    // Mock data - en producción vendría de AsyncStorage o API
    return {
      streak: {
        currentStreak: 14,
        icon: '🔥',
        change: 7,
      },
      weekly: {
        workoutsThisWeek: 4,
        icon: '🎯',
        change: 1,
      },
      physicalProgress: {
        weight: 75.5,
        measurements: {
          chest: 98,
          waist: 82,
          arms: 38,
          legs: 58,
        },
        bodyComposition: {
          bodyFat: 15.2,
          muscleMass: 63.8,
        },
      },
      exerciseProgress: [
        {
          exerciseId: '1',
          exerciseName: 'Press Banca',
          personalRecords: {
            maxWeight: 80,
            maxReps: 12,
            maxVolume: 960,
          },
          improvements: [
            { type: 'weight', value: 5 },
            { type: 'volume', value: 120 },
          ],
        },
        {
          exerciseId: '2',
          exerciseName: 'Sentadilla',
          personalRecords: {
            maxWeight: 100,
            maxReps: 10,
            maxVolume: 1000,
          },
          improvements: [
            { type: 'weight', value: 10 },
            { type: 'reps', value: 2 },
          ],
        },
      ],
      achievements: [
        {
          id: '1',
          title: '7 Días Consecutivos',
          description: 'Mantuviste una racha de 7 días',
          icon: '🔥',
          earnedAt: new Date().toISOString(),
          category: 'streak',
        },
        {
          id: '2',
          title: 'Récord Personal',
          description: 'Nuevo récord en Press Banca',
          icon: '🏆',
          earnedAt: new Date().toISOString(),
          category: 'personal_record',
        },
        {
          id: '3',
          title: '50 Entrenamientos',
          description: 'Completaste 50 entrenamientos',
          icon: '💪',
          earnedAt: new Date().toISOString(),
          category: 'workout',
        },
        {
          id: '4',
          title: 'Primera Semana',
          description: 'Completaste tu primera semana',
          icon: '⭐',
          earnedAt: new Date().toISOString(),
          category: 'challenge',
        },
        {
          id: '5',
          title: 'Constancia',
          description: '30 días de entrenamiento',
          icon: '🎯',
          earnedAt: new Date().toISOString(),
          category: 'streak',
        },
        {
          id: '6',
          title: 'Progreso Sólido',
          description: 'Aumentaste tu fuerza en un 20%',
          icon: '💎',
          earnedAt: new Date().toISOString(),
          category: 'personal_record',
        },
      ],
      trends: [
        {
          label: 'Volumen Semanal',
          value: 12500,
          trend: 'up',
          data: [10000, 10500, 11000, 11500, 12000, 12500],
        },
        {
          label: 'Peso Promedio',
          value: 65,
          trend: 'up',
          data: [50, 55, 58, 60, 62, 65],
        },
      ],
    };
  }
}
