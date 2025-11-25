import { useState, useCallback } from 'react';
import { api } from '@shared/http/apiClient';

// Types
export interface ExerciseHistoryItem {
  date: string;
  id_exercise: number;
  exercise_name: string;
  muscular_group: string;
  used_weight: number;
  reps: number;
  total_volume: number;
}

export interface PersonalRecord {
  date: string;
  used_weight: number;
  reps: number;
  total_volume: number;
}

export interface ExerciseAverages {
  average_weight: number;
  average_reps: number;
  average_volume: number;
  total_records: number;
}

export interface ExerciseMetrics {
  history: ExerciseHistoryItem[];
  personalRecord: PersonalRecord | null;
  averages: ExerciseAverages | null;
}

interface ExerciseHistoryResponse {
  message: string;
  data: ExerciseHistoryItem[];
}

interface PersonalRecordResponse {
  message: string;
  data: PersonalRecord;
}

interface ExerciseAveragesResponse {
  message: string;
  data: ExerciseAverages;
}

export function useExerciseProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener historial completo de todos los ejercicios
  const getAllExerciseHistory = useCallback(async (): Promise<ExerciseHistoryItem[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ExerciseHistoryResponse>('/api/progress/me/ejercicios');
      return response.data.data;
    } catch (err: any) {
      console.error('Error fetching all exercise history:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al obtener historial';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener historial de un ejercicio específico
  const getExerciseHistory = useCallback(async (exerciseId: number): Promise<ExerciseHistoryItem[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ExerciseHistoryResponse>(
        `/api/progress/me/ejercicios/${exerciseId}`
      );
      return response.data.data;
    } catch (err: any) {
      // 404 o respuesta vacía es normal cuando no hay registros
      if (err.response?.status === 404) {
        console.log('No hay historial para este ejercicio');
        return [];
      }
      console.error('Error fetching exercise history:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al obtener historial del ejercicio';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener mejor marca personal (PR) de un ejercicio
  const getPersonalRecord = useCallback(async (exerciseId: number): Promise<PersonalRecord | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<PersonalRecordResponse>(
        `/api/progress/me/ejercicios/${exerciseId}/mejor`
      );
      return response.data.data;
    } catch (err: any) {
      // 404 es normal cuando no hay registros, no es un error
      if (err.response?.status === 404) {
        console.log('No hay récord personal para este ejercicio');
        return null;
      }
      console.error('Error fetching personal record:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al obtener récord personal';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener promedios de un ejercicio
  const getExerciseAverages = useCallback(async (exerciseId: number): Promise<ExerciseAverages | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ExerciseAveragesResponse>(
        `/api/progress/me/ejercicios/${exerciseId}/promedio`
      );
      return response.data.data;
    } catch (err: any) {
      // 404 es normal cuando no hay registros, no es un error
      if (err.response?.status === 404) {
        console.log('No hay promedios para este ejercicio');
        return null;
      }
      console.error('Error fetching exercise averages:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al obtener promedios';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener todas las métricas de un ejercicio de una vez
  const getExerciseMetrics = useCallback(async (exerciseId: number): Promise<ExerciseMetrics> => {
    try {
      setLoading(true);
      setError(null);

      const [history, personalRecord, averages] = await Promise.all([
        getExerciseHistory(exerciseId),
        getPersonalRecord(exerciseId),
        getExerciseAverages(exerciseId)
      ]);

      return {
        history,
        personalRecord,
        averages
      };
    } catch (err: any) {
      console.error('Error fetching exercise metrics:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al obtener métricas del ejercicio';
      setError(errorMessage);
      return {
        history: [],
        personalRecord: null,
        averages: null
      };
    } finally {
      setLoading(false);
    }
  }, [getExerciseHistory, getPersonalRecord, getExerciseAverages]);

  return {
    loading,
    error,
    getAllExerciseHistory,
    getExerciseHistory,
    getPersonalRecord,
    getExerciseAverages,
    getExerciseMetrics
  };
}
