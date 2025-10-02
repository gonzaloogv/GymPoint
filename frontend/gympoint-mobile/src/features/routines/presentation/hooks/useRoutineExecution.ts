import { useEffect, useMemo, useState } from 'react';

import { Exercise } from '@features/routines/domain/entities';
import { useRoutineById } from './useRoutineById';

type UseRoutineExecutionParams = {
  id?: string;
  onComplete?: () => void;
};

type UseRoutineExecutionResult = {
  routineName: string;
  currentExercise: Exercise;
  exerciseIndex: number;
  totalExercises: number;
  totalSets: number;
  currentSet: number;
  restSeconds: number;
  progressPct: number;
  goToPrevious: () => void;
  goToNext: () => void;
  completeSet: () => void;
};

export const useRoutineExecution = ({ id, onComplete }: UseRoutineExecutionParams): UseRoutineExecutionResult => {
  const routine = useRoutineById(id);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restSeconds, setRestSeconds] = useState(0);

  const exercises = routine.exercises;
  const totalExercises = exercises.length;
  const currentExercise = exercises[exerciseIndex] as Exercise;

  const totalSets = useMemo(() => {
    const sets = currentExercise.sets;
    if (typeof sets === 'number') {
      return sets;
    }
    const parsed = parseInt(String(sets), 10);
    return Number.isFinite(parsed) ? parsed : 1;
  }, [currentExercise]);

  useEffect(() => {
    setCurrentSet(1);
    setRestSeconds(0);
  }, [exerciseIndex]);

  useEffect(() => {
    if (restSeconds <= 0) {
      return;
    }
    const timer = setInterval(() => setRestSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [restSeconds]);

  const progressPct = (exerciseIndex / totalExercises) * 100;

  const goToPrevious = () => setExerciseIndex((index) => Math.max(0, index - 1));

  const goToNext = () => setExerciseIndex((index) => Math.min(totalExercises - 1, index + 1));

  const completeSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet((set) => set + 1);
      setRestSeconds(currentExercise.rest ?? 0);
      return;
    }

    if (exerciseIndex < totalExercises - 1) {
      setExerciseIndex((index) => index + 1);
      setRestSeconds(0);
      return;
    }

    onComplete?.();
  };

  return {
    routineName: routine.name,
    currentExercise,
    exerciseIndex,
    totalExercises,
    totalSets,
    currentSet,
    restSeconds,
    progressPct,
    goToPrevious,
    goToNext,
    completeSet,
  };
};
