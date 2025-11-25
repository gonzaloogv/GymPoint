// Estructura del progreso del achievement
export interface AchievementProgressDTO {
  value: number;        // Valor actual del progreso
  denominator: number;  // Valor objetivo (target_value)
  percentage: number;   // Porcentaje de completado (0-1)
}

// Estructura que devuelve la API para cada achievement del usuario
export interface UserAchievementResponseDTO {
  id: number; // id_achievement_definition en la base de datos
  code: string;
  name: string;
  description?: string | null;
  category: string;
  metric_type: string;
  target_value: number;
  icon_url?: string | null;
  is_active: boolean;
  metadata?: {
    token_reward?: number;
    unlock_message?: string;
    icon?: string;
  } | null;
  progress: AchievementProgressDTO; // OBJETO con value, denominator, percentage
  unlocked: boolean; // si el usuario lo desbloqueó
  unlocked_at?: string | null;
  last_source_type?: string | null;
  last_source_id?: number | null;
}

// Respuesta envuelta que devuelve el endpoint GET /api/achievements/me
export interface AchievementsResponseWrapper {
  data: UserAchievementResponseDTO[];
}
