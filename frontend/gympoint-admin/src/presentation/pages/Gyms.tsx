import { useState } from 'react';
import { useGyms, useCreateGym, useUpdateGym, useDeleteGym, useGymTypes } from '../hooks';
import { Card, Loading, Button, Input, Select } from '../components';
import { GymForm } from '../components/ui/GymForm';
import { GymCard } from '../components/ui/GymCard';
import { GymScheduleManager } from '../components/ui/GymScheduleManager';
import { GymSpecialScheduleManager } from '../components/ui/GymSpecialScheduleManager';
import { CreateGymDTO, UpdateGymDTO, Gym } from '@/domain';

export const Gyms = () => {
  const { data: gyms, isLoading } = useGyms();
  const { data: gymTypes } = useGymTypes();
  const createGymMutation = useCreateGym();
  const updateGymMutation = useUpdateGym();
  const deleteGymMutation = useDeleteGym();

  const [showForm, setShowForm] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [managingScheduleGym, setManagingScheduleGym] = useState<Gym | null>(null);
  const [managingSpecialScheduleGym, setManagingSpecialScheduleGym] = useState<Gym | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const handleSubmit = async (data: CreateGymDTO | UpdateGymDTO) => {
    try {
      if (editingGym) {
        await updateGymMutation.mutateAsync(data as UpdateGymDTO);
        alert('✅ Gimnasio actualizado exitosamente');
      } else {
        await createGymMutation.mutateAsync(data as CreateGymDTO);
        alert('✅ Gimnasio creado exitosamente');
      }
      setShowForm(false);
      setEditingGym(null);
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'Ocurrió un error'}`);
    }
  };

  const handleEdit = (gym: Gym) => {
    setEditingGym(gym);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      await deleteGymMutation.mutateAsync(id);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGym(null);
  };

  const filteredGyms = gyms?.filter(gym => 
    (gym.name.toLowerCase().includes(searchTerm.toLowerCase()) || gym.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterCity || gym.city === filterCity)
  );

  const cities = Array.from(new Set(gyms?.map(g => g.city) || [])).sort();
  const cityOptions = [{ value: '', label: 'Todas las ciudades' }, ...cities.map(c => ({ value: c, label: c }))];

  if (isLoading) return <Loading fullPage />;

  if (managingScheduleGym) {
    return (
      <div className="p-6">
        <Button onClick={() => setManagingScheduleGym(null)} variant="secondary" className="mb-6">← Volver</Button>
        <GymScheduleManager id_gym={managingScheduleGym.id_gym} gymName={managingScheduleGym.name} />
      </div>
    );
  }

  if (managingSpecialScheduleGym) {
    return (
      <div className="p-6">
        <Button onClick={() => setManagingSpecialScheduleGym(null)} variant="secondary" className="mb-6">← Volver</Button>
        <GymSpecialScheduleManager id_gym={managingSpecialScheduleGym.id_gym} gymName={managingSpecialScheduleGym.name} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Gestión de Gimnasios</h1>
          <p className="text-text-muted">{gyms?.length || 0} gimnasios registrados</p>
        </div>
        <Button onClick={() => { setEditingGym(null); setShowForm(!showForm); }} variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? '✕ Cancelar' : '+ Nuevo Gimnasio'}
        </Button>
      </header>

      {showForm ? (
        <Card as="section" title={editingGym ? `Editar: ${editingGym.name}` : 'Crear Nuevo Gimnasio'}>
          <GymForm
            gym={editingGym || undefined}
            gymTypes={gymTypes || []}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            isLoading={createGymMutation.isPending || updateGymMutation.isPending}
          />
        </Card>
      ) : (
        <section className="space-y-6" aria-label="Lista de Gimnasios">
          <Card>
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label="🔍 Buscar"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Select
                label="📍 Ciudad"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                options={cityOptions}
              />
              {(searchTerm || filterCity) && (
                <Button onClick={() => { setSearchTerm(''); setFilterCity(''); }} variant="secondary">Limpiar</Button>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGyms?.map((gym) => (
              <GymCard
                key={gym.id_gym}
                gym={gym}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageSchedule={setManagingScheduleGym}
                onManageSpecialSchedule={setManagingSpecialScheduleGym}
                isDeleting={deleteGymMutation.isPending && deleteGymMutation.variables === gym.id_gym}
              />
            ))}
          </div>

          {(!filteredGyms || filteredGyms.length === 0) && (
            <div className="text-center py-16 text-text-muted">
              <p>{searchTerm || filterCity ? 'No se encontraron gimnasios con los filtros aplicados' : 'No hay gimnasios registrados. ¡Crea el primero!'}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
