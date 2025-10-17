import { useState } from 'react';
import { useReviews, useReviewStats, useApproveReview, useDeleteReview } from '../hooks';
import { Card, Loading, ReviewCard } from '../components';

export const Reviews = () => {
  const { data: reviews, isLoading } = useReviews();
  const { data: stats } = useReviewStats();
  const approveReviewMutation = useApproveReview();
  const deleteReviewMutation = useDeleteReview();

  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const handleApprove = async (id: number, isApproved: boolean) => {
    const action = isApproved ? 'aprobar' : 'rechazar';
    if (window.confirm(`¿Estás seguro de ${action} esta review?`)) {
      try {
        await approveReviewMutation.mutateAsync({ id_review: id, is_approved: isApproved });
        alert(`✅ Review ${isApproved ? 'aprobada' : 'rechazada'} exitosamente`);
      } catch (error: any) {
        alert(`❌ Error: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta review?\n\nEsta acción no se puede deshacer.')) {
      try {
        await deleteReviewMutation.mutateAsync(id);
        alert('✅ Review eliminada exitosamente');
      } catch (error: any) {
        alert(`❌ Error: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  };

  // Filtrar reviews
  const filteredReviews = reviews?.filter((review) => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'approved' && review.is_approved) ||
      (filterStatus === 'pending' && !review.is_approved);

    const matchesSearch =
      !searchTerm ||
      review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.gym?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = filterRating === null || review.rating === filterRating;

    return matchesStatus && matchesSearch && matchesRating;
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="reviews-page">
      <div className="page-header">
        <div>
          <h2>⭐ Gestión de Reviews</h2>
          <p className="page-subtitle">
            {reviews?.length || 0} review{reviews?.length !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="reviews-stats-grid">
          <Card title="📊 Estadísticas Generales">
            <div className="stats-content">
              <div className="stat-item">
                <span className="stat-label">Total Reviews:</span>
                <span className="stat-value">{stats.total_reviews}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Calificación Promedio:</span>
                <span className="stat-value">⭐ {stats.avg_rating.toFixed(1)}/5</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Aprobadas:</span>
                <span className="stat-value approved">{stats.total_approved}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pendientes:</span>
                <span className="stat-value pending">{stats.total_pending}</span>
              </div>
            </div>
          </Card>

          <Card title="📈 Distribución por Rating">
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[`rating_${rating}` as keyof typeof stats.rating_distribution] || 0;
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                return (
                  <div key={rating} className="rating-bar">
                    <span className="rating-label">{rating}⭐</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card title="🔍 Filtros">
        <div className="reviews-filters">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por usuario, gimnasio o comentario..."
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
              <span className="filter-count">{reviews?.length || 0}</span>
            </button>
            <button
              className={`filter-tab ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              <span className="filter-icon">✅</span>
              Aprobadas
              <span className="filter-count">{reviews?.filter(r => r.is_approved).length || 0}</span>
            </button>
            <button
              className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              <span className="filter-icon">⏳</span>
              Pendientes
              <span className="filter-count">{reviews?.filter(r => !r.is_approved).length || 0}</span>
            </button>
          </div>

          <div className="rating-filters">
            <button
              className={`rating-filter ${filterRating === null ? 'active' : ''}`}
              onClick={() => setFilterRating(null)}
            >
              Todas las calificaciones
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                className={`rating-filter ${filterRating === rating ? 'active' : ''}`}
                onClick={() => setFilterRating(rating)}
              >
                {rating}⭐
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Lista de Reviews */}
      <Card title={`Reviews (${filteredReviews?.length || 0})`}>
        {(!filteredReviews || filteredReviews.length === 0) ? (
          <div className="empty-message">
            {searchTerm || filterStatus !== 'all' || filterRating !== null ? (
              <p>No se encontraron reviews con los filtros aplicados</p>
            ) : (
              <p>No hay reviews registradas en el sistema</p>
            )}
          </div>
        ) : (
          <div className="reviews-grid">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id_review}
                review={review}
                onApprove={handleApprove}
                onDelete={handleDelete}
                isProcessing={approveReviewMutation.isPending || deleteReviewMutation.isPending}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};


