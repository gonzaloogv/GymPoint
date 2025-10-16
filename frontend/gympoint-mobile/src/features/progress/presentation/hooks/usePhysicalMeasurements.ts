import { useState, useEffect } from 'react';
import { PhysicalMeasurements } from '../../domain/entities';
import { PhysicalMeasurementsLocal } from '../../data/datasources/PhysicalMeasurementsLocal';

const datasource = new PhysicalMeasurementsLocal();

export const usePhysicalMeasurements = (userId: string) => {
  const [measurements, setMeasurements] = useState<PhysicalMeasurements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const data = await datasource.getPhysicalMeasurements(userId);
        setMeasurements(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar mediciones');
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [userId]);

  return {
    measurements,
    loading,
    error,
  };
};
