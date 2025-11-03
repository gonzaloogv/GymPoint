import { useEffect, useState } from 'react';
import { useIncompleteSession } from './useIncompleteSession';
import { ExecutionSession } from '@features/routines/domain/entities/ExecutionSession';

type IncompleteSessionModalState = {
  visible: boolean;
  routineName: string | null;
  session: ExecutionSession | null;
};

/**
 * Hook para manejar el modal de sesión incompleta
 * Recupera la sesión guardada en AsyncStorage y la expone
 */
export const useIncompleteSessionModal = () => {
  const { getIncompleteSession, clearIncompleteSession } = useIncompleteSession();
  const [state, setState] = useState<IncompleteSessionModalState>({
    visible: false,
    routineName: null,
    session: null,
  });

  // Cargar sesión incompleta al montar el componente
  useEffect(() => {
    const loadIncompleteSession = async () => {
      try {
        const session = await getIncompleteSession();
        if (session) {
          setState({
            visible: true,
            routineName: session.routineName,
            session,
          });
        }
      } catch (error) {
        console.error('Error loading incomplete session:', error);
      }
    };

    loadIncompleteSession();
  }, [getIncompleteSession]);

  const handleDiscard = async () => {
    try {
      await clearIncompleteSession();
      setState({
        visible: false,
        routineName: null,
        session: null,
      });
    } catch (error) {
      console.error('Error discarding incomplete session:', error);
    }
  };

  return {
    visible: state.visible,
    routineName: state.routineName,
    session: state.session,
    handleDiscard,
  };
};
