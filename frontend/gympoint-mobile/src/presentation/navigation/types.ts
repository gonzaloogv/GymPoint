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
  RoutineCompleted: {
    routineId: string;
    routineName: string;
    duration: number;
    totalVolume: number;
    setsCompleted: number;
    totalSets: number;
    tokensEarned?: number;
    streak?: number;
  };
};

export type GymsStackParamList = {
  GymsList: undefined;
  GymDetail: { gymId: string };
};

export type ProgressStackParamList = {
  ProgressMain: undefined;
  PhysicalProgress: undefined;
  ExerciseProgress: undefined;
  TokenHistory: undefined;
  Achievements: undefined;
};
