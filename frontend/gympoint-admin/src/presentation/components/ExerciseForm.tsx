import { useState, useEffect } from 'react';
import { Exercise, CreateExerciseDTO, UpdateExerciseDTO } from '@/domain';
import { Input, Select, Textarea, Button, Card } from './ui';

interface ExerciseFormProps {
  exercise?: Exercise | null;
  onSubmit: (data: CreateExerciseDTO | UpdateExerciseDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const initialFormData: CreateExerciseDTO = {
  exercise_name: '',
  description: '',
  muscular_group: '',
  equipment_needed: '',
  difficulty: '',
  instructions: '',
  video_url: '',
};

export const ExerciseForm = ({ exercise, onSubmit, onCancel, isSubmitting }: ExerciseFormProps) => {
  const [formData, setFormData] = useState<CreateExerciseDTO>(initialFormData);

  useEffect(() => {
    if (exercise) {
      setFormData({
        exercise_name: exercise.exercise_name,
        description: exercise.description || '',
        muscular_group: exercise.muscular_group || '',
        equipment_needed: exercise.equipment_needed || '',
        difficulty: exercise.difficulty || '',
        instructions: exercise.instructions || '',
        video_url: exercise.video_url || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [exercise]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = exercise ? { ...formData, id_exercise: exercise.id_exercise } : formData;
    onSubmit(dataToSubmit);
  };

  return (
    <Card title={exercise ? '✏️ Editar Ejercicio' : '➕ Nuevo Ejercicio'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Nombre *" name="exercise_name" value={formData.exercise_name} onChange={handleInputChange} required />
          <Input label="Grupo Muscular" name="muscular_group" value={formData.muscular_group} onChange={handleInputChange} />
          <Input label="Equipamiento" name="equipment_needed" value={formData.equipment_needed} onChange={handleInputChange} />
          <Select 
            label="Dificultad" 
            name="difficulty" 
            value={formData.difficulty} 
            onChange={handleInputChange} 
            options={[
              {value: '', label: 'Seleccionar'},
              {value: 'Principiante', label: 'Principiante'},
              {value: 'Intermedio', label: 'Intermedio'},
              {value: 'Avanzado', label: 'Avanzado'}
            ]} 
          />
        </div>
        <Textarea label="Descripción" name="description" value={formData.description} onChange={handleInputChange} rows={2} />
        <Textarea label="Instrucciones" name="instructions" value={formData.instructions} onChange={handleInputChange} rows={4} />
        <Input label="URL de Video" name="video_url" type="url" value={formData.video_url} onChange={handleInputChange} />
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : exercise ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
