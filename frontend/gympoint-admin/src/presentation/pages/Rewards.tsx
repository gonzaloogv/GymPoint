import { useState } from 'react';
import { 
  useRewards, 
  useCreateReward, 
  useUpdateReward, 
  useDeleteReward,
  useRewardStats
} from '../hooks';
import { Card, Loading, Button, Input, Badge } from '../components';
import { RewardForm } from '../components/ui/RewardForm';
import { RewardCard } from '../components/ui/RewardCard';
import { CreateRewardDTO, UpdateRewardDTO, Reward } from '@/domain';

export const Rewards = () => {
  const { data: rewards, isLoading, error } = useRewards();
  const { data: stats } = useRewardStats();
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
    if (window.confirm(`¿Eliminar "${name}"?`)) {
      await deleteRewardMutation.mutateAsync(id);
    }
  };

  const handleSubmit = async (data: CreateRewardDTO) => {
    const mutation = editingReward ? updateRewardMutation.mutateAsync({ id_reward: editingReward.id_reward, ...data }) : createRewardMutation.mutateAsync(data);
    try {
      await mutation;
      alert(`✅ Recompensa ${editingReward ? 'actualizada' : 'creada'} con éxito`);
      setShowForm(false);
      setEditingReward(null);
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.error?.message || err.message}`);
    }
  };

  const filteredRewards = rewards?.filter((reward) => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) || reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isExpired = new Date(reward.finish_date) < new Date();
    const isActive = reward.available && reward.stock > 0 && !isExpired;
    if (filterStatus === 'active') return isActive && matchesSearch;
    if (filterStatus === 'inactive') return !reward.available && matchesSearch;
    if (filterStatus === 'expired') return isExpired && matchesSearch;
    return matchesSearch;
  });

  if (isLoading) return <Loading fullPage />;
  if (error) return <div className="p-6"><h1 className="text-xl font-bold">🎁 Gestión de Recompensas</h1><p className="text-danger">Error al cargar: {error.message}</p></div>;

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
        <Card title={editingReward ? 'Editar Recompensa' : 'Agregar Nueva Recompensa'}>
          <RewardForm reward={editingReward || undefined} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditingReward(null); }} isLoading={createRewardMutation.isPending || updateRewardMutation.isPending} />
        </Card>
      ) : (
        <div className="space-y-6">
          {stats && stats.length > 0 && (
            <Card title="📊 Estadísticas de Canjes">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.slice(0, 5).map((stat) => (
                  <div key={stat.id_reward} className="bg-bg p-4 rounded-lg text-center">
                    <div className="font-semibold text-text-muted text-sm">{stat.name}</div>
                    <div className="text-2xl font-bold text-primary">{stat.total_canjes} canjes</div>
                    <div className="text-xs text-text-muted">{stat.total_tokens_gastados} tokens</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <div className="space-y-4">
              <Input type="text" placeholder="🔍 Buscar por nombre o descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button variant={filterStatus === 'all' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('all')}>Todas <Badge variant="free">{rewards?.length || 0}</Badge></Button>
                <Button variant={filterStatus === 'active' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('active')}>Activas <Badge variant="active">{rewards?.filter(r => r.available && r.stock > 0 && new Date(r.finish_date) >= new Date()).length || 0}</Badge></Button>
                <Button variant={filterStatus === 'inactive' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('inactive')}>Inactivas <Badge variant="inactive">{rewards?.filter(r => !r.available).length || 0}</Badge></Button>
                <Button variant={filterStatus === 'expired' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('expired')}>Expiradas <Badge variant="warning">{rewards?.filter(r => new Date(r.finish_date) < new Date()).length || 0}</Badge></Button>
              </div>
            </div>
          </Card>

          {filteredRewards && filteredRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward) => (
                <RewardCard key={reward.id_reward} reward={reward} onEdit={handleEdit} onDelete={handleDelete} isDeleting={deleteRewardMutation.isPending && deleteRewardMutation.variables === reward.id_reward} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[200px] text-text-muted">
              <div className="text-center">
                <p className="text-lg">📦 No hay recompensas que coincidan</p>
                {searchTerm && <Button onClick={() => setSearchTerm('')} variant="secondary" className="mt-4">Limpiar búsqueda</Button>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
