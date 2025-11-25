import React from 'react';
import { Card, Input, Button, Badge } from '../ui';

interface ReviewFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: 'all' | 'approved' | 'pending';
  setFilterStatus: (status: 'all' | 'approved' | 'pending') => void;
  filterRating: number | null;
  setFilterRating: (rating: number | null) => void;
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterRating,
  setFilterRating,
  totalCount,
  approvedCount,
  pendingCount,
}) => {
  return (
    <Card className="mb-6">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="🔍 Buscar por usuario, gimnasio o comentario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('all')}
          >
            Todas <Badge variant="free">{totalCount}</Badge>
          </Button>
          <Button
            variant={filterStatus === 'approved' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('approved')}
          >
            Aprobadas <Badge variant="active">{approvedCount}</Badge>
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('pending')}
          >
            Pendientes <Badge variant="pending">{pendingCount}</Badge>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterRating === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterRating(null)}
          >
            Todas las estrellas
          </Button>
          {[5, 4, 3, 2, 1].map((r) => (
            <Button
              key={r}
              variant={filterRating === r ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterRating(r)}
            >
              {r}⭐
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
