// src/features/progress/data/progress.remote.ts

import { apiClient } from '@shared/http/apiClient';

export class ProgressRemote {
  /**
   * GET /api/progress/weekly-workouts
   * Obtiene el conteo de workouts completados de la semana actual (lunes a domingo)
   */
  async getWeeklyWorkoutsCount(): Promise<number> {
    const response = await apiClient.get<{ weeklyWorkouts: number }>('/api/progress/weekly-workouts');
    return response.data.weeklyWorkouts;
  }
}
