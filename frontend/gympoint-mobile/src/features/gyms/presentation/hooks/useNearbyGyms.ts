// src/features/gyms/hooks/useNearbyGyms.ts
import { useEffect, useState } from 'react';
import type { Gym } from '../../domain/entities/Gym';
import { DI } from '@di/container';
import { MOCK_UI } from '../../data/datasources/GymMocks';

export function useNearbyGyms(lat?: number, lng?: number, radius = 10000) {
  const [data, setData] = useState<Gym[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [dataSource, setDataSource] = useState<'api' | 'mocks' | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Si no hay coordenadas, usar mocks directamente
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.log('📍 No hay coordenadas disponibles, usando mocks...');
      setTimeout(() => {
        if (mounted) {
          setData(MOCK_UI);
          setDataSource('mocks');
          setLoading(false);
          console.log(`📦 Mocks cargados: ${MOCK_UI.length} gimnasios`);
        }
      }, 500); // Simular un pequeño delay
      
      return () => {
        mounted = false;
      };
    }

    DI.listNearbyGyms
      .execute({ lat, lng, radius })
      .then((d) => {
        if (mounted) {
          setData(d);
          // Los mocks ya vienen con distancia calculada desde el repositorio
          setDataSource('api'); // Si llegamos aquí, los datos vienen del repositorio (que puede usar mocks internamente)
          console.log(`📍 Hook useNearbyGyms: ${d.length} gimnasios cargados desde repositorio`);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e);
          setDataSource(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [lat, lng, radius]);

  return { data, loading, error, dataSource };
}
