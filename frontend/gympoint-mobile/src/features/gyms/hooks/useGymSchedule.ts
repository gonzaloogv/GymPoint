import React from 'react';
import { useEffect, useState } from 'react';

import { DI } from '@di/container';
import type { Schedule } from '../domain/entities/Schedule';

export function useGymSchedules(gymIds: Array<number | string> | undefined) {
  const [map, setMap] = useState<Record<number, Schedule[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const ids = (gymIds ?? []).map((id) => Number(id)).filter((n) => Number.isFinite(n));

    if (!ids.length) return;

    let mounted = true;
    setLoading(true);
    DI.getSchedulesForGyms
      .execute(ids)
      .then((m) => {
        if (mounted) setMap(m);
      })
      .catch((e) => {
        if (mounted) setError(e);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(gymIds)]);

  return { schedulesMap: map, loading, error };
}
