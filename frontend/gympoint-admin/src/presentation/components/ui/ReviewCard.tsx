import { Review } from '@/domain';

interface ReviewCardProps {
  review: Review;
  onApprove: (id: number, isApproved: boolean) => void;
  onDelete: (id: number) => void;
  isProcessing?: boolean;
}

export const ReviewCard = ({ review, onApprove, onDelete, isProcessing }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`review-card ${review.is_approved ? 'approved' : 'pending'}`}>
      <div className="review-header">
        <div className="review-user-info">
          <span className="user-name">👤 {review.user?.name || 'Usuario'}</span>
          <span className="user-email">{review.user?.email || ''}</span>
        </div>
        <div className="review-status">
          {review.is_approved ? (
            <span className="badge badge-approved">✅ Aprobada</span>
          ) : (
            <span className="badge badge-pending">⏳ Pendiente</span>
          )}
        </div>
      </div>

      <div className="review-gym-info">
        <span className="gym-name">🏋️ {review.gym?.name || 'Gimnasio'}</span>
        {review.gym?.city && <span className="gym-city">📍 {review.gym.city}</span>}
      </div>

      <div className="review-rating">
        {renderStars(review.rating)}
        <span className="rating-number">({review.rating}/5)</span>
      </div>

      {review.comment && (
        <div className="review-comment">
          <p>"{review.comment}"</p>
        </div>
      )}

      <div className="review-date">
        <span>📅 {formatDate(review.review_date)}</span>
      </div>

      <div className="review-actions">
        {!review.is_approved && (
          <button
            onClick={() => onApprove(review.id_review, true)}
            className="btn-approve"
            disabled={isProcessing}
          >
            ✅ Aprobar
          </button>
        )}
        {review.is_approved && (
          <button
            onClick={() => onApprove(review.id_review, false)}
            className="btn-reject"
            disabled={isProcessing}
          >
            ❌ Rechazar
          </button>
        )}
        <button
          onClick={() => onDelete(review.id_review)}
          className="btn-delete"
          disabled={isProcessing}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};


