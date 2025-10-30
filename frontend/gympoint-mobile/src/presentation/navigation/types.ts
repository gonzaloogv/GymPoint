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
  Progreso: undefined;
  Usuario: undefined;
};

export type RoutinesStackParamList = {
  RoutinesList: undefined;
  CreateRoutine: undefined;
  ImportRoutine: undefined;
  RoutineDetail: { id: string };
  RoutineHistory: { id: string };
  RoutineExecution: { id: string };
};

export type GymsStackParamList = {
  GymsList: undefined;
  GymDetail: { gymId: number };
};

export type ProgressStackParamList = {
  ProgressMain: undefined;
  PhysicalProgress: undefined;
  ExerciseProgress: undefined;
  Achievements: undefined;
};
