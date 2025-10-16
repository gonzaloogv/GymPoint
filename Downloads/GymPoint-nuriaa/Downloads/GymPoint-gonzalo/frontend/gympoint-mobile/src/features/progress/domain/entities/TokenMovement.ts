// src/features/progress/domain/entities/TokenMovement.ts

export type MovementType = 'earned' | 'spent';

export type MovementCategory =
  | 'streak'           // Racha de días
  | 'workout'          // Entrenamiento completado
  | 'discount'         // Descuento aplicado
  | 'achievement';     // Logro desbloqueado

export interface TokenMovement {
  id: string;
  type: MovementType;
  category: MovementCategory;
  amount: number;           // Positivo para ganados, negativo para gastados
  description: string;
  date: string;             // ISO date string
  icon: string;             // Emoji icon
}

export interface TokenSummary {
  available: number;
  totalEarned: number;
  totalSpent: number;
}
