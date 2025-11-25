import React from 'react';
import { Card, Input, Button, Badge } from '../ui';
import { RoutineDifficulty } from '@/domain';

interface RoutineTemplateFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterDifficulty: 'ALL' | RoutineDifficulty;
  setFilterDifficulty: (difficulty: 'ALL' | RoutineDifficulty) => void;
  counts: {
    all: number;
    BEGINNER: number;
    INTERMEDIATE: number;
    ADVANCED: number;
  };
}

export const RoutineTemplateFilters: React.FC<RoutineTemplateFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterDifficulty,
  setFilterDifficulty,
  counts,
}) => {
  return (
    <Card>
      <div className="flex flex-wrap items-end gap-4">
        <Input
          placeholder="🔍 Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <div className="flex gap-2">
          <Button
            variant={filterDifficulty === 'ALL' ? 'primary' : 'secondary'}
            onClick={() => setFilterDifficulty('ALL')}
          >
            Todas <Badge variant="free">{counts.all}</Badge>
          </Button>
          <Button
            variant={filterDifficulty === 'BEGINNER' ? 'primary' : 'secondary'}
            onClick={() => setFilterDifficulty('BEGINNER')}
          >
            Principiante <Badge variant="active">{counts.BEGINNER}</Badge>
          </Button>
          <Button
            variant={filterDifficulty === 'INTERMEDIATE' ? 'primary' : 'secondary'}
            onClick={() => setFilterDifficulty('INTERMEDIATE')}
          >
            Intermedio <Badge variant="warning">{counts.INTERMEDIATE}</Badge>
          </Button>
          <Button
            variant={filterDifficulty === 'ADVANCED' ? 'primary' : 'secondary'}
            onClick={() => setFilterDifficulty('ADVANCED')}
          >
            Avanzado <Badge variant="danger">{counts.ADVANCED}</Badge>
          </Button>
        </div>
      </div>
    </Card>
  );
};
