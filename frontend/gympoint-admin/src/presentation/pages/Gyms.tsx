import { useState, useMemo } from 'react';
import { useGyms, useCreateGym, useUpdateGym, useDeleteGym, useGymTypes } from '../hooks';
import { Card, Loading, Button, GymsList } from '../components';
import { GymForm } from '../components/ui/GymForm';
import { GymCard } from '../components/ui/GymCard';
import { GymScheduleManager } from '../components/ui/GymScheduleManager';
import { GymSpecialScheduleManager } from '../components/ui/GymSpecialScheduleManager';
import { CreateGymDTO, UpdateGymDTO, Gym } from '@/domain';

export const Gyms = () => {
  const { data: gyms, isLoading, isError, error } = useGyms();
  const createGymMutation = useCreateGym();
  const updateGymMutation = useUpdateGym();
  const deleteGymMutation = useDeleteGym();

  const [showForm, setShowForm] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [managingScheduleGym, setManagingScheduleGym] = useState<Gym | null>(null);
  const [managingSpecialScheduleGym, setManagingSpecialScheduleGym] = useState<Gym | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const handleApiError = (error: any, context: string) => {
    const errorMessage = error.response?.data?.error?.message || 'OcurriÃ³ un error inesperado';
    console.error(`Error en ${context}:`, error);
    alert(`âŒ Error en ${context}: ${errorMessage}`);
  };

  const handleSubmit = async (data: CreateGymDTO | UpdateGymDTO) => {
    try {
      if (editingGym) {
        await updateGymMutation.mutateAsync(data as UpdateGymDTO);
        alert('âœ… Gimnasio actualizado exitosamente');
      } else {
        await createGymMutation.mutateAsync(data as CreateGymDTO);
        alert('âœ… Gimnasio creado exitosamente');
      }
      setShowForm(false);
      setEditingGym(null);
    } catch (error) {
      handleApiError(error, editingGym ? 'actualizaciÃ³n' : 'creaciÃ³n');
    }
  };

  const handleEdit = (gym: Gym) => {
    setEditingGym(gym);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Â¿EstÃ¡s seguro de que deseas eliminar "${name}"?`)) {
      try {
        await deleteGymMutation.mutateAsync(id);
        alert('âœ… Gimnasio eliminado exitosamente');
      } catch (error) {
        handleApiError(error, 'eliminaciÃ³n');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGym(null);
  };

  const filteredGyms = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    return gyms?.filter((gym) => {
      const matchesSearch =
        gym.name.toLowerCase().includes(normalizedSearch) ||
        gym.description.toLowerCase().includes(normalizedSearch) ||
        (Array.isArray(gym.rules) && gym.rules.some((rule) => rule.toLowerCase().includes(normalizedSearch)));

      const matchesCity = !filterCity || gym.city === filterCity;
      return matchesSearch && matchesCity;
    });
  }, [gyms, searchTerm, filterCity]);

  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(gyms?.map(g => g.city) || [])).sort();
    return [{ value: '', label: 'Todas las ciudades' }, ...cities.map(c => ({ value: c, label: c }))];
  }, [gyms]);

  if (isLoading) return <Loading fullPage />;

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>âŒ Error al cargar los gimnasios.</p>
        <p className="text-sm text-text-muted">{error.message}</p>
      </div>
    );
  }

  if (managingScheduleGym) {
    return (
      <div className="p-6">
        <Button onClick={() => setManagingScheduleGym(null)} variant="secondary" className="mb-6">â† Volver</Button>
        <GymScheduleManager id_gym={managingScheduleGym.id_gym} gymName={managingScheduleGym.name} />
      </div>
    );
  }

  if (managingSpecialScheduleGym) {
    return (
      <div className="p-6">
        <Button onClick={() => setManagingSpecialScheduleGym(null)} variant="secondary" className="mb-6">â† Volver</Button>
        <GymSpecialScheduleManager id_gym={managingSpecialScheduleGym.id_gym} gymName={managingSpecialScheduleGym.name} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">GestiÃ³n de Gimnasios</h1>
          <p className="text-text-muted">{gyms?.length || 0} gimnasios registrados</p>
        </div>
        <Button onClick={() => { setEditingGym(null); setShowForm(!showForm); }} variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? 'âœ• Cancelar' : '+ Nuevo Gimnasio'}
        </Button>
      </header>

      {showForm ? (
        <Card as="section" title={editingGym ? `Editar: ${editingGym.name}` : 'Crear Nuevo Gimnasio'}>
          <GymForm
            gym={editingGym || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            isLoading={createGymMutation.isPending || updateGymMutation.isPending}
          />
        </Card>
      ) : (
        <GymsList 
          gyms={filteredGyms || []}
          cityOptions={cityOptions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCity={filterCity}
          setFilterCity={setFilterCity}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageSchedule={setManagingScheduleGym}
          onManageSpecialSchedule={setManagingSpecialScheduleGym}
          deleteGymMutation={deleteGymMutation}
        />
      )}
    </div>
  );
};

