// src/shared/hooks/useReviewUpdates.ts
import { useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from '@shared/providers/WebSocketProvider';
import { WS_EVENTS } from '@shared/types/websocket.types';

interface ReviewUpdatesCallbacks {
  onNewReview?: (data: { reviewId: number; gymId: number; rating: number }) => void;
  onReviewUpdated?: (data: { reviewId: number; gymId: number; rating: number }) => void;
  onRatingUpdated?: (data: { gymId: number; averageRating: number; totalReviews: number }) => void;
  onHelpfulUpdated?: (data: { reviewId: number; gymId: number; helpfulCount: number; userId: number; hasVoted: boolean }) => void;
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
  const onHelpfulUpdatedRef = useRef(callbacks.onHelpfulUpdated);

  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onNewReviewRef.current = callbacks.onNewReview;
    onReviewUpdatedRef.current = callbacks.onReviewUpdated;
    onRatingUpdatedRef.current = callbacks.onRatingUpdated;
    onHelpfulUpdatedRef.current = callbacks.onHelpfulUpdated;
  }, [callbacks.onNewReview, callbacks.onReviewUpdated, callbacks.onRatingUpdated, callbacks.onHelpfulUpdated]);

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
   * Handler para votos de �til actualizados
   */
  const handleHelpfulUpdated = useCallback(
    (data: { reviewId: number; gymId: number; helpfulCount: number; userId: number; hasVoted: boolean; timestamp?: string }) => {
      if (data.gymId !== gymId) return;

      console.log('[useReviewUpdates] Helpful updated:', data);
      onHelpfulUpdatedRef.current?.(data);
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
    on(WS_EVENTS.REVIEW_HELPFUL_UPDATED, handleHelpfulUpdated);

    return () => {
      off(WS_EVENTS.REVIEW_NEW, handleNewReview);
      off(WS_EVENTS.REVIEW_UPDATED, handleReviewUpdated);
      off(WS_EVENTS.GYM_RATING_UPDATED, handleRatingUpdated);
      off(WS_EVENTS.REVIEW_HELPFUL_UPDATED, handleHelpfulUpdated);
    };
  }, [connected, gymId, on, off, handleNewReview, handleReviewUpdated, handleRatingUpdated, handleHelpfulUpdated]);

  return { connected };
}
