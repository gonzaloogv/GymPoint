import { useState } from 'react';
import { Alert } from 'react-native';
import { ReviewRemote } from '../../data/review.remote';
import { mapCreateReviewDataToRequestDTO, mapUpdateReviewDataToRequestDTO, mapReviewDTOToEntity } from '../../data/mappers/review.mapper';
import { CreateReviewData, UpdateReviewData, Review } from '../../domain/entities/Review';
import { showSuccessAlert, showErrorAlert } from '@shared/utils/alertUtils';

export interface UseReviewActionsResult {
  createReview: (data: CreateReviewData) => Promise<Review | null>;
  updateReview: (reviewId: number, data: UpdateReviewData) => Promise<Review | null>;
  deleteReview: (reviewId: number) => Promise<boolean>;
  markHelpful: (reviewId: number) => Promise<boolean>;
  unmarkHelpful: (reviewId: number) => Promise<boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isMarking: boolean;
}

/**
 * Hook para manejar acciones sobre reviews (crear, actualizar, eliminar, marcar útil)
 */
export function useReviewActions(): UseReviewActionsResult {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  /**
   * Crear una nueva reseña
   */
  const createReview = async (data: CreateReviewData): Promise<Review | null> => {
    setIsCreating(true);

    try {
      const requestDTO = mapCreateReviewDataToRequestDTO(data);
      const response = await ReviewRemote.createReview(requestDTO);
      const review = mapReviewDTOToEntity(response.data);

      showSuccessAlert(
        'Reseña publicada',
        '¡Tu reseña ha sido publicada correctamente!\n\nGracias por compartir tu experiencia.'
      );

      return review;
    } catch (err: any) {

      const errorData = err?.response?.data?.error;
      let errorMessage = 'Ocurrió un error al publicar tu reseña. Por favor intentá nuevamente.';

      if (errorData) {
        switch (errorData.code) {
          case 'NO_ATTENDANCE':
            errorMessage = 'Debés haber asistido al gimnasio para poder dejar una reseña.';
            break;
          case 'REVIEW_EXISTS':
            errorMessage = 'Ya has dejado una reseña para este gimnasio. Podés editarla desde "Mi reseña".';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = errorData.message || 'Los datos de la reseña no son válidos. Verificá la información ingresada.';
            break;
          default:
            errorMessage = errorData.message || errorMessage;
        }
      }

      showErrorAlert('Error al publicar', errorMessage);

      return null;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Actualizar una reseña existente
   */
  const updateReview = async (reviewId: number, data: UpdateReviewData): Promise<Review | null> => {
    setIsUpdating(true);

    try {
      const requestDTO = mapUpdateReviewDataToRequestDTO(data);
      const response = await ReviewRemote.updateReview(reviewId, requestDTO);
      const review = mapReviewDTOToEntity(response.data);

      showSuccessAlert(
        'Reseña actualizada',
        'Tu reseña ha sido actualizada correctamente.'
      );

      return review;
    } catch (err: any) {

      const errorMessage = err?.response?.data?.error?.message || 'Ocurrió un error al actualizar tu reseña. Por favor intentá nuevamente.';

      showErrorAlert('Error al actualizar', errorMessage);

      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Eliminar una reseña
   */
  const deleteReview = async (reviewId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        '🗑️ Eliminar reseña',
        '¿Estás seguro que deseás eliminar esta reseña? Esta acción no se puede deshacer.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              setIsDeleting(true);

              try {
                await ReviewRemote.deleteReview(reviewId);

                showSuccessAlert(
                  'Reseña eliminada',
                  'Tu reseña ha sido eliminada correctamente.'
                );

                resolve(true);
              } catch (err: any) {
                const errorMessage = err?.response?.data?.error?.message || 'Ocurrió un error al eliminar tu reseña. Por favor intentá nuevamente.';

                showErrorAlert('Error al eliminar', errorMessage);

                resolve(false);
              } finally {
                setIsDeleting(false);
              }
            },
          },
        ]
      );
    });
  };

  /**
   * Marcar reseña como útil
   */
  const markHelpful = async (reviewId: number): Promise<boolean> => {
    setIsMarking(true);

    try {
      await ReviewRemote.markReviewHelpful(reviewId);
      return true;
    } catch (err: any) {
      const errorCode = err?.response?.data?.error?.code;

      // Si ya estaba marcada (409 CONFLICT), intentar desmarcar para mantener toggle idempotente
      if (errorCode === 'CONFLICT') {
        try {
          await ReviewRemote.unmarkReviewHelpful(reviewId);
          return true;
        } catch (innerErr) {
          console.error('[useReviewActions] Failed to unmark after conflict:', innerErr);
        }
      }

      const errorMessage = err?.response?.data?.error?.message || 'Ocurrió un error al marcar la reseña como útil. Por favor intentá nuevamente.';

      showErrorAlert('Error', errorMessage);

      return false;
    } finally {
      setIsMarking(false);
    }
  };

  /**
   * Quitar voto de útil
   */
  const unmarkHelpful = async (reviewId: number): Promise<boolean> => {
    setIsMarking(true);

    try {
      await ReviewRemote.unmarkReviewHelpful(reviewId);
      return true;
    } catch (err: any) {
      return false;
    } finally {
      setIsMarking(false);
    }
  };

  return {
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    unmarkHelpful,
    isCreating,
    isUpdating,
    isDeleting,
    isMarking,
  };
}
