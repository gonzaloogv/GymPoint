import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { REALTIME_TOAST_EVENT, RealtimeToastPayload } from '../../utils/realtimeToast';

interface ToastItem extends RealtimeToastPayload {
  id: number;
}

const VARIANT_STYLES: Record<string, string> = {
  info: 'bg-slate-900/90 text-white border border-slate-700',
  success: 'bg-emerald-600/90 text-white border border-emerald-400/40',
  warning: 'bg-amber-500/90 text-slate-900 border border-amber-300/60',
  error: 'bg-rose-600/90 text-white border border-rose-400/40',
};

export function RealtimeToastPortal() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<RealtimeToastPayload>).detail;
      if (!detail?.title) return;
      const id = Date.now() + Math.random();
      setItems((current) => [...current, { id, ...detail }]);
      setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 4500);
    };

    window.addEventListener(REALTIME_TOAST_EVENT, handler as EventListener);
    return () => window.removeEventListener(REALTIME_TOAST_EVENT, handler as EventListener);
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={clsx(
            'min-w-[240px] rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm transition-all',
            VARIANT_STYLES[item.variant ?? 'info'],
          )}
        >
          <p className="text-sm font-semibold">{item.title}</p>
          {item.description && <p className="mt-1 text-xs opacity-90">{item.description}</p>}
        </div>
      ))}
    </div>
  );
}
