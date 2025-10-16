import { create } from 'zustand';
import { Progress } from '@features/progress/domain/entities/Progress';

interface ProgressState {
  progress: Progress | null;
  loading: boolean;
  error: string | null;
  setProgress: (progress: Progress) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: null,
  loading: false,
  error: null,
  setProgress: (progress) => set({ progress, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ progress: null, loading: false, error: null }),
}));
