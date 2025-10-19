import { useState, useMemo } from 'react';
import { 
  useRewards, 
  useCreateReward, 
  useUpdateReward, 
  useDeleteReward,
  useRewardStats
} from '../hooks';
import { 
  Loading, 
  Button, 
  RewardForm, 
  RewardStats, 
  RewardFilters, 
  RewardsList 
} from '../components';
import { CreateRewardDTO, UpdateRewardDTO, Reward } from '@/domain';

export const Rewards = () => {
  const { data: rewards, isLoading: rewardsLoading, isError: rewardsError, error: rewardsErrorData } = useRewards();
  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErrorData } = useRewardStats();
  const createRewardMutation = useCreateReward();
  const updateRewardMutation = useUpdateReward();
  const deleteRewardMutation = useDeleteReward();

  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApiError = (err: any, context: string) => {
    const errorMessage = err.response?.data?.error?.message || 'Ocurrió un error inesperado';
    console.error(`Error en ${context}:`, err);
    alert(`❌ Error al ${context}: ${errorMessage}`);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) {
      try {
        await deleteRewardMutation.mutateAsync(id);
        alert('✅ Recompensa eliminada con éxito');
      } catch (err) {
        handleApiError(err, 'eliminar la recompensa');
      }
    }
  };

  const handleSubmit = async (data: CreateRewardDTO) => {
    try {
      if (editingReward) {
        await updateRewardMutation.mutateAsync({ id_reward: editingReward.id_reward, ...data });
      } else {
        await createRewardMutation.mutateAsync(data);
      }
      alert(`✅ Recompensa ${editingReward ? 'actualizada' : 'creada'} con éxito`);
      setShowForm(false);
      setEditingReward(null);
    } catch (err) {
      handleApiError(err, editingReward ? 'actualizar la recompensa' : 'crear la recompensa');
    }
  };

  const filteredRewards = useMemo(() => {
    if (!rewards) return [];
    return rewards.filter((reward) => {
      const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) || reward.description.toLowerCase().includes(searchTerm.toLowerCase());
      const isExpired = new Date(reward.finish_date) < new Date();
      const isActive = reward.available && reward.stock > 0 && !isExpired;
      if (filterStatus === 'active') return isActive && matchesSearch;
      if (filterStatus === 'inactive') return !reward.available && matchesSearch;
      if (filterStatus === 'expired') return isExpired && matchesSearch;
      return matchesSearch;
    });
  }, [rewards, searchTerm, filterStatus]);

  const activeCount = useMemo(() => rewards?.filter(r => r.available && r.stock > 0 && new Date(r.finish_date) >= new Date()).length || 0, [rewards]);
  const inactiveCount = useMemo(() => rewards?.filter(r => !r.available).length || 0, [rewards]);
  const expiredCount = useMemo(() => rewards?.filter(r => new Date(r.finish_date) < new Date()).length || 0, [rewards]);

  const isLoading = rewardsLoading || statsLoading;

  if (isLoading) return <Loading fullPage />;

  if (rewardsError || statsError) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-danger">Error al Cargar las Recompensas</h1>
        {rewardsError && <p className="text-text-muted">{rewardsErrorData?.message}</p>}
        {statsError && <p className="text-text-muted">{statsErrorData?.message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">🎁 Gestión de Recompensas</h1>
          <p className="text-text-muted">Administra las recompensas que los usuarios pueden canjear por tokens</p>
        </div>
        {!showForm && <Button onClick={() => { setShowForm(true); setEditingReward(null); }} variant="primary">➕ Nueva Recompensa</Button>}
      </div>

      {showForm ? (
        <RewardForm 
          reward={editingReward || undefined} 
          onSubmit={handleSubmit} 
          onCancel={() => { setShowForm(false); setEditingReward(null); }} 
          isLoading={createRewardMutation.isPending || updateRewardMutation.isPending} 
        />
      ) : (
        <div className="space-y-6">
          <RewardStats stats={stats} />
          <RewardFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            totalCount={rewards?.length || 0}
            activeCount={activeCount}
            inactiveCount={inactiveCount}
            expiredCount={expiredCount}
          />
          <RewardsList 
            rewards={filteredRewards}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleteRewardMutation={deleteRewardMutation}
            clearSearch={() => setSearchTerm('')}
            hasActiveFilter={searchTerm !== '' || filterStatus !== 'all'}
          />
        </div>
      )}
    </div>
  );
};
