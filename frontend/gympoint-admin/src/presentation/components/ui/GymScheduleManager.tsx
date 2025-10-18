import { useState } from 'react';
import { useGymSchedules, useCreateGymSchedule, useUpdateGymSchedule } from '@/presentation/hooks';
import { DAYS_OF_WEEK, GymSchedule } from '@/domain';
import { Button, Input, Loading, Badge } from './index';

interface GymScheduleManagerProps {
  id_gym: number;
  gymName: string;
}

export const GymScheduleManager = ({ id_gym, gymName }: GymScheduleManagerProps) => {
  const { data: schedules, isLoading } = useGymSchedules(id_gym);
  const createMutation = useCreateGymSchedule();
  const updateMutation = useUpdateGymSchedule();

  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    opening_time: string;
    closing_time: string;
    closed: boolean;
  }>({
    opening_time: '',
    closing_time: '',
    closed: false,
  });

  const getScheduleForDay = (day: string): GymSchedule | undefined => {
    return schedules?.find(s => s.day_of_week === day);
  };

  const handleEdit = (day: string) => {
    const schedule = getScheduleForDay(day);
    if (schedule) {
      setFormData({
        opening_time: schedule.opening_time || '',
        closing_time: schedule.closing_time || '',
        closed: schedule.closed,
      });
    } else {
      setFormData({
        opening_time: '08:00',
        closing_time: '22:00',
        closed: false,
      });
    }
    setEditingDay(day);
  };

  const handleSave = async () => {
    if (!editingDay) return;
    try {
      const schedule = getScheduleForDay(editingDay);
      if (schedule) {
        await updateMutation.mutateAsync({ id_schedule: schedule.id_schedule, ...formData });
      } else {
        await createMutation.mutateAsync({ id_gym, day_of_week: editingDay, ...formData });
      }
      setEditingDay(null);
      alert('✅ Horario guardado correctamente');
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo guardar el horario'}`);
    }
  };

  const handleCancel = () => {
    setEditingDay(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-card dark:bg-card-dark p-6 rounded-xl border border-border dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">📅 Horarios de {gymName}</h3>
      
      <div className="space-y-2">
        {/* Header */}
        <div className="hidden md:grid grid-cols-5 gap-4 font-semibold text-text dark:text-text-dark p-2 bg-bg dark:bg-bg-dark rounded-lg">
          <div>Día</div>
          <div>Apertura</div>
          <div>Cierre</div>
          <div>Estado</div>
          <div className="text-right">Acciones</div>
        </div>

        {DAYS_OF_WEEK.map((day) => {
          const schedule = getScheduleForDay(day);
          const isEditing = editingDay === day;

          return (
            <div key={day} className={`grid grid-cols-1 md:grid-cols-5 gap-4 items-center p-3 rounded-lg text-text dark:text-text-dark ${isEditing ? 'bg-primary/10' : 'hover:bg-bg dark:hover:bg-bg-dark'}`}>
              <div className="font-bold">{day}</div>

              {isEditing ? (
                <>
                  <div>
                    <Input
                      type="time"
                      value={formData.opening_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, opening_time: e.target.value }))}
                      disabled={formData.closed}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="time"
                      value={formData.closing_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, closing_time: e.target.value }))}
                      disabled={formData.closed}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`closed-${day}`}
                      checked={formData.closed}
                      onChange={(e) => setFormData(prev => ({ ...prev, closed: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-input-bg dark:bg-input-bg-dark border-input-border dark:border-input-border-dark rounded focus:ring-primary"
                    />
                    <label htmlFor={`closed-${day}`} className="text-sm font-medium text-text dark:text-text-dark">Cerrado</label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={handleSave} size="sm" variant="success" disabled={createMutation.isPending || updateMutation.isPending}>💾</Button>
                    <Button onClick={handleCancel} size="sm" variant="secondary">✕</Button>
                  </div>
                </>
              ) : (
                <>
                  <div>{schedule?.closed ? '-' : schedule?.opening_time || 'N/A'}</div>
                  <div>{schedule?.closed ? '-' : schedule?.closing_time || 'N/A'}</div>
                  <div>
                    <Badge variant={schedule ? (schedule.closed ? 'inactive' : 'active') : 'warning'}>
                      {schedule ? (schedule.closed ? '🔒 Cerrado' : '✅ Abierto') : '⚠️ Sin configurar'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <Button onClick={() => handleEdit(day)} size="sm" variant="primary">✏️ Editar</Button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-primary/10 dark:bg-primary/20 text-primary border-l-4 border-primary rounded-r-lg">
        <p>💡 <strong>Consejo:</strong> Configura los horarios para cada día. Los días sin configurar o cerrados no estarán disponibles para los usuarios.</p>
      </div>
    </div>
  );
};
