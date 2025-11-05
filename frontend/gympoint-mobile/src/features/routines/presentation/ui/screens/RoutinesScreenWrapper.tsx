import React from 'react';
import RoutinesScreen from './RoutinesScreen';
import { IncompleteSessionModal } from '../components/IncompleteSessionModal';
import { useIncompleteSessionModal } from '@features/routines/presentation/hooks';

/**
 * Wrapper para RoutinesScreen que maneja el modal de sesión incompleta
 * Muestra opciones para continuar el entrenamiento anterior o cerrar el modal
 *
 * IMPORTANTE: Cerrar el modal NO borra la sesión, solo la oculta
 */
export default function RoutinesScreenWrapper() {
  const { visible, routineName, handleContinue, handleClose } = useIncompleteSessionModal();

  return (
    <>
      <RoutinesScreen />
      <IncompleteSessionModal
        visible={visible}
        routineName={routineName || undefined}
        onContinue={handleContinue}
        onClose={handleClose}
      />
    </>
  );
}
