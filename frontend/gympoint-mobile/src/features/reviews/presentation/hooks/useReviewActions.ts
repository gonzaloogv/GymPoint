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
 * Hook para manejar acciones sobre reviews (crear, actualizar, eliminar, marcar Ãºtil)
 */
export function useReviewActions(): UseReviewActionsResult {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  /**
   * Crear una nueva reseÃ±a
   */
  const createReview = async (data: CreateReviewData): Promise<Review | null> => {
    setIsCreating(true);

    try {
      const requestDTO = mapCreateReviewDataToRequestDTO(data);
      const response = await ReviewRemote.createReview(requestDTO);
      const review = mapReviewDTOToEntity(response.data);

      showSuccessAlert(
        'ReseÃ±a publicada',
        'Â¡Tu reseÃ±a ha sido publicada correctamente!\n\nGracias por compartir tu experiencia.'
      );

      return review;
    } catch (err: any) {

      const errorData = err?.response?.data?.error;
      let errorMessage = 'OcurriÃ³ un error al publicar tu reseÃ±a. Por favor intentÃ¡ nuevamente.';

      if (errorData) {
        switch (errorData.code) {
          case 'NO_ATTENDANCE':
            errorMessage = 'Debes haber asistido al gimnasio para poder dejar una reseÃ±a.';
            break;
          case 'REVIEW_EXISTS':
            errorMessage = 'Ya has dejado una reseÃ±a para este gimnasio. PodÃ©s editarla desde "Mi reseÃ±a".';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = errorData.message || 'Los datos de la reseÃ±a no son vÃ¡lidos. VerificÃ¡ la informaciÃ³n ingresada.';
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
   * Actualizar una reseÃ±a existente
   */
  const updateReview = async (reviewId: number, data: UpdateReviewData): Promise<Review | null> => {
    setIsUpdating(true);

    try {
      const requestDTO = mapUpdateReviewDataToRequestDTO(data);
      const response = await ReviewRemote.updateReview(reviewId, requestDTO);
      const review = mapReviewDTOToEntity(response.data);

      showSuccessAlert(
        'ReseÃ±a actualizada',
        'Tu reseÃ±a ha sido actualizada correctamente.'
      );

      return review;
    } catch (err: any) {

      const errorMessage = err?.response?.data?.error?.message || 'OcurriÃ³ un error al actualizar tu reseÃ±a. Por favor intentÃ¡ nuevamente.';

      showErrorAlert('Error al actualizar', errorMessage);

      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Eliminar una reseÃ±a
   */
  const deleteReview = async (reviewId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'ðŸ—‘ï¸ Eliminar reseÃ±a',
        'Â¿EstÃ¡s seguro que deseas eliminar esta reseÃ±a? Esta acciÃ³n no se puede deshacer.',
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
                  'ReseÃ±a eliminada',
                  'Tu reseÃ±a ha sido eliminada correctamente.'
                );

                resolve(true);
              } catch (err: any) {
                const errorMessage = err?.response?.data?.error?.message || 'OcurriÃ³ un error al eliminar tu reseÃ±a. Por favor intentÃ¡ nuevamente.';

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
   * Marcar reseÃ±a como Ãºtil
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

      const errorMessage = err?.response?.data?.error?.message || 'Ocurrio un error al marcar la resena como util. Por favor intenta nuevamente.';

      showErrorAlert('Error', errorMessage);

      return false;
    } finally {
      setIsMarking(false);
    }
  };

  /**
   * Quitar voto de ?til
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


