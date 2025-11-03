import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import RoutinesScreen from './RoutinesScreen';
import { IncompleteSessionModal } from '../components/IncompleteSessionModal';
import { useIncompleteSessionModal } from '@features/routines/presentation/hooks';

/**
 * Wrapper para RoutinesScreen que maneja el modal de sesión incompleta
 * Muestra opciones para continuar o descartar el entrenamiento anterior
 *
 * IMPORTANTE: El modal se cierra ANTES de navegar para evitar que persista
 */
export default function RoutinesScreenWrapper() {
  const navigation = useNavigation<any>();
  const { visible, routineName, session, handleDiscard } = useIncompleteSessionModal();
  const [isModalClosing, setIsModalClosing] = useState(false);

  // Cuando el modal se cierra, navegar después de un delay para que se complete la animación
  useEffect(() => {
    if (isModalClosing && !visible && session) {
      // El modal se ha cerrado (visible = false), ahora navegar
      const timer = setTimeout(() => {
        navigation.navigate('RoutineExecution', {
          id: session.routineId,
          restoreState: session,
        });
        setIsModalClosing(false);
      }, 300); // Dar tiempo a la animación del modal

      return () => clearTimeout(timer);
    }
  }, [isModalClosing, visible, session, navigation]);

  const handleContinue = () => {
    // Marcar que queremos cerrar el modal y navegar después
    setIsModalClosing(true);
    // El handleDiscard cierra el modal (visible = false)
    handleDiscard();
  };

  return (
    <>
      <RoutinesScreen />
      <IncompleteSessionModal
        visible={visible && !isModalClosing}
        routineName={routineName || undefined}
        onContinue={handleContinue}
        onDiscard={handleDiscard}
      />
    </>
  );
}
