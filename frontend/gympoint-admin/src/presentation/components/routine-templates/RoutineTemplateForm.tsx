import { useState, useEffect, useMemo } from 'react';
import { RoutineTemplate, CreateRoutineTemplateDTO, UpdateRoutineTemplateDTO, Exercise, DIFFICULTY_OPTIONS, RoutineDifficulty } from '@/domain';
import { Card, Button, Input, Select, Textarea } from '../ui';

type FormData = {
  routine_name: string;
  description: string;
  recommended_for: RoutineDifficulty;
  template_order: number;
  selectedExercises: { id_exercise: number; series: number; reps: number; order: number }[];
};

interface RoutineTemplateFormProps {
  template?: RoutineTemplate | null;
  exercises: Exercise[];
  onSubmit: (data: Omit<CreateRoutineTemplateDTO, 'exercises'> | CreateRoutineTemplateDTO) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const RoutineTemplateForm: React.FC<RoutineTemplateFormProps> = ({
  template,
  exercises,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<FormData>({
    routine_name: '',
    description: '',
    recommended_for: 'BEGINNER',
    template_order: 0,
    selectedExercises: [],
  });

  useEffect(() => {
    if (template) {
      setFormData({
        routine_name: template.routine_name,
        description: template.description || '',
        recommended_for: template.recommended_for || 'BEGINNER',
        template_order: template.template_order,
        selectedExercises: [], // Exercises are not loaded in edit mode in the original component
      });
    } else {
        setFormData({
            routine_name: '',
            description: '',
            recommended_for: 'BEGINNER',
            template_order: 0,
            selectedExercises: [],
        });
    }
  }, [template]);

  const exerciseNameMap = useMemo(() => {
    const map = new Map<number, string>();
    (exercises || []).forEach(ex => map.set(ex.id_exercise, ex.exercise_name));
    return map;
  }, [exercises]);

  const addExercise = (exerciseId: number) => {
    if (formData.selectedExercises.some(e => e.id_exercise === exerciseId)) return;
    setFormData(prev => ({
      ...prev,
      selectedExercises: [...prev.selectedExercises, { id_exercise: exerciseId, series: 3, reps: 10, order: prev.selectedExercises.length + 1 }],
    }));
  };

  const removeExercise = (exerciseId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises
        .filter(e => e.id_exercise !== exerciseId)
        .map((e, i) => ({ ...e, order: i + 1 })),
    }));
  };

  const updateExerciseDetails = (exerciseId: number, field: 'series' | 'reps', value: number) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.map(e =>
        e.id_exercise === exerciseId ? { ...e, [field]: value } : e
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template && formData.selectedExercises.length === 0) {
      alert('❌ Debes agregar al menos 1 ejercicio al crear una nueva plantilla.');
      return;
    }
    
    const baseData = {
        routine_name: formData.routine_name,
        description: formData.description,
        recommended_for: formData.recommended_for,
        template_order: formData.template_order,
    };

    const dataToSubmit = !template 
      ? { ...baseData, exercises: formData.selectedExercises }
      : baseData;

    onSubmit(dataToSubmit);
  };

  return (
    <Card title={template ? '✏️ Editar Plantilla' : '➕ Nueva Plantilla'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="Nombre de la Rutina *" name="routine_name" value={formData.routine_name} onChange={e => setFormData({ ...formData, routine_name: e.target.value })} required />
          <Select label="Dificultad *" name="recommended_for" value={formData.recommended_for} onChange={e => setFormData({ ...formData, recommended_for: e.target.value as RoutineDifficulty })} options={DIFFICULTY_OPTIONS.map(o => ({ value: o.value, label: `${o.icon} ${o.label}` }))} />
          <Input label="Orden" type="number" name="template_order" value={formData.template_order} onChange={e => setFormData({ ...formData, template_order: Number(e.target.value) })} />
        </div>
        <Textarea label="Descripción" name="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
        
        {!template && (
          <Card title={`Ejercicios (${formData.selectedExercises.length})`}>
            <div className="space-y-4">
              {formData.selectedExercises.map(ex => (
                <div key={ex.id_exercise} className="flex items-center gap-4 p-2 bg-bg dark:bg-bg-dark rounded-lg border border-border dark:border-border-dark">
                  <span className="font-bold">#{ex.order}</span>
                  <span className="flex-1 truncate" title={exerciseNameMap.get(ex.id_exercise)}>{exerciseNameMap.get(ex.id_exercise) || `Ejercicio #${ex.id_exercise}`}</span>
                  <Input label="Series" type="number" value={ex.series} onChange={e => updateExerciseDetails(ex.id_exercise, 'series', Number(e.target.value))} className="w-20" />
                  <Input label="Reps" type="number" value={ex.reps} onChange={e => updateExerciseDetails(ex.id_exercise, 'reps', Number(e.target.value))} className="w-20" />
                  <Button variant="danger" size="sm" onClick={() => removeExercise(ex.id_exercise)}>🗑️</Button>
                </div>
              ))}
              <Select 
                label="Agregar Ejercicio" 
                value={ '' }
                onChange={e => { if (e.target.value) { addExercise(Number(e.target.value)); } }} 
                options={[{ value: '', label: '-- Selecciona --' }, ...(exercises || []).map(ex => ({ value: ex.id_exercise, label: `${ex.exercise_name} (${ex.muscular_group})`, disabled: formData.selectedExercises.some(e => e.id_exercise === ex.id_exercise) }))]} 
              />
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {template ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
