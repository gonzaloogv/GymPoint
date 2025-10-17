import { useState } from 'react';
import { 
  useGymSpecialSchedules, 
  useCreateGymSpecialSchedule, 
  useUpdateGymSpecialSchedule,
  useDeleteGymSpecialSchedule 
} from '../../hooks';
import { GymSpecialSchedule, CreateGymSpecialScheduleDTO, COMMON_SPECIAL_SCHEDULE_MOTIVES } from '@/domain';
import { Loading } from './';

interface GymSpecialScheduleManagerProps {
  id_gym: number;
  gymName: string;
}

export const GymSpecialScheduleManager = ({ id_gym, gymName }: GymSpecialScheduleManagerProps) => {
  const { data: specialSchedules, isLoading, error } = useGymSpecialSchedules(id_gym);
  const createMutation = useCreateGymSpecialSchedule();
  const updateMutation = useUpdateGymSpecialSchedule();
  const deleteMutation = useDeleteGymSpecialSchedule();

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<GymSpecialSchedule | null>(null);
  const [formData, setFormData] = useState<CreateGymSpecialScheduleDTO>({
    id_gym,
    date: '',
    opening_time: '08:00',
    closing_time: '22:00',
    closed: false,
    motive: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSchedule) {
        await updateMutation.mutateAsync({
          id_special_schedule: editingSchedule.id_special_schedule,
          ...formData,
        });
        alert('✅ Horario especial actualizado exitosamente');
      } else {
        await createMutation.mutateAsync(formData);
        alert('✅ Horario especial creado exitosamente');
      }
      
      // Reset form
      setShowForm(false);
      setEditingSchedule(null);
      setFormData({
        id_gym,
        date: '',
        opening_time: '08:00',
        closing_time: '22:00',
        closed: false,
        motive: '',
      });
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.error?.message || err.message}`);
    }
  };

  const handleEdit = (schedule: GymSpecialSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      id_gym: schedule.id_gym,
      date: schedule.date,
      opening_time: schedule.opening_time || '08:00',
      closing_time: schedule.closing_time || '22:00',
      closed: schedule.closed,
      motive: schedule.motive,
    });
    setShowForm(true);
  };

  const handleDelete = async (schedule: GymSpecialSchedule) => {
    if (window.confirm(`¿Eliminar horario especial del ${schedule.date}?\n\nMotivo: ${schedule.motive}`)) {
      try {
        await deleteMutation.mutateAsync({ id: schedule.id_special_schedule, id_gym });
        alert('✅ Horario especial eliminado exitosamente');
      } catch (err: any) {
        alert(`❌ Error al eliminar: ${err.response?.data?.error?.message || err.message}`);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setFormData({
      id_gym,
      date: '',
      opening_time: '08:00',
      closing_time: '22:00',
      closed: false,
      motive: '',
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <p className="error-message">Error al cargar horarios especiales: {error.message}</p>;
  }

  // Ordenar por fecha
  const sortedSchedules = [...(specialSchedules || [])].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="gym-special-schedule-manager">
      <div className="special-schedule-header">
        <h3>📆 Horarios Especiales de {gymName}</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary-sm">
            ➕ Agregar Horario Especial
          </button>
        )}
      </div>

      <p className="page-subtitle">
        Configura horarios especiales para feriados, eventos, mantenimiento o cierres temporales.
      </p>

      {showForm && (
        <div className="special-schedule-form-container">
          <h4>{editingSchedule ? '✏️ Editar Horario Especial' : '➕ Nuevo Horario Especial'}</h4>
          <form onSubmit={handleSubmit} className="special-schedule-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">📅 Fecha *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="motive">📝 Motivo *</label>
                <select
                  id="motive"
                  name="motive"
                  value={formData.motive}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar motivo...</option>
                  {COMMON_SPECIAL_SCHEDULE_MOTIVES.map((motive) => (
                    <option key={motive} value={motive}>
                      {motive}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="closed"
                  checked={formData.closed}
                  onChange={handleInputChange}
                />
                <span>🚫 Cerrado todo el día</span>
              </label>
            </div>

            {!formData.closed && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="opening_time">🕐 Hora de Apertura</label>
                  <input
                    type="time"
                    id="opening_time"
                    name="opening_time"
                    value={formData.opening_time || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="closing_time">🕐 Hora de Cierre</label>
                  <input
                    type="time"
                    id="closing_time"
                    name="closing_time"
                    value={formData.closing_time || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingSchedule ? '💾 Actualizar' : '➕ Crear'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="btn-secondary"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="special-schedules-list">
        <h4>Horarios Especiales Configurados ({sortedSchedules.length})</h4>
        {sortedSchedules.length === 0 ? (
          <p className="empty-message">
            📭 No hay horarios especiales configurados. 
            <br />
            Agrega uno para días feriados o eventos especiales.
          </p>
        ) : (
          <div className="special-schedules-grid">
            {sortedSchedules.map((schedule) => (
              <div key={schedule.id_special_schedule} className="special-schedule-card">
                <div className="schedule-card-header">
                  <span className="schedule-date">
                    📅 {new Date(schedule.date + 'T12:00:00').toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {schedule.closed ? (
                    <span className="badge badge-inactive">🚫 Cerrado</span>
                  ) : (
                    <span className="badge badge-active">✅ Abierto</span>
                  )}
                </div>

                <div className="schedule-card-body">
                  <p className="schedule-motive">
                    <strong>Motivo:</strong> {schedule.motive}
                  </p>
                  {!schedule.closed && (
                    <p className="schedule-hours">
                      <strong>Horario:</strong> {schedule.opening_time} - {schedule.closing_time}
                    </p>
                  )}
                </div>

                <div className="schedule-card-actions">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="btn-edit-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(schedule)}
                    className="btn-danger-sm"
                    disabled={deleteMutation.isPending}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


