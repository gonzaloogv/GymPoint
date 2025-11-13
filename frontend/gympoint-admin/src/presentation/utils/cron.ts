export const cronToTime = (cron?: string): string => {
  if (!cron) {
    return '00:01';
  }

  const parts = cron.trim().split(' ');
  if (parts.length < 2) {
    return '00:01';
  }

  const minute = Number(parts[0]);
  const hour = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return '00:01';
  }

  const hh = Math.max(0, Math.min(23, hour)).toString().padStart(2, '0');
  const mm = Math.max(0, Math.min(59, minute)).toString().padStart(2, '0');

  return `${hh}:${mm}`;
};

export const timeToCron = (time: string): string => {
  const [hh = '0', mm = '0'] = time.split(':');
  const hour = Math.max(0, Math.min(23, Number(hh)));
  const minute = Math.max(0, Math.min(59, Number(mm)));

  return `${minute} ${hour} * * *`;
};
