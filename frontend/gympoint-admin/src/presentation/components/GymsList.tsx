import React from 'react';
import { Gym } from '@/domain';
import { Card, Button, Input, Select } from './index';
import { GymCard } from './ui/GymCard';
import { UseMutationResult } from '@tanstack/react-query';

interface GymsListProps {
  gyms: Gym[];
  cityOptions: { value: string; label: string }[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCity: string;
  setFilterCity: (value: string) => void;
  onEdit: (gym: Gym) => void;
  onDelete: (id: number, name: string) => void;
  onManageSchedule: (gym: Gym) => void;
  onManageSpecialSchedule: (gym: Gym) => void;
  deleteGymMutation: UseMutationResult<void, Error, number, unknown>;
}

export const GymsList: React.FC<GymsListProps> = ({
  gyms,
  cityOptions,
  searchTerm,
  setSearchTerm,
  filterCity,
  setFilterCity,
  onEdit,
  onDelete,
  onManageSchedule,
  onManageSpecialSchedule,
  deleteGymMutation,
}) => {
  return (
    <section className="space-y-6" aria-label="Lista de Gimnasios">
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <Input
            label="🔍 Buscar"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select
            label="📍 Ciudad"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            options={cityOptions}
          />
          {(searchTerm || filterCity) && (
            <Button onClick={() => { setSearchTerm(''); setFilterCity(''); }} variant="secondary">Limpiar</Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gyms.map((gym) => (
          <GymCard
            key={gym.id_gym}
            gym={gym}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageSchedule={onManageSchedule}
            onManageSpecialSchedule={onManageSpecialSchedule}
            isDeleting={deleteGymMutation.isPending && deleteGymMutation.variables === gym.id_gym}
          />
        ))}
      </div>

      {gyms.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <p>{searchTerm || filterCity ? 'No se encontraron gimnasios con los filtros aplicados' : 'No hay gimnasios registrados. ¡Crea el primero!'}</p>
        </div>
      )}
    </section>
  );
};
