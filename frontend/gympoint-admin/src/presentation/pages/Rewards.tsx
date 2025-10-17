import { useState } from 'react';
import { 
  useRewards, 
  useCreateReward, 
  useUpdateReward, 
  useDeleteReward,
  useRewardStats
} from '../hooks';
import { Card, Loading, RewardForm, RewardCard } from '../components';
import { CreateRewardDTO, UpdateRewardDTO, Reward } from '@/domain';

export const Rewards = () => {
  const { data: rewards, isLoading, error } = useRewards();
  // Temporalmente deshabilitado hasta que se arregle el backend
  // const { data: stats, isLoading: isLoadingStats } = useRewardStats();
  const stats = null;
  const createRewardMutation = useCreateReward();
  const updateRewardMutation = useUpdateReward();
  const deleteRewardMutation = useDeleteReward();

  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar la recompensa "${name}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await deleteRewardMutation.mutateAsync(id);
        alert(`✅ Recompensa "${name}" eliminada con éxito`);
      } catch (err: any) {
        alert(`❌ Error al eliminar recompensa: ${err.response?.data?.error?.message || err.message}`);
      }
    }
  };

  const handleSubmit = async (data: CreateRewardDTO) => {
    try {
      if (editingReward) {
        const updateData: UpdateRewardDTO = {
          id_reward: editingReward.id_reward,
          ...data,
        };
        await updateRewardMutation.mutateAsync(updateData);
        alert('✅ Recompensa actualizada con éxito');
      } else {
        await createRewardMutation.mutateAsync(data);
        alert('✅ Recompensa creada con éxito');
      }
      setShowForm(false);
      setEditingReward(null);
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.error?.message || err.message}`);
    }
  };

  // Filter rewards
  const filteredRewards = rewards?.filter((reward) => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const finishDate = new Date(reward.finish_date);
    const isExpired = finishDate < now;
    const isActive = reward.available && reward.stock > 0 && !isExpired;
    
    if (filterStatus === 'active') return isActive && matchesSearch;
    if (filterStatus === 'inactive') return !reward.available && matchesSearch;
    if (filterStatus === 'expired') return isExpired && matchesSearch;
    return matchesSearch;
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="rewards-page">
        <h1>🎁 Gestión de Recompensas</h1>
        <p className="error-message">Error al cargar recompensas: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="rewards-page">
      <div className="page-header">
        <div>
          <h1>🎁 Gestión de Recompensas</h1>
          <p className="page-subtitle">
            Administra las recompensas que los usuarios pueden canjear por tokens
          </p>
        </div>
        {!showForm && (
          <button 
            onClick={() => {
              setShowForm(true);
              setEditingReward(null);
            }} 
            className="btn-primary"
          >
            ➕ Nueva Recompensa
          </button>
        )}
      </div>

      {/* Statistics */}
      {!showForm && stats && stats.length > 0 && (
        <Card title="📊 Estadísticas de Canjes">
          <div className="stats-grid">
            {stats.slice(0, 5).map((stat) => (
              <div key={stat.id_reward} className="stat-card">
                <div className="stat-label">{stat.name}</div>
                <div className="stat-value">{stat.total_canjes} canjes</div>
                <div className="stat-subtitle">{stat.total_tokens_gastados} tokens</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card title={editingReward ? 'Editar Recompensa' : 'Agregar Nueva Recompensa'}>
          <RewardForm
            reward={editingReward || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingReward(null);
            }}
            isLoading={createRewardMutation.isPending || updateRewardMutation.isPending}
          />
        </Card>
      )}

      {/* Filters and List */}
      {!showForm && (
        <>
          <div className="rewards-filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                <span className="filter-icon">📋</span>
                Todas
                <span className="filter-count">{rewards?.length || 0}</span>
              </button>
              <button
                className={`filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                <span className="filter-icon">✅</span>
                Activas
                <span className="filter-count">
                  {rewards?.filter(r => {
                    const now = new Date();
                    const finishDate = new Date(r.finish_date);
                    return r.available && r.stock > 0 && finishDate >= now;
                  }).length || 0}
                </span>
              </button>
              <button
                className={`filter-tab ${filterStatus === 'inactive' ? 'active' : ''}`}
                onClick={() => setFilterStatus('inactive')}
              >
                <span className="filter-icon">🚫</span>
                No Disponibles
                <span className="filter-count">
                  {rewards?.filter(r => !r.available).length || 0}
                </span>
              </button>
              <button
                className={`filter-tab ${filterStatus === 'expired' ? 'active' : ''}`}
                onClick={() => setFilterStatus('expired')}
              >
                <span className="filter-icon">⏰</span>
                Expiradas
                <span className="filter-count">
                  {rewards?.filter(r => new Date(r.finish_date) < new Date()).length || 0}
                </span>
              </button>
            </div>
          </div>

          <Card title={`Recompensas (${filteredRewards?.length || 0})`}>
            {filteredRewards && filteredRewards.length > 0 ? (
              <div className="rewards-grid">
                {filteredRewards.map((reward) => (
                  <RewardCard
                    key={reward.id_reward}
                    reward={reward}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deleteRewardMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-message">
                <p>📦 No hay recompensas que coincidan con los filtros</p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="btn-secondary">
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
