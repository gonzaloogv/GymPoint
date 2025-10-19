import React from 'react';
import { Card, Input, Button, Badge } from '../ui';

type FilterStatus = 'all' | 'active' | 'inactive' | 'expired';

interface RewardFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  expiredCount: number;
}

export const RewardFilters: React.FC<RewardFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  totalCount,
  activeCount,
  inactiveCount,
  expiredCount,
}) => {
  return (
    <Card className="mb-6">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="🔍 Buscar por nombre o descripción..."
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
            variant={filterStatus === 'active' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('active')}
          >
            Activas <Badge variant="active">{activeCount}</Badge>
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('inactive')}
          >
            Inactivas <Badge variant="inactive">{inactiveCount}</Badge>
          </Button>
          <Button
            variant={filterStatus === 'expired' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('expired')}
          >
            Expiradas <Badge variant="warning">{expiredCount}</Badge>
          </Button>
        </div>
      </div>
    </Card>
  );
};
