import { useState } from 'react';
import { useReviews, useReviewStats, useApproveReview, useDeleteReview } from '../hooks';
import { Card, Loading, Button, Input, Badge } from '../components';
import { ReviewCard } from '../components/ui/ReviewCard';

export const Reviews = () => {
  const { data: reviews, isLoading } = useReviews();
  const { data: stats } = useReviewStats();
  const approveReviewMutation = useApproveReview();
  const deleteReviewMutation = useDeleteReview();

  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const handleApprove = async (id: number, isApproved: boolean) => {
    await approveReviewMutation.mutateAsync({ id_review: id, is_approved: isApproved });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta review permanentemente?')) {
      await deleteReviewMutation.mutateAsync(id);
    }
  };

  const filteredReviews = reviews?.filter((review) => {
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'approved' && review.is_approved) || (filterStatus === 'pending' && !review.is_approved);
    const matchesSearch = !searchTerm || review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || review.gym?.name.toLowerCase().includes(searchTerm.toLowerCase()) || review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === null || review.rating === filterRating;
    return matchesStatus && matchesSearch && matchesRating;
  });

  if (isLoading) return <Loading fullPage />;

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">⭐ Gestión de Reviews</h1>
          <p className="text-text-muted">{reviews?.length || 0} reviews en el sistema</p>
        </div>
      </header>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card title="📊 Estadísticas Generales">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg p-3 rounded-lg text-center"><p className="text-sm text-text-muted">Total</p><p className="text-2xl font-bold">{stats.total_reviews}</p></div>
              <div className="bg-bg p-3 rounded-lg text-center"><p className="text-sm text-text-muted">Promedio</p><p className="text-2xl font-bold">⭐ {stats.avg_rating.toFixed(1)}</p></div>
              <div className="bg-bg p-3 rounded-lg text-center"><p className="text-sm text-text-muted">Aprobadas</p><p className="text-2xl font-bold text-success">{stats.total_approved}</p></div>
              <div className="bg-bg p-3 rounded-lg text-center"><p className="text-sm text-text-muted">Pendientes</p><p className="text-2xl font-bold text-warning">{stats.total_pending}</p></div>
            </div>
          </Card>
          <Card title="📈 Distribución por Rating">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[`rating_${rating}` as keyof typeof stats.rating_distribution] || 0;
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-8">{rating}⭐</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full"><div className="h-4 bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                    <span className="text-sm font-bold w-10 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <div className="space-y-4">
          <Input type="text" placeholder="🔍 Buscar por usuario, gimnasio o comentario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button variant={filterStatus === 'all' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('all')}>Todas <Badge variant="free">{reviews?.length || 0}</Badge></Button>
            <Button variant={filterStatus === 'approved' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('approved')}>Aprobadas <Badge variant="active">{reviews?.filter(r => r.is_approved).length || 0}</Badge></Button>
            <Button variant={filterStatus === 'pending' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('pending')}>Pendientes <Badge variant="pending">{reviews?.filter(r => !r.is_approved).length || 0}</Badge></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={filterRating === null ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterRating(null)}>Todas las estrellas</Button>
            {[5, 4, 3, 2, 1].map(r => <Button key={r} variant={filterRating === r ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterRating(r)}>{r}⭐</Button>)}
          </div>
        </div>
      </Card>

      {(!filteredReviews || filteredReviews.length === 0) ? (
        <div className="flex items-center justify-center min-h-[200px] text-text-muted">
          <p>No se encontraron reviews con los filtros aplicados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id_review} review={review} onApprove={handleApprove} onDelete={handleDelete} isProcessing={approveReviewMutation.isPending || deleteReviewMutation.isPending} />
          ))}
        </div>
      )}
    </div>
  );
};
