import { RoutineDTO, RoutineSessionDTO } from '../dto/RoutineDTO';

// Mock data basado en mocks/routines.mock.ts
const mockRoutinesData: RoutineDTO[] = [
  {
    id: '1',
    name: 'Push - Pecho y Tríceps',
    status: 'Active',
    exercises: [
      {
        id: '1',
        name: 'Press banca',
        sets: 4,
        reps: '8-10',
        rest: 120,
        muscleGroups: ['Pecho', 'Tríceps'],
      },
      {
        id: '2',
        name: 'Press inclinado',
        sets: 3,
        reps: '10-12',
        rest: 90,
        muscleGroups: ['Pecho'],
      },
      {
        id: '3',
        name: 'Fondos',
        sets: 3,
        reps: 'al fallo',
        rest: 90,
        muscleGroups: ['Pecho', 'Tríceps'],
      },
      {
        id: '4',
        name: 'Press francés',
        sets: 3,
        reps: '12-15',
        rest: 60,
        muscleGroups: ['Tríceps'],
      },
    ],
    estimatedDuration: 65,
    lastPerformed: '2025-09-25',
    difficulty: 'Intermedio',
    muscleGroups: ['Pecho', 'Tríceps', 'Hombros'],
  },
  {
    id: '2',
    name: 'Pull - Espalda y Bíceps',
    status: 'Scheduled',
    exercises: [
      {
        id: '5',
        name: 'Dominadas',
        sets: 4,
        reps: '6-8',
        rest: 120,
        muscleGroups: ['Espalda', 'Bíceps'],
      },
      {
        id: '6',
        name: 'Remo barra',
        sets: 4,
        reps: '8-10',
        rest: 90,
        muscleGroups: ['Espalda'],
      },
      {
        id: '7',
        name: 'Curl barra',
        sets: 3,
        reps: '10-12',
        rest: 60,
        muscleGroups: ['Bíceps'],
      },
    ],
    estimatedDuration: 55,
    nextScheduled: '2025-09-30',
    difficulty: 'Intermedio',
    muscleGroups: ['Espalda', 'Bíceps'],
  },
  {
    id: '3',
    name: 'Legs - Piernas completo',
    status: 'Completed',
    exercises: [
      {
        id: '8',
        name: 'Sentadilla',
        sets: 5,
        reps: '5',
        rest: 180,
        muscleGroups: ['Piernas'],
      },
      {
        id: '9',
        name: 'Prensa',
        sets: 4,
        reps: '10-12',
        rest: 120,
        muscleGroups: ['Piernas'],
      },
      {
        id: '10',
        name: 'Peso muerto rumano',
        sets: 3,
        reps: '8-10',
        rest: 120,
        muscleGroups: ['Isquios'],
      },
    ],
    estimatedDuration: 70,
    lastPerformed: '2025-09-27',
    difficulty: 'Intermedio',
    muscleGroups: ['Cuádriceps', 'Isquios', 'Glúteos'],
  },
];

export class RoutineLocal {
  private sessions: RoutineSessionDTO[] = [];

  async fetchAll(): Promise<RoutineDTO[]> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockRoutinesData];
  }

  async fetchById(id: string): Promise<RoutineDTO> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const routine = mockRoutinesData.find((r) => r.id === id);
    if (!routine) {
      throw new Error(`Routine with id ${id} not found`);
    }
    return { ...routine };
  }

  async fetchHistory(routineId: string): Promise<RoutineSessionDTO[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.sessions.filter((s) => s.routineId === routineId);
  }

  async saveSession(session: RoutineSessionDTO): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.sessions.push(session);
  }
}
