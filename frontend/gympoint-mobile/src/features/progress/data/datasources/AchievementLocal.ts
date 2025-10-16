import { Achievement } from '@features/progress/domain/entities/Progress';

export class AchievementLocal {
  async getAchievements(userId: string): Promise<Achievement[]> {
    // Simulamos datos de logros (desbloqueados y bloqueados)
    return [
      {
        id: '1',
        title: 'Primera semana',
        description: 'Completaste tu primera rutina de piernas',
        icon: '🎯',
        earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'workout',
      },
      {
        id: '2',
        title: 'Racha 7 días',
        description: 'Mantén 7 días consecutivos',
        icon: '🔥',
        earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'streak',
      },
      {
        id: '3',
        title: 'PR en sentadillas',
        description: 'Nuevo récord personal en sentadillas',
        icon: '💪',
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'personal_record',
      },
      {
        id: '4',
        title: 'Mes completo',
        description: 'Entrenaste todos los días del mes',
        icon: '🔒',
        earnedAt: '', // Bloqueado - progreso 45%
        category: 'streak',
      },
      {
        id: '5',
        title: '100 entrenamientos',
        description: 'Completaste 100 entrenamientos',
        icon: '🔒',
        earnedAt: '', // Bloqueado - progreso 30%
        category: 'workout',
      },
      {
        id: '6',
        title: 'Maratonista',
        description: 'Completa tu primera maratón de entrenamiento',
        icon: '🔒',
        earnedAt: '', // Bloqueado - progreso 0%
        category: 'challenge',
      },
    ];
  }

  async getLockedAchievements(): Promise<Achievement[]> {
    // Logros aún no desbloqueados
    return [
      {
        id: '7',
        title: 'Racha 30 días',
        description: 'Mantén 30 días consecutivos',
        icon: '🔒',
        earnedAt: '',
        category: 'streak',
      },
      {
        id: '8',
        title: 'Fuerza máxima',
        description: 'Alcanza 200kg en peso muerto',
        icon: '🔒',
        earnedAt: '',
        category: 'personal_record',
      },
      {
        id: '9',
        title: '500 entrenamientos',
        description: 'Completa 500 entrenamientos en total',
        icon: '🔒',
        earnedAt: '',
        category: 'workout',
      },
    ];
  }
}
