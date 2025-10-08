// Navigation types for the app
export type RootStackParamList = {
  App: undefined;
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Inicio: undefined;
  Rutinas: undefined;
  Mapa: undefined;
  Recompensa: undefined;
  Usuario: undefined;
};

export type RoutinesStackParamList = {
  RoutinesList: undefined;
  CreateRoutine: undefined;
  RoutineDetail: { id: string };
  RoutineHistory: { id: string };
  RoutineExecution: { id: string };
};

export type GymsStackParamList = {
  GymsList: undefined;
  GymDetail: { gymId: string };
};
