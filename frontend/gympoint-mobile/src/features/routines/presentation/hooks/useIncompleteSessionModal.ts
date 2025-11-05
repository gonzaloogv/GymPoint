import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoutinesStore } from '../state';

type RoutinesStackParamList = {
  RoutinesList: undefined;
  RoutineExecution: { id: string };
};

/**
 * Hook para manejar el modal de sesión incompleta
 * Se conecta al store para cargar/descartar sesiones guardadas
 *
 * Funcionalidades:
 * - Detecta si hay una sesión incompleta al cargar
 * - Muestra el modal automáticamente
 * - Maneja las acciones de continuar y descartar
 * - NO muestra el modal si estás en la pantalla de ejecución
 */
export function useIncompleteSessionModal() {
  const navigation = useNavigation<NativeStackNavigationProp<RoutinesStackParamList>>();
  const route = useRoute();
  const [visible, setVisible] = useState(false);
  const {
    incompleteSession,
    loadIncompleteSession,
    discardSession,
    resumeSession,
  } = useRoutinesStore();

  // Cargar sesión incompleta al montar
  useEffect(() => {
    loadIncompleteSession();
  }, [loadIncompleteSession]);

  // Mostrar modal si hay sesión incompleta Y no estamos en pantalla de ejecución
  useEffect(() => {
    const isExecutionScreen = route.name === 'RoutineExecution' || route.name === 'RoutineCompleted';

    if (incompleteSession && !isExecutionScreen) {
      console.log('[Modal] 🔍 Sesión incompleta:', incompleteSession.routineName);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [incompleteSession, route.name]);

  /**
   * Continuar con la sesión incompleta
   * - Restaura el estado de ejecución
   * - Navega a la pantalla de ejecución
   * - Cierra el modal
   */
  const handleContinue = useCallback(() => {
    if (!incompleteSession) return;

    console.log('[Modal] ✅ Continuando sesión');
    resumeSession();
    navigation.navigate('RoutineExecution', {
      id: incompleteSession.routineId.toString(),
    });
    setVisible(false);
  }, [incompleteSession, resumeSession, navigation]);

  /**
   * Cerrar el modal
   * - Solo cierra el modal, NO borra la sesión
   * - La sesión queda guardada para retomar después
   */
  const handleClose = useCallback(() => {
    console.log('[Modal] 👋 Cerrando modal (sesión sigue guardada)');
    setVisible(false);
  }, []);

  return {
    visible,
    routineName: incompleteSession?.routineName || 'Rutina',
    session: incompleteSession,
    handleContinue,
    handleClose,
  };
}
