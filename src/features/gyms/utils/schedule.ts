// src/features/gyms/utils/schedule.ts
import type { Schedule } from '../domain/entities/Schedule';

// Aceptamos ambas convenciones
const dayToJs: Record<string, number> = {
  // English
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
  // Spanish (abreviados más usados en datos)
  dom: 0, lun: 1, mar: 2, mie: 3, 'mié': 3, jue: 4, vie: 5, sab: 6, 'sáb': 6,
};

function toDow(s: Schedule): number | null {
  const raw = (s.day_of_week || '').toString().toLowerCase().trim();
  return (raw in dayToJs) ? dayToJs[raw] : null;
}

const toMinutes = (hhmmss: string) => {
  if (!hhmmss) return 0;
  const [h = '0', m = '0'] = hhmmss.split(':');
  const H = Number(h);
  const M = Number(m);
  if (!Number.isFinite(H) || !Number.isFinite(M)) return 0;
  // 24:00:00 → 1440 (fin del día)
  if (H >= 24) return 24 * 60;
  return H * 60 + M;
};

const is24h = (s: Schedule) => {
  if (s.closed) return false;
  const open = toMinutes(s.opening_time);
  const close = toMinutes(s.closing_time);
  return (open === 0 && (close >= 1439 || close === 0));
};

export function isGymOpenNow(schedules: Schedule[], now = new Date()): boolean {
  const dow = now.getDay(); // 0..6
  const todays = schedules.filter(s => toDow(s) === dow && !s.closed);
  if (!todays.length) return false;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const s of todays) {
    const open = toMinutes(s.opening_time);
    const close = toMinutes(s.closing_time);

    if (is24h(s)) return true;

    if (open <= close) {
      // normal
      if (nowMin >= open && nowMin < close) return true;
    } else {
      // cruza medianoche (ej: 20:00 → 04:00)
      if (nowMin >= open || nowMin < close) return true;
    }
  }
  return false;
}

export function matchesTimeWindow(
  schedules: Schedule[],
  windowLabel: string,
  now = new Date(),
  mode: 'today' | 'any-day' = 'today'   // 👈 opcional
): boolean {
  const dow = now.getDay(); // 0..6

  const candidates = mode === 'today'
    ? schedules.filter(s => toDow(s) === dow && !s.closed)
    : schedules.filter(s => !s.closed); // 👈 más permisivo: toma cualquier día

  if (!candidates.length) return false;

  const windows: Record<string, [number, number]> = {
    'Mañana (6-12)': [6*60, 12*60],
    'Tarde (12-18)': [12*60, 18*60],
    'Noche (18-24)': [18*60, 24*60],
  };

  if (/24\s*horas/i.test(windowLabel)) {
    return candidates.some(s => is24h(s));
  }

  if (/abierto\s*ahora/i.test(windowLabel)) {
    // “Abierto ahora” siempre se evalúa vs hoy
    const todays = schedules.filter(s => toDow(s) === dow && !s.closed);
    return isGymOpenNow(todays, now);
  }

  const range = windows[windowLabel];
  if (!range) return false;

  const [winStart, winEnd] = range;

  const overlaps = (open: number, close: number) => {
    if (open <= close) {
      return Math.max(open, winStart) < Math.min(close, winEnd);
    }
    // cruza medianoche → dos tramos
    return (Math.max(open, winStart) < winEnd || Math.max(0, winStart) < Math.min(close, winEnd));
  };

  for (const s of candidates) {
    if (is24h(s)) return true;
    const open = toMinutes(s.opening_time);
    const close = toMinutes(s.closing_time);
    if (overlaps(open, close)) return true;
  }

  return false;
}
