import { useState } from 'react';
import { useGyms, useCreateGym, useDeleteGym, useGymTypes } from '../hooks';
import { Card, Loading } from '../components';
import { CreateGymDTO } from '@/domain';

export const Gyms = () => {
  const { data: gyms, isLoading } = useGyms();
  const { data: gymTypes } = useGymTypes();
  const createGymMutation = useCreateGym();
  const deleteGymMutation = useDeleteGym();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateGymDTO>({
    name: '',
    description: '',
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
    phone: '',
    email: '',
    website: '',
    social_media: '',
    gym_type: '',
    equipment: '',
    month_price: 0,
    week_price: 0,
    photo_url: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['latitude', 'longitude', 'month_price', 'week_price'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createGymMutation.mutateAsync(formData);
      alert('Gimnasio creado exitosamente');
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        city: '',
        address: '',
        latitude: 0,
        longitude: 0,
        phone: '',
        email: '',
        website: '',
        social_media: '',
        gym_type: '',
        equipment: '',
        month_price: 0,
        week_price: 0,
        photo_url: '',
      });
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error?.message || 'No se pudo crear el gimnasio'}`);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el gimnasio "${name}"?`)) {
      try {
        await deleteGymMutation.mutateAsync(id);
        alert('Gimnasio eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar el gimnasio');
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="gyms-page">
      <div className="page-header">
        <h2>Gestión de Gimnasios</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Nuevo Gimnasio'}
        </button>
      </div>

      {showForm && (
        <Card title="Agregar Nuevo Gimnasio">
          <form onSubmit={handleSubmit} className="gym-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Gimnasio Central"
                />
              </div>

              <div className="form-group">
                <label>Ciudad *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Resistencia"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe el gimnasio..."
              />
            </div>

            <div className="form-group">
              <label>Dirección *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Ej: Av. Sarmiento 1234"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Latitud *</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                  placeholder="-27.4511"
                />
              </div>

              <div className="form-group">
                <label>Longitud *</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                  placeholder="-58.9867"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+54 362 1234567"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="info@gimnasio.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sitio Web</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://gimnasio.com"
                />
              </div>

              <div className="form-group">
                <label>Redes Sociales</label>
                <input
                  type="text"
                  name="social_media"
                  value={formData.social_media}
                  onChange={handleInputChange}
                  placeholder="@gimnasiocentral"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Gimnasio *</label>
                <select name="gym_type" value={formData.gym_type} onChange={handleInputChange} required>
                  <option value="">Seleccionar...</option>
                  {gymTypes?.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Equipamiento *</label>
                <input
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Pesas, Máquinas, Cardio"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio Mensual *</label>
                <input
                  type="number"
                  step="0.01"
                  name="month_price"
                  value={formData.month_price}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Precio Semanal *</label>
                <input
                  type="number"
                  step="0.01"
                  name="week_price"
                  value={formData.week_price}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label>URL de Foto</label>
              <input
                type="url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={createGymMutation.isPending}>
                {createGymMutation.isPending ? 'Guardando...' : 'Guardar Gimnasio'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Lista de Gimnasios">
        <div className="gyms-grid">
          {gyms?.map((gym) => (
            <div key={gym.id_gym} className="gym-card">
              {gym.photo_url && (
                <div className="gym-photo">
                  <img src={gym.photo_url} alt={gym.name} />
                </div>
              )}
              <div className="gym-card-content">
                <h3>{gym.name}</h3>
                <p className="gym-city">{gym.city}</p>
                <p className="gym-description">{gym.description}</p>
                <div className="gym-details">
                  <span className="gym-type">{gym.gym_type}</span>
                  <span className="gym-price">${gym.month_price}/mes</span>
                </div>
                <div className="gym-actions">
                  <button
                    onClick={() => handleDelete(gym.id_gym, gym.name)}
                    className="btn-danger-sm"
                    disabled={deleteGymMutation.isPending}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!gyms || gyms.length === 0) && (
          <p className="empty-message">No hay gimnasios registrados</p>
        )}
      </Card>
    </div>
  );
};
