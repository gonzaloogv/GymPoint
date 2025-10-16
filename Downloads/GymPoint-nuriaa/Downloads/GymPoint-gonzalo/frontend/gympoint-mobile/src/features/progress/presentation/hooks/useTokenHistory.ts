// src/features/progress/presentation/hooks/useTokenHistory.ts
import { useState, useEffect } from 'react';
import { TokenMovement, TokenSummary } from '../../domain/entities/TokenMovement';
import { DI } from '@di/container';

export const useTokenHistory = (userId: string) => {
  const [movements, setMovements] = useState<TokenMovement[]>([]);
  const [summary, setSummary] = useState<TokenSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [movementsData, summaryData] = await Promise.all([
          DI.getTokenHistory.getMovements(userId),
          DI.getTokenHistory.getSummary(userId),
        ]);

        setMovements(movementsData);
        setSummary(summaryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar historial');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { movements, summary, loading, error };
};
