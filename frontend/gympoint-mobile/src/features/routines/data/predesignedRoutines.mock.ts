import { PredesignedRoutine } from '../domain/entities/PredesignedRoutine';

export const TEMPLATE_ROUTINES: PredesignedRoutine[] = [
  {
    id: 'tmpl-1',
    name: 'Push Pull Legs',
    difficulty: 'Intermedio',
    duration: 67,
    exerciseCount: 8,
    muscleGroups: ['Pecho', 'Hombros', 'Tríceps'],
    source: 'template',
  },
  {
    id: 'tmpl-2',
    name: 'Full Body Beginner',
    difficulty: 'Principiante',
    duration: 52,
    exerciseCount: 6,
    muscleGroups: ['Todo el cuerpo'],
    source: 'template',
  },
  {
    id: 'tmpl-3',
    name: 'Upper/Lower Split',
    difficulty: 'Avanzado',
    duration: 82,
    exerciseCount: 10,
    muscleGroups: ['Pecho', 'Espalda', 'Brazos'],
    source: 'template',
  },
  {
    id: 'tmpl-4',
    name: 'HIIT Cardio',
    difficulty: 'Intermedio',
    duration: 37,
    exerciseCount: 12,
    muscleGroups: ['Cardio', 'Core'],
    source: 'template',
  },
];

export const GYM_ROUTINES: PredesignedRoutine[] = [
  {
    id: 'gym-1',
    name: 'Rutina Smart Fit - Fuerza',
    difficulty: 'Intermedio',
    duration: 60,
    exerciseCount: 7,
    muscleGroups: ['Pecho', 'Tríceps'],
    source: 'gym',
  },
  {
    id: 'gym-2',
    name: 'Power Gym - Hipertrofia',
    difficulty: 'Avanzado',
    duration: 75,
    exerciseCount: 9,
    muscleGroups: ['Espalda', 'Bíceps'],
    source: 'gym',
  },
];
