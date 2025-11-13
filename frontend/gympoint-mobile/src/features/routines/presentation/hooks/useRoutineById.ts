import { useState, useEffect } from 'react';
import { Routine } from '../../domain/entities';
import { useRoutinesStore } from '../state';

export function useRoutineById(id?: number) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchRoutineById } = useRoutinesStore();

  useEffect(() => {
    if (!id) return;

    const loadRoutine = async () => {
      setLoading(true);
      try {
        const data = await fetchRoutineById(id);
        setRoutine(data);
      } catch (error) {
        console.error('Error loading routine:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [id, fetchRoutineById]);

  return { routine, loading };
}
