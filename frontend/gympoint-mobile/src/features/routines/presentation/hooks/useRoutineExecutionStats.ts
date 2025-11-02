import { useEffect, useState, useMemo } from 'react';
import { ExerciseExecutionState } from '@features/routines/domain/entities/ExecutionSession';

interface ExecutionStatsResult {
  duration: number; // segundos
  totalVolume: number; // kg
  setsCompleted: number;
  totalSets: number;
}

/**
 * Hook para calcular estadísticas en tiempo real durante la ejecución
 * Se actualiza cada segundo y recalcula volumen/sets completados
 *
 * @param startTime - Timestamp en ms cuando inició la sesión
 * @param exerciseStates - Estado actual de todos los ejercicios
 * @returns Objeto con duration, totalVolume, setsCompleted, totalSets
 */
export function useRoutineExecutionStats(
  startTime: number | null,
  exerciseStates: Record<string, ExerciseExecutionState>
): ExecutionStatsResult {
  // Estado local para la duración (se actualiza cada segundo)
  const [duration, setDuration] = useState<number>(0);

  // Timer para actualizar duración cada segundo
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      setDuration(elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Calcular volumen total (memoizado para evitar recálculos innecesarios)
  const totalVolume = useMemo(() => {
    let sum = 0;

    Object.values(exerciseStates).forEach((exState) => {
      exState.sets.forEach((set) => {
        if (set.isDone) {
          const weight = set.currentWeight || 0;
          const reps = set.currentReps || 0;
          sum += weight * reps;
        }
      });
    });

    return sum;
  }, [exerciseStates]);

  // Contar sets completados (memoizado)
  const setsCompleted = useMemo(() => {
    let count = 0;

    Object.values(exerciseStates).forEach((exState) => {
      count += exState.sets.filter((s) => s.isDone).length;
    });

    return count;
  }, [exerciseStates]);

  // Contar sets totales (memoizado)
  const totalSets = useMemo(() => {
    let count = 0;

    Object.values(exerciseStates).forEach((exState) => {
      count += exState.sets.length;
    });

    return count;
  }, [exerciseStates]);

  return {
    duration,
    totalVolume,
    setsCompleted,
    totalSets,
  };
}
