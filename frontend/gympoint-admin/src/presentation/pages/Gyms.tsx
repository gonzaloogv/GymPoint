import { useState } from 'react';
import { useGyms, useCreateGym, useUpdateGym, useDeleteGym, useGymTypes } from '../hooks';
import { Card, Loading, GymForm, GymCard, GymScheduleManager, GymSpecialScheduleManager } from '../components';
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

  const handleCreate = async (data: CreateGymDTO) => {
    try {
      await createGymMutation.mutateAsync(data);
      alert('✅ Gimnasio creado exitosamente');
      setShowForm(false);
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo crear el gimnasio'}`);
    }
  };

  const handleUpdate = async (data: UpdateGymDTO) => {
    try {
      await updateGymMutation.mutateAsync(data);
      alert('✅ Gimnasio actualizado exitosamente');
      setEditingGym(null);
      setShowForm(false);
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo actualizar el gimnasio'}`);
    }
  };

  const handleSubmit = async (data: CreateGymDTO | UpdateGymDTO) => {
    if (editingGym) {
      await handleUpdate(data as UpdateGymDTO);
    } else {
      await handleCreate(data);
    }
  };

  const handleEdit = (gym: Gym) => {
    setEditingGym(gym);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el gimnasio "${name}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await deleteGymMutation.mutateAsync(id);
        alert('✅ Gimnasio eliminado exitosamente');
      } catch (error: any) {
        alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo eliminar el gimnasio'}`);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGym(null);
  };

  // Filtrar gimnasios
  const filteredGyms = gyms?.filter((gym) => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gym.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !filterCity || gym.city === filterCity;
    return matchesSearch && matchesCity;
  });

  // Obtener ciudades únicas
  const cities = Array.from(new Set(gyms?.map(g => g.city) || [])).sort();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="gyms-page">
      <div className="page-header">
        <div>
          <h2>Gestión de Gimnasios</h2>
          <p className="page-subtitle">
            {gyms?.length || 0} gimnasio{gyms?.length !== 1 ? 's' : ''} registrado{gyms?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingGym(null);
            setShowForm(!showForm);
          }} 
          className="btn-primary"
        >
          {showForm ? '✕ Cancelar' : '+ Nuevo Gimnasio'}
        </button>
      </div>

      {showForm && (
        <Card title={editingGym ? `Editar: ${editingGym.name}` : 'Crear Nuevo Gimnasio'}>
          <GymForm
            gym={editingGym || undefined}
            gymTypes={gymTypes || []}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            isLoading={createGymMutation.isPending || updateGymMutation.isPending}
          />
        </Card>
      )}

      {!showForm && (
        <>
          <Card title="Filtros">
            <div className="filters-container">
              <div className="form-group">
                <label>🔍 Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="form-group">
                <label>📍 Ciudad</label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todas las ciudades</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || filterCity) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCity('');
                  }}
                  className="btn-secondary"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </Card>

          <Card title={`Gimnasios (${filteredGyms?.length || 0})`}>
            <div className="gyms-grid">
              {filteredGyms?.map((gym) => (
                <GymCard
                  key={gym.id_gym}
                  gym={gym}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onManageSchedule={(gym) => setManagingScheduleGym(gym)}
                  onManageSpecialSchedule={(gym) => setManagingSpecialScheduleGym(gym)}
                  isDeleting={deleteGymMutation.isPending}
                />
              ))}
            </div>

            {(!filteredGyms || filteredGyms.length === 0) && (
              <div className="empty-message">
                {searchTerm || filterCity ? (
                  <p>No se encontraron gimnasios con los filtros aplicados</p>
                ) : (
                  <p>No hay gimnasios registrados. ¡Crea el primero!</p>
                )}
              </div>
            )}
          </Card>

          {managingScheduleGym && !managingSpecialScheduleGym && (
            <Card title="">
              <button
                onClick={() => setManagingScheduleGym(null)}
                className="btn-secondary"
                style={{ marginBottom: '1rem' }}
              >
                ← Volver a la lista
              </button>
              <GymScheduleManager
                id_gym={managingScheduleGym.id_gym}
                gymName={managingScheduleGym.name}
              />
            </Card>
          )}

          {managingSpecialScheduleGym && !managingScheduleGym && (
            <Card title="">
              <button
                onClick={() => setManagingSpecialScheduleGym(null)}
                className="btn-secondary"
                style={{ marginBottom: '1rem' }}
              >
                ← Volver a la lista
              </button>
              <GymSpecialScheduleManager
                id_gym={managingSpecialScheduleGym.id_gym}
                gymName={managingSpecialScheduleGym.name}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
};
