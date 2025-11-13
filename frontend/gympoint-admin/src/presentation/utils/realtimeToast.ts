export type RealtimeToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface RealtimeToastPayload {
  title: string;
  description?: string;
  variant?: RealtimeToastVariant;
}

export const REALTIME_TOAST_EVENT = 'gympoint:realtime-toast';

export function emitRealtimeToast(payload: RealtimeToastPayload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<RealtimeToastPayload>(REALTIME_TOAST_EVENT, { detail: payload }));
}
