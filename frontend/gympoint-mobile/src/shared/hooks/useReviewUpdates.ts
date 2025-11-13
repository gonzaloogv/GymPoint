// src/shared/hooks/useReviewUpdates.ts
import { useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from '@shared/providers/WebSocketProvider';
import { WS_EVENTS } from '@shared/types/websocket.types';

interface ReviewUpdatesCallbacks {
  onNewReview?: (data: { reviewId: number; gymId: number; rating: number }) => void;
  onReviewUpdated?: (data: { reviewId: number; gymId: number; rating: number }) => void;
  onRatingUpdated?: (data: { gymId: number; averageRating: number; totalReviews: number }) => void;
}

/**
 * Hook para escuchar actualizaciones de reviews en tiempo real
 * Útil para actualizar la UI cuando otros usuarios dejan/editan reviews
 */
export function useReviewUpdates(gymId: number | null, callbacks: ReviewUpdatesCallbacks) {
  const { connected, on, off } = useWebSocketContext();

  // Usar refs para evitar recrear handlers en cada render
  const onNewReviewRef = useRef(callbacks.onNewReview);
  const onReviewUpdatedRef = useRef(callbacks.onReviewUpdated);
  const onRatingUpdatedRef = useRef(callbacks.onRatingUpdated);

  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onNewReviewRef.current = callbacks.onNewReview;
    onReviewUpdatedRef.current = callbacks.onReviewUpdated;
    onRatingUpdatedRef.current = callbacks.onRatingUpdated;
  }, [callbacks.onNewReview, callbacks.onReviewUpdated, callbacks.onRatingUpdated]);

  /**
   * Handler para nueva review
   */
  const handleNewReview = useCallback(
    (data: { reviewId: number; gymId: number; rating: number; timestamp: string }) => {
      // Solo procesar si es del gimnasio actual
      if (data.gymId !== gymId) return;

      console.log('[useReviewUpdates] New review:', data);
      onNewReviewRef.current?.(data);
    },
    [gymId],
  );

  /**
   * Handler para review actualizada
   */
  const handleReviewUpdated = useCallback(
    (data: { reviewId: number; gymId: number; rating: number; timestamp: string }) => {
      if (data.gymId !== gymId) return;

      console.log('[useReviewUpdates] Review updated:', data);
      onReviewUpdatedRef.current?.(data);
    },
    [gymId],
  );

  /**
   * Handler para rating actualizado
   */
  const handleRatingUpdated = useCallback(
    (data: { gymId: number; averageRating: number; totalReviews: number }) => {
      if (data.gymId !== gymId) return;

      console.log('[useReviewUpdates] Rating updated:', data);
      onRatingUpdatedRef.current?.(data);
    },
    [gymId],
  );

  /**
   * Registrar listeners cuando se conecta
   */
  useEffect(() => {
    if (!connected || !gymId) return;

    on(WS_EVENTS.REVIEW_NEW, handleNewReview);
    on(WS_EVENTS.REVIEW_UPDATED, handleReviewUpdated);
    on(WS_EVENTS.GYM_RATING_UPDATED, handleRatingUpdated);

    return () => {
      off(WS_EVENTS.REVIEW_NEW, handleNewReview);
      off(WS_EVENTS.REVIEW_UPDATED, handleReviewUpdated);
      off(WS_EVENTS.GYM_RATING_UPDATED, handleRatingUpdated);
    };
  }, [connected, gymId, on, off, handleNewReview, handleReviewUpdated, handleRatingUpdated]);

  return { connected };
}
