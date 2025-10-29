import { useState } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { ReviewRemote } from '../../data/review.remote';
import { mapCreateReviewDataToRequestDTO, mapUpdateReviewDataToRequestDTO, mapReviewDTOToEntity } from '../../data/mappers/review.mapper';
import { CreateReviewData, UpdateReviewData, Review } from '../../domain/entities/Review';

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

      Toast.show({
        type: 'success',
        text1: '¡Reseña publicada!',
        text2: response.message || 'Tu reseña ha sido publicada correctamente',
        position: 'top',
      });

      return review;
    } catch (err: any) {
      console.error('[useReviewActions.createReview] Error:', err);

      const errorData = err?.response?.data?.error;
      let errorMessage = 'Error al publicar la reseña';

      if (errorData) {
        switch (errorData.code) {
          case 'NO_ATTENDANCE':
            errorMessage = 'Debes haber asistido al gimnasio para poder dejar una reseña';
            break;
          case 'REVIEW_EXISTS':
            errorMessage = 'Ya has dejado una reseña para este gimnasio';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = errorData.message || 'Datos de reseña inválidos';
            break;
          default:
            errorMessage = errorData.message || errorMessage;
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Error al publicar reseña',
        text2: errorMessage,
        position: 'top',
      });

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

      Toast.show({
        type: 'success',
        text1: '¡Reseña actualizada!',
        text2: 'Tu reseña ha sido actualizada correctamente',
        position: 'top',
      });

      return review;
    } catch (err: any) {
      console.error('[useReviewActions.updateReview] Error:', err);

      const errorMessage = err?.response?.data?.error?.message || 'Error al actualizar la reseña';

      Toast.show({
        type: 'error',
        text1: 'Error al actualizar',
        text2: errorMessage,
        position: 'top',
      });

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
        'Eliminar reseña',
        '¿Estás seguro que deseas eliminar esta reseña? Esta acción no se puede deshacer.',
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

                Toast.show({
                  type: 'success',
                  text1: 'Reseña eliminada',
                  text2: 'Tu reseña ha sido eliminada correctamente',
                  position: 'top',
                });

                resolve(true);
              } catch (err: any) {
                console.error('[useReviewActions.deleteReview] Error:', err);

                const errorMessage = err?.response?.data?.error?.message || 'Error al eliminar la reseña';

                Toast.show({
                  type: 'error',
                  text1: 'Error al eliminar',
                  text2: errorMessage,
                  position: 'top',
                });

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
      console.error('[useReviewActions.markHelpful] Error:', err);

      const errorMessage = err?.response?.data?.error?.message || 'Error al marcar como útil';

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
      });

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
      console.error('[useReviewActions.unmarkHelpful] Error:', err);
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
