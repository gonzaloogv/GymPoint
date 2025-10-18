import { useState } from 'react';
import { 
  useGymSpecialSchedules, 
  useCreateGymSpecialSchedule, 
  useUpdateGymSpecialSchedule,
  useDeleteGymSpecialSchedule 
} from '../../hooks';
import { GymSpecialSchedule, CreateGymSpecialScheduleDTO, COMMON_SPECIAL_SCHEDULE_MOTIVES } from '@/domain';
import { Input, Select, Button, Card, Badge, Loading, Alert } from './index';

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
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await updateMutation.mutateAsync({ id_special_schedule: editingSchedule.id_special_schedule, ...formData });
        alert('✅ Horario especial actualizado exitosamente');
      } else {
        await createMutation.mutateAsync(formData);
        alert('✅ Horario especial creado exitosamente');
      }
      handleCancel();
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
    setFormData({ id_gym, date: '', opening_time: '08:00', closing_time: '22:00', closed: false, motive: '' });
  };

  if (isLoading) return <Loading />;
  if (error) return <Alert type="error" message={`Error al cargar horarios especiales: ${error.message}`} />;

  const sortedSchedules = [...(specialSchedules || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const motiveOptions = COMMON_SPECIAL_SCHEDULE_MOTIVES.map(m => ({ value: m, label: m }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-text dark:text-text-dark">📆 Horarios Especiales de {gymName}</h3>
        {!showForm && <Button onClick={() => setShowForm(true)} variant="primary" size="sm">➕ Agregar</Button>}
      </div>

      {showForm && (
        <Card>
          <h4 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">{editingSchedule ? '✏️ Editar Horario Especial' : '➕ Nuevo Horario Especial'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="📅 Fecha *" type="date" name="date" value={formData.date} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]} />
              <Select label="📝 Motivo *" name="motive" value={formData.motive} onChange={handleInputChange} required options={motiveOptions} placeholder="Seleccionar motivo..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="closed" name="closed" checked={formData.closed} onChange={handleInputChange} className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary" />
              <label htmlFor="closed" className="text-sm font-medium text-text dark:text-text-dark">🚫 Cerrado todo el día</label>
            </div>
            {!formData.closed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="🕐 Hora de Apertura" type="time" name="opening_time" value={formData.opening_time || ''} onChange={handleInputChange} />
                <Input label="🕐 Hora de Cierre" type="time" name="closing_time" value={formData.closing_time || ''} onChange={handleInputChange} />
              </div>
            )}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={handleCancel}>❌ Cancelar</Button>
              <Button type="submit" variant="primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingSchedule ? '💾 Actualizar' : '➕ Crear'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div>
        <h4 className="text-lg font-semibold mb-2 text-text dark:text-text-dark">Horarios Especiales Configurados ({sortedSchedules.length})</h4>
        {sortedSchedules.length === 0 ? (
          <p className="text-center text-text-muted py-8">📭 No hay horarios especiales configurados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSchedules.map((schedule) => (
              <Card key={schedule.id_special_schedule}>
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-text dark:text-text-dark">
                    📅 {new Date(schedule.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <Badge variant={schedule.closed ? 'inactive' : 'active'}>{schedule.closed ? '🚫 Cerrado' : '✅ Abierto'}</Badge>
                </div>
                <div className="my-4 text-text dark:text-text-dark">
                  <p className="text-sm"><strong>Motivo:</strong> {schedule.motive}</p>
                  {!schedule.closed && <p className="text-sm"><strong>Horario:</strong> {schedule.opening_time} - {schedule.closing_time}</p>}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button onClick={() => handleEdit(schedule)} variant="primary" size="sm" className="flex-1">✏️ Editar</Button>
                  <Button onClick={() => handleDelete(schedule)} variant="danger" size="sm" disabled={deleteMutation.isPending} className="flex-1">🗑️ Eliminar</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
