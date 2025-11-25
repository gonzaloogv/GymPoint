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
 *
 * Fix: Agrega loading state para prevenir parpadeo del modal
 * El problema era que el modal se renderizaba antes de cargar AsyncStorage,
 * causando un flash visual (visible=false → visible=true).
 */
export function useIncompleteSessionModal() {
  const navigation = useNavigation<NativeStackNavigationProp<RoutinesStackParamList>>();
  const route = useRoute();
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Previene render prematuro
  const {
    incompleteSession,
    loadIncompleteSession,
    discardSession,
    resumeSession,
  } = useRoutinesStore();

  // Cargar sesión incompleta al montar
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        await loadIncompleteSession();
      } catch (error) {
        console.error('[Modal] Error loading incomplete session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [loadIncompleteSession]);

  // Mostrar modal si hay sesión incompleta Y no estamos en pantalla de ejecución
  // SOLO después de que termine el loading
  useEffect(() => {
    if (isLoading) return; // Esperar a que termine la carga

    const isExecutionScreen = route.name === 'RoutineExecution' || route.name === 'RoutineCompleted';

    if (incompleteSession && !isExecutionScreen) {
      // Fix: No mostrar el modal si la sesión fue creada hace menos de 2 segundos
      // Esto evita el race condition cuando se navega de RoutinesList → RoutineExecution
      // El problema: startExecution guarda la sesión antes de que route.name se actualice
      const sessionAge = Date.now() - new Date(incompleteSession.startedAt).getTime();
      const isRecentlyCreated = sessionAge < 2000; // 2 segundos

      if (isRecentlyCreated) {
        console.log('[Modal] Sesión recién creada, asumiendo navegación en progreso');
        setVisible(false);
      } else {
        console.log('[Modal] Sesión incompleta detectada:', incompleteSession.routineName);
        setVisible(true);
      }
    } else {
      setVisible(false);
    }
  }, [incompleteSession, route.name, isLoading]);

  /**
   * Continuar con la sesión incompleta
   * - Restaura el estado de ejecución
   * - Navega a la pantalla de ejecución
   * - Cierra el modal
   */
  const handleContinue = useCallback(() => {
    if (!incompleteSession) return;

    console.log('[Modal] Continuing incomplete session');
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
    console.log('[Modal] Closing modal (session remains saved)');
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
