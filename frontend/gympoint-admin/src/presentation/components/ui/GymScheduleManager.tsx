import { useState } from 'react';
import { useGymSchedules, useCreateGymSchedule, useUpdateGymSchedule } from '@/presentation/hooks';
import { DAYS_OF_WEEK, GymSchedule } from '@/domain';

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
        // Actualizar existente
        await updateMutation.mutateAsync({
          id_schedule: schedule.id_schedule,
          ...formData,
        });
      } else {
        // Crear nuevo
        await createMutation.mutateAsync({
          id_gym,
          day_of_week: editingDay,
          ...formData,
        });
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
    return <div className="loading-schedules">Cargando horarios...</div>;
  }

  return (
    <div className="gym-schedule-manager">
      <h3>📅 Horarios de {gymName}</h3>
      
      <div className="schedule-table">
        <div className="schedule-header">
          <div className="schedule-col">Día</div>
          <div className="schedule-col">Apertura</div>
          <div className="schedule-col">Cierre</div>
          <div className="schedule-col">Estado</div>
          <div className="schedule-col">Acciones</div>
        </div>

        {DAYS_OF_WEEK.map((day) => {
          const schedule = getScheduleForDay(day);
          const isEditing = editingDay === day;

          return (
            <div key={day} className={`schedule-row ${isEditing ? 'editing' : ''}`}>
              <div className="schedule-col day-col">
                <strong>{day}</strong>
              </div>

              {isEditing ? (
                <>
                  <div className="schedule-col">
                    <input
                      type="time"
                      value={formData.opening_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, opening_time: e.target.value }))}
                      disabled={formData.closed}
                    />
                  </div>
                  <div className="schedule-col">
                    <input
                      type="time"
                      value={formData.closing_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, closing_time: e.target.value }))}
                      disabled={formData.closed}
                    />
                  </div>
                  <div className="schedule-col">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.closed}
                        onChange={(e) => setFormData(prev => ({ ...prev, closed: e.target.checked }))}
                      />
                      <span>Cerrado</span>
                    </label>
                  </div>
                  <div className="schedule-col actions-col">
                    <button 
                      onClick={handleSave} 
                      className="btn-save-sm"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      💾 Guardar
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="btn-cancel-sm"
                    >
                      ✕
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="schedule-col">
                    {schedule?.closed ? '-' : schedule?.opening_time || 'No configurado'}
                  </div>
                  <div className="schedule-col">
                    {schedule?.closed ? '-' : schedule?.closing_time || 'No configurado'}
                  </div>
                  <div className="schedule-col">
                    <span className={`status-badge ${schedule?.closed ? 'closed' : 'open'}`}>
                      {schedule?.closed ? '🔒 Cerrado' : schedule ? '✅ Abierto' : '⚠️ Sin configurar'}
                    </span>
                  </div>
                  <div className="schedule-col actions-col">
                    <button 
                      onClick={() => handleEdit(day)} 
                      className="btn-edit-sm"
                    >
                      ✏️ Editar
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="schedule-info">
        <p>💡 <strong>Consejo:</strong> Configura los horarios de apertura y cierre para cada día de la semana. Los días marcados como "Cerrado" no mostrarán horarios.</p>
      </div>
    </div>
  );
};




