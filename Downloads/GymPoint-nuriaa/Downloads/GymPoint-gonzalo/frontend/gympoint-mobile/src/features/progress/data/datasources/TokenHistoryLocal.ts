// src/features/progress/data/datasources/TokenHistoryLocal.ts
import { TokenMovement, TokenSummary } from '../../domain/entities/TokenMovement';

export class TokenHistoryLocal {
  async getMovements(_userId: string): Promise<TokenMovement[]> {
    // Mock data basado en la imagen
    return [
      {
        id: '1',
        type: 'earned',
        category: 'streak',
        amount: 50,
        description: 'Completaste 7 entrenamientos consecutivos',
        date: '2024-10-02T00:00:00Z',
        icon: '🏆',
      },
      {
        id: '2',
        type: 'spent',
        category: 'discount',
        amount: -100,
        description: 'Descuento del 15% en suplementos',
        date: '2024-10-01T00:00:00Z',
        icon: '🎁',
      },
      {
        id: '3',
        type: 'earned',
        category: 'workout',
        amount: 25,
        description: 'Rutina de pecho y tríceps - 45 min',
        date: '2024-10-01T00:00:00Z',
        icon: '🏆',
      },
      {
        id: '4',
        type: 'earned',
        category: 'workout',
        amount: 25,
        description: 'Rutina de espalda - 60 min',
        date: '2024-09-30T00:00:00Z',
        icon: '🏆',
      },
      {
        id: '5',
        type: 'spent',
        category: 'discount',
        amount: -50,
        description: 'Descuento del 10% en equipamiento',
        date: '2024-09-29T00:00:00Z',
        icon: '🎁',
      },
      {
        id: '6',
        type: 'earned',
        category: 'streak',
        amount: 100,
        description: 'Racha de 14 días - ¡Felicitaciones!',
        date: '2024-09-28T00:00:00Z',
        icon: '🏆',
      },
      {
        id: '7',
        type: 'earned',
        category: 'achievement',
        amount: 75,
        description: 'Logro desbloqueado: Primera semana completa',
        date: '2024-09-27T00:00:00Z',
        icon: '🏆',
      },
      {
        id: '8',
        type: 'earned',
        category: 'workout',
        amount: 25,
        description: 'Rutina de piernas - 50 min',
        date: '2024-09-26T00:00:00Z',
        icon: '🏆',
      },
    ];
  }

  async getSummary(_userId: string): Promise<TokenSummary> {
    return {
      available: 245,
      totalEarned: 1840,
      totalSpent: 1595,
    };
  }
}
